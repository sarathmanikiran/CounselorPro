import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Define the target projectId
const projectId = 'counselorpro-6975d';

// 1. Initialize firebase-admin SDK
const serviceAccountPath = path.resolve('serviceAccountKey.json');
let app;
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: projectId
  });
  console.log('Firebase Admin initialized with serviceAccountKey.json');
} else {
  // Fall back to default credentials / project ID
  app = initializeApp({
    projectId: projectId
  });
  console.log(`Firebase Admin initialized with projectId: ${projectId} (Application Default Credentials)`);
}

const db = getFirestore(app);

async function uploadData() {
  const jsonPath = path.resolve('colleges_2024.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('Error: colleges_2024.json not found!');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Read ${data.length} entries from colleges_2024.json.`);

  let successCount = 0;
  let failCount = 0;

  // Batching writes for optimized performance (Firestore limit is 500 per batch)
  const batchSize = 500;
  let batch = db.batch();
  let currentBatchSize = 0;

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    
    // Create a new document in the "colleges_2024" collection
    const docRef = db.collection('colleges_2024').doc();
    
    // Upload the structured object directly to match the desired exact schema
    batch.set(docRef, entry);

    currentBatchSize++;

    if (currentBatchSize === batchSize || i === data.length - 1) {
      try {
        console.log(`Committing batch of ${currentBatchSize} documents...`);
        await batch.commit();
        successCount += currentBatchSize;
        // Reset batch
        batch = db.batch();
        currentBatchSize = 0;
      } catch (error) {
        console.error(`Failed to commit batch:`, error);
        failCount += currentBatchSize;
        // Reset batch
        batch = db.batch();
        currentBatchSize = 0;
      }
    }
  }

  console.log('\n======================================');
  console.log(`Upload completed!`);
  console.log(`Successfully uploaded: ${successCount} documents`);
  console.log(`Failed to upload: ${failCount} documents`);
  console.log('======================================');
}

uploadData().catch(err => {
  console.error('Fatal error running upload script:', err);
});
