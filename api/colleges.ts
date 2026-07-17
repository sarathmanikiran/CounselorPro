import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";
import { 
  getFirestoreDb, 
  mapRawToCollege, 
  cachedCollegesResponse, 
  setCachedColleges, 
  firestoreUnavailable, 
  setFirestoreUnavailable 
} from "./_lib/index";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(451).json({ error: "Method not allowed. Use GET." });
  }

  try {
    // If cached response exists, return it immediately
    if (cachedCollegesResponse) {
      return res.json(cachedCollegesResponse);
    }

    let rawColleges: any[] = [];
    let source = "Memory fallback";

    const firestoreDb = getFirestoreDb();

    // A. Attempt Firestore
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
        setFirestoreUnavailable(true);
        console.log("Firestore temporarily offline or quota limited, switching to local JSON.");
      }
    }

    // B. Fallback to local JSON
    if (rawColleges.length === 0) {
      const jsonPath = path.join(process.cwd(), "colleges_2024.json");
      if (fs.existsSync(jsonPath)) {
        const fileContent = fs.readFileSync(jsonPath, "utf8");
        rawColleges = JSON.parse(fileContent);
        source = "Local JSON fallback (colleges_2024.json)";
        console.log(`Loaded ${rawColleges.length} entries from local JSON.`);
      }
    }

    // Map raw colleges to expected client schema
    const mappedColleges = rawColleges.map((col, idx) => mapRawToCollege(col, idx, "AP_EAPCET"));
    const combined = [...mappedColleges, ...tsColleges];

    const finalResponse = {
      colleges: combined,
      source,
      count: combined.length
    };

    // Populate local function state cache
    setCachedColleges(finalResponse);

    return res.json(finalResponse);
  } catch (err: any) {
    console.log("Colleges retrieval serverless API bypassed gracefully:", err.message);
    return res.json({
      colleges: [],
      source: "Emergency empty fallback",
      count: 0
    });
  }
}
