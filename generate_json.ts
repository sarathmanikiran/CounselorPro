import { COLLEGES_DB } from './src/data/colleges';
import fs from 'fs';

const apColleges = COLLEGES_DB.filter(c => c.exam === 'AP_EAPCET');
const entries: any[] = [];

// Abbreviation lookup for district
const getDistAbbreviation = (district: string): string => {
  const map: Record<string, string> = {
    'Visakhapatnam': 'VSKP',
    'East Godavari': 'EG',
    'West Godavari': 'WG',
    'Anantapur': 'ATP',
    'Chittoor': 'CTR',
    'Krishna': 'KRI',
    'Srikakulam': 'SKL',
    'Guntur': 'GNT',
    'Nellore': 'NLR'
  };
  return map[district] || district.substring(0, 3).toUpperCase();
};

// Location lookup for place
const getCollegePlace = (code: string, district: string): string => {
  const map: Record<string, string> = {
    'AUCE': 'VISAKHAPATNAM',
    'JNTK': 'KAKINADA',
    'JNTA': 'ANANTAPUR',
    'SVUCE': 'TIRUPATI',
    'VRSE': 'VIJAYAWADA',
    'GVP': 'VISAKHAPATNAM',
    'PVPS': 'VIJAYAWADA',
    'GMRIT': 'RAJAM',
    'SVEC': 'TIRUPATI',
    'MITS': 'MADANAPALLE',
    'RVRJ': 'GUNTUR',
    'SRKR': 'BHIMAVARAM',
    'ANIT': 'SANGIVALASA',
    'RAGH': 'BHEEMUNIPATNAM',
    'NBKR': 'VIDYANAGAR',
    'VIGN': 'VISAKHAPATNAM'
  };
  return map[code] || district.toUpperCase();
};

// Affiliation lookup
const getAffiliation = (code: string, region: string): string => {
  if (code === 'AUCE') return 'AU';
  if (['JNTA', 'SVUCE', 'SVEC', 'MITS', 'NBKR'].includes(code)) return 'JNTUA';
  return 'JNTUK';
};

// Established year lookup
const getEstdYear = (code: string): string => {
  const map: Record<string, string> = {
    'AUCE': '1946',
    'JNTK': '1946',
    'JNTA': '1946',
    'SVUCE': '1959',
    'VRSE': '1977',
    'GVP': '1996',
    'PVPS': '1998',
    'GMRIT': '1997',
    'SVEC': '1992',
    'MITS': '1998',
    'RVRJ': '1985',
    'SRKR': '1980',
    'ANIT': '2001',
    'RAGH': '2001',
    'NBKR': '1979',
    'VIGN': '2008'
  };
  return map[code] || '2008';
};

apColleges.forEach((c, index) => {
  entries.push({
    sno: index + 1,
    inst_code: c.code,
    institution_name: c.name.toUpperCase(),
    type: c.type.toLowerCase().includes('govt') ? 'GOVT' : 'PVT',
    inst_region: c.region,
    dist: getDistAbbreviation(c.district),
    place: getCollegePlace(c.code, c.district),
    coed: 'COED',
    affiliation: getAffiliation(c.code, c.region),
    estd: getEstdYear(c.code),
    a_region: c.region,
    branch_code: c.branch,
    oc_boys: c.cutoffOC,
    oc_girls: c.cutoffOC,
    sc_boys: c.cutoffSCST,
    sc_girls: c.cutoffSCST,
    st_boys: Math.round(c.cutoffSCST * 1.15),
    st_girls: Math.round(c.cutoffSCST * 1.15),
    bca_boys: c.cutoffBC,
    bca_girls: c.cutoffBC,
    bcb_boys: c.cutoffBC,
    bcb_girls: c.cutoffBC,
    bcc_boys: c.cutoffBC,
    bcc_girls: c.cutoffBC,
    bcd_boys: c.cutoffBC,
    bcd_girls: c.cutoffBC,
    bce_boys: c.cutoffBC,
    bce_girls: c.cutoffBC,
    oc_ews_boys: null,
    oc_ews_girls: null
  });
});

fs.writeFileSync('colleges_2024.json', JSON.stringify(entries, null, 2));
console.log(`Generated colleges_2024.json with ${entries.length} entries.`);
