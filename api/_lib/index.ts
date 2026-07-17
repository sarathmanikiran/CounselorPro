import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleGenAI } from "@google/genai";

export function getServiceAccount() {
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

// Lazy initialization of Firebase Admin
let firestoreDb: any = null;
let firestoreInitialized = false;

export function getFirestoreDb() {
  if (firestoreInitialized) {
    return firestoreDb;
  }

  try {
    const serviceAccount = getServiceAccount();
    if (serviceAccount) {
      const adminApp = getApps().length === 0 
        ? initializeApp({ credential: cert(serviceAccount as any), projectId: serviceAccount.project_id })
        : getApp();
      firestoreDb = getFirestore(adminApp);
      console.log("Firebase Admin successfully initialized on the serverless function.");
    } else {
      console.log("Firebase credentials not fully set up in environment. Firestore features will fall back gracefully.");
    }
  } catch (err) {
    console.log("Failed to initialize Firebase Admin in serverless lib:", err);
  }
  firestoreInitialized = true;
  return firestoreDb;
}

export function mapDistrictAbbr(dist: string): string {
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

export function mapRawToCollege(item: any, index: number, examType: string): any {
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

// Global cache objects that persist inside warm serverless containers
export let cachedCollegesResponse: { colleges: any[]; source: string; count: number } | null = null;
export let firestoreUnavailable = false;

export function setCachedColleges(value: { colleges: any[]; source: string; count: number } | null) {
  cachedCollegesResponse = value;
}

export function setFirestoreUnavailable(value: boolean) {
  firestoreUnavailable = value;
}

// AI Client
let aiClient: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

export function getAIClient(): GoogleGenAI {
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
