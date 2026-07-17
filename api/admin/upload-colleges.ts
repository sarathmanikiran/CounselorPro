import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";
import { getFirestoreDb, setCachedColleges, setFirestoreUnavailable } from "../_lib/index";

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
    if (!db) {
      return res.status(500).json({ error: "Server Error: Firebase environment variables are not configured on this server." });
    }

    // Verify the Firebase ID Token using firebase-admin Auth
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const email = decodedToken.email || "";

    if (email !== "sarathdasireddy369@gmail.com") {
      return res.status(403).json({ error: `Access Denied: Account '${email}' is not authorized. Only sarathdasireddy369@gmail.com can modify the database.` });
    }

    const data = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid data format. Expected a JSON array of college-branch entries." });
    }

    // Attempt to write backup colleges_2024.json file if writable (e.g. in local development)
    try {
      const jsonPath = path.join(process.cwd(), "colleges_2024.json");
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
      console.log(`Successfully backup-wrote colleges_2024.json locally with ${data.length} entries.`);
    } catch (writeErr: any) {
      console.log("Local filesystem is read-only or unwritable. Bypassing local JSON backup writing.");
    }

    // Upload directly to Firestore in batches of 500
    let successCount = 0;
    let failCount = 0;
    const batchSize = 500;
    let batch = db.batch();
    let currentBatchSize = 0;

    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      const docRef = db.collection('colleges_2024').doc();
      batch.set(docRef, entry);
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

    // Invalidate caches
    setCachedColleges(null);
    setFirestoreUnavailable(false);

    return res.json({ 
      message: "Successfully uploaded to Firebase", 
      details: `Successfully uploaded: ${successCount} documents. Failed to upload: ${failCount} documents.`, 
      count: data.length 
    });

  } catch (authErr: any) {
    console.error("Authentication or authorization failed:", authErr.message);
    return res.status(401).json({ error: "Authorization Failed: Invalid or expired Firebase ID token.", details: authErr.message });
  }
}
