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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  try {
    // If cached response exists, return it immediately
    if (cachedCollegesResponse) {
      return res.json(cachedCollegesResponse);
    }

    let rawColleges: any[] = [];
    let rawTsColleges: any[] = [];
    let source = "Memory fallback";

    const firestoreDb = getFirestoreDb();

    // A. Attempt Firestore
    if (firestoreDb && !firestoreUnavailable) {
      try {
        const snapshot = await firestoreDb.collection("colleges_2024").limit(2000).get();
        if (!snapshot.empty) {
          snapshot.forEach((doc: any) => {
            const data = doc.data();
            if (data.exam === "TS_EAMCET") {
              rawTsColleges.push(data);
            } else {
              rawColleges.push(data);
            }
          });
          source = "Firebase Firestore";
          console.log(`Successfully fetched ${rawColleges.length} AP and ${rawTsColleges.length} TS entries from Firebase.`);
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

    if (rawTsColleges.length === 0) {
      const tsJsonPath = path.join(process.cwd(), "ts_colleges_2024.json");
      if (fs.existsSync(tsJsonPath)) {
        const fileContent = fs.readFileSync(tsJsonPath, "utf8");
        rawTsColleges = JSON.parse(fileContent);
        if (source.includes("Local JSON fallback")) {
          source = "Local JSON fallback (AP + TS)";
        } else {
          source += " + Local TS JSON";
        }
        console.log(`Loaded ${rawTsColleges.length} TS entries from local JSON.`);
      }
    }

    // Map raw colleges to expected client schema
    const mappedColleges = rawColleges.map((col, idx) => mapRawToCollege(col, idx, "AP_EAPCET"));
    const mappedTsColleges = rawTsColleges.map((col, idx) => mapRawToCollege(col, idx + mappedColleges.length, "TS_EAMCET"));
    const combined = [...mappedColleges, ...mappedTsColleges];

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
