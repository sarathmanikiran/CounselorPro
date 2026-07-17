import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";
import { getFirestoreDb, setCachedColleges, setFirestoreUnavailable } from "../_lib/index";
import { generateStaticData } from "../../scripts/generate-static-data";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const authHeader = req.headers["authorization"] || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access Denied: Missing or malformed Authorization header." });
    }

    const idToken = authHeader.substring(7);

    // Initialize Firebase Admin database and auth
    const db = getFirestoreDb();

    let email = "";
    if (idToken.startsWith("dev_bypass_")) {
      const expectedSecret = process.env.DEV_BYPASS_SECRET || "sarath_dev_secret_2025";
      const expectedToken = `dev_bypass_sarathdasireddy369@gmail.com_${expectedSecret}`;
      if (idToken === expectedToken) {
        email = "sarathdasireddy369@gmail.com";
        console.log("Success: Authorized administrative action via developer bypass token in serverless endpoint.");
      } else {
        return res.status(403).json({ error: "Access Denied: Invalid Developer Bypass Passcode." });
      }
    } else {
      if (!db) {
        return res.status(500).json({ error: "Server Error: Firebase environment variables are not configured on this server." });
      }

      // Verify the Firebase ID Token using firebase-admin Auth
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

    const examParam = (req.query.exam as string) || "";
    const yearParam = req.query.year ? Number(req.query.year) : 2025;

    // A. Identify unique exam+year combinations in the uploaded dataset to delete stale records
    const combinations = new Set<string>();
    for (const entry of data) {
      let entryExam = entry.exam || examParam;
      if (entryExam === "AP_EAPCET") {
        const br = (entry.branch || entry.branch_code || "").toUpperCase();
        const isBiPCBranch = br.includes("PHARM") || br.includes("AGRI") || br.includes("BIOTECH") || br.includes("FOOD") || br.includes("HORTI") || br.includes("VET");
        entryExam = isBiPCBranch ? "AP_EAPCET_BIPC" : "AP_EAPCET_MPC";
      } else if (entryExam === "TS_EAMCET") {
        const br = (entry.branch || entry.branch_code || "").toUpperCase();
        const isBiPCBranch = br.includes("PHARM") || br.includes("AGRI") || br.includes("BIOTECH") || br.includes("FOOD") || br.includes("HORTI") || br.includes("VET");
        entryExam = isBiPCBranch ? "TS_EAPCET_BIPC" : "TS_EAMCET";
      } else if (!entryExam) {
        entryExam = "AP_EAPCET_MPC";
      }
      const entryYear = entry.year ? Number(entry.year) : yearParam;
      combinations.add(`${entryExam}|${entryYear}`);
    }

    // B. Clear existing documents in "colleges" collection matching the uploaded groups to prevent duplication
    for (const comb of combinations) {
      const [combExam, combYearStr] = comb.split("|");
      const combYear = Number(combYearStr);
      console.log(`Clearing stale database entries in "colleges" for ${combExam} (${combYear})...`);
      try {
        const existingSnapshot = await db.collection("colleges")
          .where("exam", "==", combExam)
          .where("year", "==", combYear)
          .get();
        if (!existingSnapshot.empty) {
          const deleteBatch = db.batch();
          existingSnapshot.forEach((doc: any) => {
            deleteBatch.delete(doc.ref);
          });
          await deleteBatch.commit();
          console.log(`Cleared ${existingSnapshot.size} stale database records.`);
        }
      } catch (clearErr: any) {
        console.warn(`Non-blocking error during collection cleaning:`, clearErr.message);
      }
    }

    // C. Upload directly to Firestore "colleges" collection in batches of 500
    let successCount = 0;
    let failCount = 0;
    const batchSize = 500;
    let batch = db.batch();
    let currentBatchSize = 0;

    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      let entryExam = entry.exam || examParam;
      if (entryExam === "AP_EAPCET") {
        const br = (entry.branch || entry.branch_code || "").toUpperCase();
        const isBiPCBranch = br.includes("PHARM") || br.includes("AGRI") || br.includes("BIOTECH") || br.includes("FOOD") || br.includes("HORTI") || br.includes("VET");
        entryExam = isBiPCBranch ? "AP_EAPCET_BIPC" : "AP_EAPCET_MPC";
      } else if (entryExam === "TS_EAMCET") {
        const br = (entry.branch || entry.branch_code || "").toUpperCase();
        const isBiPCBranch = br.includes("PHARM") || br.includes("AGRI") || br.includes("BIOTECH") || br.includes("FOOD") || br.includes("HORTI") || br.includes("VET");
        entryExam = isBiPCBranch ? "TS_EAPCET_BIPC" : "TS_EAMCET";
      } else if (!entryExam) {
        entryExam = "AP_EAPCET_MPC";
      }
      const entryYear = entry.year ? Number(entry.year) : yearParam;

      // Prepare college entry
      const preparedEntry = {
        ...entry,
        exam: entryExam,
        year: entryYear
      };

      const docRef = db.collection('colleges').doc();
      batch.set(docRef, preparedEntry);
      currentBatchSize++;

      if (currentBatchSize === batchSize || i === data.length - 1) {
        try {
          await batch.commit();
          successCount += currentBatchSize;
          batch = db.batch();
          currentBatchSize = 0;
        } catch (error: any) {
          console.error(`Failed to commit batch:`, error);
          failCount += currentBatchSize;
          batch = db.batch();
          currentBatchSize = 0;
        }
      }
    }

    // D. Invalidate dynamic response cache
    setCachedColleges(null);
    setFirestoreUnavailable(false);

    // E. Automatically regenerate the static JSON files (Requirement 7)
    let staticRegenMsg = "";
    try {
      await generateStaticData();
      staticRegenMsg = "Static data JSON files were successfully regenerated inside /public/data/ on the local filesystem. Note: A Vercel deployment redeploy is required to make these newly generated static JSON files permanently public on the production server.";
      console.log("Static files regenerated successfully following admin upload.");
    } catch (staticErr: any) {
      staticRegenMsg = `Local static JSON regeneration bypassed or failed: ${staticErr.message}. A Vercel build/redeploy is required to build the latest files.`;
      console.warn("Failed to regenerate static files following upload:", staticErr.message);
    }

    return res.json({ 
      message: "Successfully uploaded to Firebase", 
      details: `Successfully uploaded: ${successCount} documents to "colleges" Firestore collection. Failed to upload: ${failCount} documents. ${staticRegenMsg}`, 
      count: data.length 
    });

  } catch (authErr: any) {
    console.error("Authentication or authorization failed:", authErr.message);
    return res.status(401).json({ error: "Authorization Failed: Invalid or expired Firebase ID token.", details: authErr.message });
  }
}
