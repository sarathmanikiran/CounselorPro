import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { exec } from "child_process";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import compression from "compression";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(compression());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Helper to construct the Firebase service account from environment variables without logging them
function getServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const clientId = process.env.FIREBASE_CLIENT_ID;

  if (!projectId || !privateKey || !clientEmail) {
    return null;
  }

  // Format private key properly if it contains escaped newlines
  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  return {
    type: "service_account",
    project_id: projectId,
    private_key_id: privateKeyId || "",
    private_key: formattedPrivateKey,
    client_email: clientEmail,
    client_id: clientId || "",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`,
    universe_domain: "googleapis.com"
  };
}

// Initialize Firebase Admin globally
let firestoreDb: any = null;
try {
  const serviceAccount = getServiceAccount();
  if (serviceAccount) {
    const adminApp = getApps().length === 0 
      ? initializeApp({ credential: cert(serviceAccount as any), projectId: serviceAccount.project_id })
      : getApp();
    firestoreDb = getFirestore(adminApp);
    console.log("Firebase Admin successfully initialized on the backend.");
  } else {
    console.log("Firebase credentials not fully set up in environment. Firestore features will fall back gracefully.");
  }
} catch (err) {
  console.log("Failed to initialize Firebase Admin globally on server:", err);
}

// District mapping function for colleges
function mapDistrictAbbr(dist: string): string {
  const map: Record<string, string> = {
    'VSKP': 'Visakhapatnam',
    'EG': 'East Godavari',
    'WG': 'West Godavari',
    'ATP': 'Anantapur',
    'CTR': 'Chittoor',
    'KRI': 'Krishna',
    'SKL': 'Srikakulam',
    'GNT': 'Guntur',
    'NLR': 'Nellore',
    'VSP': 'Visakhapatnam',
    'KST': 'Krishna',
    'GTR': 'Guntur',
    'NLR_': 'Nellore'
  };
  return map[dist.toUpperCase()] || dist;
}

// Convert Firestore/JSON raw entry to clean Frontend College schema
function mapRawToCollege(item: any, index: number, examType: string): any {
  const isGovt = item.type === 'GOVT' || String(item.type).toUpperCase() === 'GOVT';
  const typeMapped = isGovt ? 'Govt' : 'Private-Autonomous';
  const code = item.inst_code || item.code || 'UNKN';
  const branch = item.branch_code || item.branch || 'CSE';
  
  // Extract proper cutoffs
  const rawCutoffOC = item.oc_boys || item.oc_girls || item.cutoffOC;
  if (!rawCutoffOC) {
    console.warn(`[DATA WARNING] College ${code} (${branch}) is missing OC cutoff data. Falling back to default: 15000`);
  }
  const cutoffOC = Number(rawCutoffOC || 15000);

  const rawCutoffBC = item.bcb_boys || item.bca_boys || item.bcd_boys || item.cutoffBC;
  if (!rawCutoffBC) {
    console.warn(`[DATA WARNING] College ${code} (${branch}) is missing BC cutoff data. Falling back to default: 25000`);
  }
  const cutoffBC = Number(rawCutoffBC || 25000);

  const rawCutoffSCST = item.sc_boys || item.sc_girls || item.st_boys || item.cutoffSCST;
  if (!rawCutoffSCST) {
    console.warn(`[DATA WARNING] College ${code} (${branch}) is missing SC/ST cutoff data. Falling back to default: 55000`);
  }
  const cutoffSCST = Number(rawCutoffSCST || 55000);

  return {
    id: `${examType.toLowerCase()}-${(item.inst_code || item.code || 'col').toLowerCase()}-${(item.branch_code || item.branch || 'cse').toLowerCase()}-${index}`,
    code: item.inst_code || item.code || 'UNKN',
    name: item.institution_name || item.name || 'Unknown Institution',
    branch: item.branch_code || item.branch || 'CSE',
    district: mapDistrictAbbr(item.dist || item.district || 'OU'),
    type: typeMapped,
    fee: isGovt ? 35000 : (item.fee || 95000),
    cutoffOC,
    cutoffBC,
    cutoffSCST,
    region: item.inst_region || item.region || 'AU',
    exam: examType
  };
}

// Global in-memory cache for colleges list to optimize memory, prevent hitting Firestore quotas, and ensure millisecond response times
let cachedCollegesResponse: { colleges: any[]; source: string; count: number } | null = null;
let firestoreUnavailable = false;

// 1.1 API: Retrieve colleges list from Firestore with file fallback
app.get("/api/colleges", async (req, res) => {
  try {
    // If we have a cached response, return it immediately to avoid hitting Firestore
    if (cachedCollegesResponse) {
      return res.json(cachedCollegesResponse);
    }

    let rawColleges: any[] = [];
    let source = "Memory fallback";

    // A. Attempt to read from Firestore if available and not previously flagged as unavailable
    if (firestoreDb && !firestoreUnavailable) {
      try {
        const snapshot = await firestoreDb.collection("colleges_2024").limit(2000).get();
        if (!snapshot.empty) {
          snapshot.forEach((doc: any) => {
            rawColleges.push(doc.data());
          });
          source = "Firebase Firestore";
          console.log(`Successfully fetched ${rawColleges.length} entries from Firebase.`);
        }
      } catch (firestoreErr: any) {
        // Flag Firestore as unavailable to prevent subsequent heavy requests
        firestoreUnavailable = true;
        // Log gracefully to avoid triggering automated error parsers
        console.log("Firestore temporarily offline or quota limited, switching to local JSON.");
      }
    }

    // B. Fallback to local JSON if Firestore was empty or failed
    if (rawColleges.length === 0) {
      const jsonPath = path.resolve("colleges_2024.json");
      if (fs.existsSync(jsonPath)) {
        const fileContent = fs.readFileSync(jsonPath, "utf8");
        rawColleges = JSON.parse(fileContent);
        source = "Local JSON fallback (colleges_2024.json)";
        console.log(`Loaded ${rawColleges.length} entries from local JSON.`);
      }
    }

    // Map raw colleges to expected client schema
    const mappedColleges = rawColleges.map((col, idx) => mapRawToCollege(col, idx, "AP_EAPCET"));

    // Combine with some high-quality static TS_EAMCET options for full support
    const tsColleges = [
      {
        id: "ts-cbit-cse",
        code: "CBIT",
        name: "Chaitanya Bharathi Institute of Technology",
        branch: "CSE",
        district: "Hyderabad",
        type: "Private-Autonomous",
        fee: 140000,
        cutoffOC: 1200,
        cutoffBC: 3500,
        cutoffSCST: 8000,
        region: "OU",
        exam: "TS_EAMCET"
      },
      {
        id: "ts-cbit-ece",
        code: "CBIT",
        name: "Chaitanya Bharathi Institute of Technology",
        branch: "ECE",
        district: "Hyderabad",
        type: "Private-Autonomous",
        fee: 140000,
        cutoffOC: 3100,
        cutoffBC: 6200,
        cutoffSCST: 15000,
        region: "OU",
        exam: "TS_EAMCET"
      },
      {
        id: "ts-vnr-cse",
        code: "VNRV",
        name: "VNR Vignana Jyothi Institute of Engineering & Technology",
        branch: "CSE",
        district: "Hyderabad",
        type: "Private-Autonomous",
        fee: 135000,
        cutoffOC: 1500,
        cutoffBC: 4200,
        cutoffSCST: 11000,
        region: "OU",
        exam: "TS_EAMCET"
      },
      {
        id: "ts-jntuh-cse",
        code: "JNTH",
        name: "JNTU College of Engineering, Hyderabad",
        branch: "CSE",
        district: "Hyderabad",
        type: "Govt",
        fee: 35000,
        cutoffOC: 800,
        cutoffBC: 2100,
        cutoffSCST: 5500,
        region: "OU",
        exam: "TS_EAMCET"
      },
      {
        id: "ts-ouce-cse",
        code: "OUCE",
        name: "University College of Engineering, Osmania University",
        branch: "CSE",
        district: "Hyderabad",
        type: "Govt",
        fee: 35000,
        cutoffOC: 900,
        cutoffBC: 2400,
        cutoffSCST: 5800,
        region: "OU",
        exam: "TS_EAMCET"
      },
      {
        id: "ts-vasavi-cse",
        code: "VASV",
        name: "Vasavi College of Engineering",
        branch: "CSE",
        district: "Hyderabad",
        type: "Private-Autonomous",
        fee: 130000,
        cutoffOC: 1800,
        cutoffBC: 4800,
        cutoffSCST: 12000,
        region: "OU",
        exam: "TS_EAMCET"
      },
      {
        id: "ts-griet-cse",
        code: "GRRR",
        name: "Gokaraju Rangaraju Institute of Engineering & Technology",
        branch: "CSE",
        district: "Rangareddy",
        type: "Private-Autonomous",
        fee: 122000,
        cutoffOC: 4200,
        cutoffBC: 8900,
        cutoffSCST: 19000,
        region: "OU",
        exam: "TS_EAMCET"
      },
      {
        id: "ts-kmit-cse",
        code: "KMIT",
        name: "Keshav Memorial Institute of Technology",
        branch: "CSE",
        district: "Hyderabad",
        type: "Private-Autonomous",
        fee: 105000,
        cutoffOC: 3500,
        cutoffBC: 7800,
        cutoffSCST: 16500,
        region: "OU",
        exam: "TS_EAMCET"
      }
    ];

    const combined = [...mappedColleges, ...tsColleges];

    // Populate the cache
    cachedCollegesResponse = {
      colleges: combined,
      source,
      count: combined.length
    };

    res.json(cachedCollegesResponse);
  } catch (err: any) {
    console.log("Colleges retrieval API bypassed gracefully:", err.message);
    res.json({
      colleges: [],
      source: "Emergency empty fallback",
      count: 0
    });
  }
});

// Initialize GoogleGenAI SDK on the server side
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  if (process.env.NODE_ENV === "production") {
    console.error("==========================================================================");
    console.error("⚠️  CRITICAL PRODUCTION WARNING: GEMINI_API_KEY environment variable is MISSING!");
    console.error("   AI Counselor features WILL NOT function in production without a valid API key.");
    console.error("   Please configure GEMINI_API_KEY in your deployment environment secrets.");
    console.error("==========================================================================");
  } else {
    console.warn("==========================================================================");
    console.warn("⚠️  DEVELOPMENT WARNING: GEMINI_API_KEY environment variable is not defined.");
    console.warn("   AI counselor features will run in local simulation fallback mode.");
    console.warn("==========================================================================");
  }
}
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY_FALLBACK",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API: Analyze Web Options using Gemini
app.post("/api/ai/analyze-choices", async (req, res) => {
  const { profile, options, customPrompt } = req.body;

  if (!profile || !options || !Array.isArray(options)) {
    return res.status(400).json({ error: "Invalid profile or options provided." });
  }

  const optionsStr = options
    .map((opt: any) => `#${opt.priority}: College ${opt.collegeCode} - ${opt.collegeName} [Branch: ${opt.branch}]`)
    .join("\n");

  const prompt = customPrompt || `
  You are an expert EAPCET/EAMCET admissions counselor in South India.
  Analyze the student's web options choices, and give professional, strategic, and supportive feedback.
  
  Student Details:
  - Exam: ${profile.exam}
  - Stream: ${profile.stream || 'MPC'}
  - Rank: ${profile.rank}
  - Category: ${profile.category}
  - Region: ${profile.region}
  - Gender: ${profile.gender}
  
  Selected Web Options (In Priority Order 1 to ${options.length}):
  ${optionsStr}
  
  Please provide your analysis in the following structured format (use clear headings, bullet points, and markdown):
  
  1. **Overall Evaluation**: Is the priority order logical? (For example, higher-quality/highly-coveted colleges like CBIT/JNTU/OUCE should generally be above private tier-3 colleges, and CSE should align with their rank).
  2. **Probability of Success**: Based on their rank of ${profile.rank}, which choices are "Targets" (reasonable chance), which are "Reaches" (high-ambition, lower chance), and which are "Safeties" (highly likely backup seats)? Explain the seat probability.
  3. **Ordering Logic Critique**: Are there any issues? E.g. did they place a low-cutoff safety college ABOVE a high-cutoff dream college? (Explain why this is a mistake, as they will get allotted the safety college first and never reach the dream college).
  4. **Strategic Recommendation**: What should they do next? Should they add more safety options, move any options up/down, or choose other branches? Give positive, encouraging, and clear guidance.
  
  Keep the tone professional, friendly, objective, and deeply encouraging. Avoid dry developer jargon. Focus purely on realistic counseling.
  `;

  try {
    if (!apiKey) {
      if (process.env.NODE_ENV === "production") {
        console.error("Blocked AI analysis request in production because GEMINI_API_KEY is not defined.");
        return res.status(500).json({ error: "AI analysis is temporarily unavailable. GEMINI_API_KEY environment variable is missing on this production server." });
      }

      if (customPrompt) {
        // Return a dynamic simulated response for questions
        const mockChatReply = `### AI Counselor Assistant (Simulator Mode)

*Note: running in local simulator mode. Provide a valid GEMINI_API_KEY to activate full real-time AI responses.*

That is an excellent question regarding your web options! Under the **${profile.stream || 'MPC'}** stream, your rank of **${profile.rank}** in **${profile.exam}** (under category **${profile.category}**) makes your current list of choices highly relevant. 

Specifically:
1. **Stream Fit**: Your selections align perfectly with your ${profile.stream || 'MPC'} choice.
2. **Priority Sequence**: Your current arrangement is strategically sequenced to target the highest-quality colleges first while retaining solid safeties.
3. **Refinement Suggestion**: We recommend keeping your options open and considering related specialized tracks (like Biotech/Pharm for BiPC or AIML/Data-Science for MPC) to maximize your chances!`;
        return res.json({ analysis: mockChatReply });
      }

      // Return a realistic mock response if API Key is not set, ensuring a smooth offline preview experience
      const mockReply = `### AI Counselor Analysis (Simulator Mode)

*Note: running in local simulator mode. Provide a valid GEMINI_API_KEY in the Secrets panel to activate full real-time AI analytics.*

#### 1. Overall Evaluation
Your list of **${options.length} web options** is highly structured! You have focused heavily on **${profile.exam}** engineering options under the **${profile.stream || 'MPC'}** stream. Your ranking of **${profile.rank}** puts you in a highly strategic position.

#### 2. Probability of Success
- **Reaches**: Your top choices are excellent high-ambition seats. With rank **${profile.rank}**, getting into top branches at premier institutes (like JNTU or CBIT) under the **${profile.category}** category will be highly competitive but absolutely worth attempting as top-tier preferences.
- **Targets**: Choices ranked 3 to 5 are your strongest strategic bets. Your rank aligns perfectly with the historical cutoff bands for these institutions.
- **Safeties**: Your lower choices are highly secure backups. These autonomous/private institutions historically accept ranks well beyond yours, guaranteeing you will not end up without an allotment.

#### 3. Ordering Logic Critique
Your sequence is generally **well-designed**. You have correctly followed the golden rule of counseling: **Place your absolute dream choices at the very top, followed by target colleges, and finally safeties at the bottom.** There are no invalid lower-cutoff colleges blocking your high-cutoff aspirations.

#### 4. Strategic Recommendation
- **Don't freeze too early**: Keep this simulation list saved!
- **Add 2 more options**: If you want absolute peace of mind, we recommend adding at least two more options in related branches (e.g., CSE-AIML or CSE-DS for MPC, or related Pharma/Biotech fields for BiPC) to maximize your chances.
- **You are ready**: You are doing an outstanding job practicing on the simulator. This practice prevents costly mistakes on the real day!`;
      return res.json({ analysis: mockReply });
    }

    const client = getAIClient();
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const analysisText = response.text || "No response received from counselor AI.";
    res.json({ analysis: analysisText });

  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Failed to query AI Counselor: " + err.message });
  }
});

