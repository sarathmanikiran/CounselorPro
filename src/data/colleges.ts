import { College, ExamType } from '../types';

export let COLLEGES_DB: College[] = [];
export let COLLEGES_SOURCE = 'Initial State';

// In-memory client-side cache to prevent multiple network requests for the same file (Requirement 5)
const clientCache: Record<string, College[]> = {};

export function getExamGroup(exam: string | null, stream: 'MPC' | 'BiPC'): string {
  if (exam === 'AP_EAPCET') {
    return stream === 'BiPC' ? 'AP_EAPCET_BIPC' : 'AP_EAPCET_MPC';
  } else {
    // Default to TS_EAMCET or TS_EAPCET_BIPC
    return stream === 'BiPC' ? 'TS_EAPCET_BIPC' : 'TS_EAMCET';
  }
}

// Dynamically retrieve only the file the student needs based on their selection (Requirement 4)
export async function loadRealCollegesForExam(exam: ExamType | null, stream: 'MPC' | 'BiPC', year: number = 2025): Promise<number> {
  if (!exam) return 0;
  
  const examGroup = getExamGroup(exam, stream);
  const cacheKey = `${examGroup}_${year}`;

  // Serve from in-memory cache if available (Requirement 5)
  if (clientCache[cacheKey]) {
    console.log(`[CLIENT CACHE HIT] Serving ${clientCache[cacheKey].length} colleges for ${cacheKey} from cache.`);
    COLLEGES_DB.length = 0;
    COLLEGES_DB.push(...clientCache[cacheKey]);
    COLLEGES_SOURCE = `Static Cache (${examGroup})`;
    return COLLEGES_DB.length;
  }

  // Fetch only the specific static JSON file (Requirement 4)
  try {
    const filename = `${examGroup}_${year}.json`;
    console.log(`[CLIENT FETCHING] Requesting static data file: /data/${filename}`);
    const res = await fetch(`/data/${filename}`);
    if (!res.ok) {
      throw new Error(`Static file /data/${filename} returned status ${res.status}`);
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      clientCache[cacheKey] = data;
      COLLEGES_DB.length = 0;
      COLLEGES_DB.push(...data);
      COLLEGES_SOURCE = `Static File (${examGroup}_${year})`;
      console.log(`[CLIENT SUCCESS] Loaded and cached ${data.length} colleges from static JSON file.`);
      return data.length;
    }
  } catch (err) {
    console.warn(`[CLIENT FETCH WARN] Failed to load static JSON /data/${examGroup}_${year}.json:`, err);
    
    // Fallback to the dynamic /api/colleges route (Requirement 6)
    try {
      console.log(`[CLIENT FALLBACK] Fetching colleges from dynamic API path: /api/colleges?exam=${examGroup}&year=${year}`);
      const res = await fetch(`/api/colleges?exam=${examGroup}&year=${year}`);
      if (!res.ok) throw new Error('Dynamic API returned error');
      const data = await res.json();
      if (data && Array.isArray(data.colleges) && data.colleges.length > 0) {
        clientCache[cacheKey] = data.colleges;
        COLLEGES_DB.length = 0;
        COLLEGES_DB.push(...data.colleges);
        COLLEGES_SOURCE = data.source || 'Live Database Fallback';
        console.log(`[CLIENT SUCCESS] Loaded and cached ${data.colleges.length} colleges from dynamic API fallback.`);
        return data.colleges.length;
      }
    } catch (apiErr) {
      console.error('[CLIENT FATAL] All college retrieval strategies failed:', apiErr);
    }
  }

  return 0;
}

// Deprecated single load wrapper to retain backwards compatibility
export async function loadRealColleges(): Promise<number> {
  return loadRealCollegesForExam('AP_EAPCET', 'MPC', 2025);
}

// Helper to get cutoff based on student details
export function getCollegeCutoff(college: College, category: string): number {
  if (category.startsWith('BC')) {
    return college.cutoffBC;
  }
  if (category === 'SC' || category === 'ST') {
    return college.cutoffSCST;
  }
  return college.cutoffOC;
}

// Helper to determine AI allotment probability
export function getSeatProbability(college: College, rank: number, category: string): 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW' {
  const cutoff = getCollegeCutoff(college, category);
  
  if (rank <= cutoff * 0.8) {
    return 'HIGH';
  } else if (rank <= cutoff * 1.2) {
    return 'MEDIUM';
  } else if (rank <= cutoff * 1.8) {
    return 'LOW';
  } else {
    return 'VERY_LOW';
  }
}

// Helper to retrieve colleges adapted for a specific academic stream (MPC vs BiPC)
export function getCollegesForStream(stream: 'MPC' | 'BiPC'): College[] {
  // COLLEGES_DB is already pre-grouped and adapted on the server/static generation layer, so we return it directly!
  return COLLEGES_DB;
}