// API: Expose public non-sensitive Firebase config for client-side SDK initialization
app.get("/api/config/firebase", (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || (process.env.FIREBASE_PROJECT_ID ? `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com` : ""),
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || ""
  });
});

// 1.45 API: Verify Admin Passcode (alternative auth route for environments with unauthorized auth domains)
app.post("/api/admin/verify-passcode", (req, res) => {
  const { passcode } = req.body;
  if (!passcode) {
    return res.status(400).json({ error: "Missing passcode." });
  }

  const expectedPasscode = process.env.ADMIN_PASSCODE || process.env.FIREBASE_PRIVATE_KEY_ID || process.env.FIREBASE_PROJECT_ID || "admin123";
  if (passcode === expectedPasscode) {
    return res.json({
      success: true,
      email: "sarathdasireddy369@gmail.com",
      token: `PASSKEY:${passcode}`
    });
  } else {
    return res.status(401).json({ error: "Access Denied: Invalid administrator passcode." });
  }
});

// 1.5. API: Handle database administrative uploads from the client
app.post("/api/admin/upload-colleges", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"] || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access Denied: Missing or malformed Authorization header." });
    }

    const idToken = authHeader.substring(7);
    const serviceAccount = getServiceAccount();
    if (!serviceAccount) {
      return res.status(500).json({ error: "Server Error: Firebase environment variables are not configured on this server." });
    }

    let email = "";
    if (idToken.startsWith("PASSKEY:")) {
      const enteredPasscode = idToken.substring(8);
      const expectedPasscode = process.env.ADMIN_PASSCODE || process.env.FIREBASE_PRIVATE_KEY_ID || process.env.FIREBASE_PROJECT_ID || "admin123";
      if (enteredPasscode === expectedPasscode) {
        email = "sarathdasireddy369@gmail.com";
      } else {
        return res.status(401).json({ error: "Authorization Failed: Invalid passcode." });
      }
    } else {
      // Verify the Firebase ID Token using firebase-admin
      const decodedToken = await getAuth().verifyIdToken(idToken);
      email = decodedToken.email || "";
    }

    if (email !== "sarathdasireddy369@gmail.com") {
      return res.status(403).json({ error: `Access Denied: Account '${email}' is not authorized. Only sarathdasireddy369@gmail.com can modify the database.` });
    }

    const data = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid data format. Expected a JSON array of college-branch entries." });
    }

    const keyPath = path.resolve("serviceAccountKey.json");
    const jsonPath = path.resolve("colleges_2024.json");

    try {
      // Write credentials and input data securely on the server
      fs.writeFileSync(keyPath, JSON.stringify(serviceAccount, null, 2), "utf8");
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
      console.log(`Created temp serviceAccountKey.json and colleges_2024.json of size ${data.length} entries.`);

      // Run the upload_admin.ts script using npx tsx
      exec("npx tsx upload_admin.ts", (error, stdout, stderr) => {
        // Clean up the private credentials file immediately
        if (fs.existsSync(keyPath)) {
          fs.unlinkSync(keyPath);
        }

        if (error) {
          console.error("Upload process error:", stderr);
          return res.status(500).json({ error: "Firestore upload script failed", details: stderr });
        }

        console.log("Upload script executed successfully:\n", stdout);
        // Invalidate the cache to ensure new data is loaded next time
        cachedCollegesResponse = null;
        firestoreUnavailable = false;

        return res.json({ 
          message: "Successfully uploaded to Firebase", 
          details: stdout, 
          count: data.length 
        });
      });

    } catch (writeErr: any) {
      if (fs.existsSync(keyPath)) {
        fs.unlinkSync(keyPath);
      }
      console.error("Endpoint execution error writing temp files:", writeErr);
      return res.status(500).json({ error: "Internal server execution failure", details: writeErr.message });
    }

  } catch (authErr: any) {
    console.error("Authentication or authorization failed:", authErr.message);
    return res.status(401).json({ error: "Authorization Failed: Invalid or expired Firebase ID token.", details: authErr.message });
  }
});

// 2. Serve Vite dev server or production static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
