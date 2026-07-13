import { College, ExamType } from '../types';

export let COLLEGES_DB: College[] = [
  // ==================== AP EAPCET COLLEGES ====================
  {
    id: "ap-auce-cse",
    code: "AUCE",
    name: "AU College of Engineering",
    branch: "CSE",
    district: "Visakhapatnam",
    type: "Govt",
    fee: 35000,
    cutoffOC: 1500,
    cutoffBC: 3200,
    cutoffSCST: 7500,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-auce-ece",
    code: "AUCE",
    name: "AU College of Engineering",
    branch: "ECE",
    district: "Visakhapatnam",
    type: "Govt",
    fee: 35000,
    cutoffOC: 3800,
    cutoffBC: 6500,
    cutoffSCST: 12000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-auce-eee",
    code: "AUCE",
    name: "AU College of Engineering",
    branch: "EEE",
    district: "Visakhapatnam",
    type: "Govt",
    fee: 35000,
    cutoffOC: 6500,
    cutoffBC: 11000,
    cutoffSCST: 18000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-auce-mech",
    code: "AUCE",
    name: "AU College of Engineering",
    branch: "MECH",
    district: "Visakhapatnam",
    type: "Govt",
    fee: 35000,
    cutoffOC: 11000,
    cutoffBC: 18000,
    cutoffSCST: 28000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-jntk-cse",
    code: "JNTK",
    name: "JNTU College of Engineering, Kakinada",
    branch: "CSE",
    district: "East Godavari",
    type: "Govt",
    fee: 10000,
    cutoffOC: 1800,
    cutoffBC: 4000,
    cutoffSCST: 8500,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-jntk-ece",
    code: "JNTK",
    name: "JNTU College of Engineering, Kakinada",
    branch: "ECE",
    district: "East Godavari",
    type: "Govt",
    fee: 10000,
    cutoffOC: 4200,
    cutoffBC: 7800,
    cutoffSCST: 15000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-jntk-inf",
    code: "JNTK",
    name: "JNTU College of Engineering, Kakinada",
    branch: "INF",
    district: "East Godavari",
    type: "Govt",
    fee: 10000,
    cutoffOC: 3200,
    cutoffBC: 6000,
    cutoffSCST: 11000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-jntk-eee",
    code: "JNTK",
    name: "JNTU College of Engineering, Kakinada",
    branch: "EEE",
    district: "East Godavari",
    type: "Govt",
    fee: 10000,
    cutoffOC: 7200,
    cutoffBC: 12500,
    cutoffSCST: 21000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-jnta-cse",
    code: "JNTA",
    name: "JNTU College of Engineering, Anantapur",
    branch: "CSE",
    district: "Anantapur",
    type: "Govt",
    fee: 10000,
    cutoffOC: 3800,
    cutoffBC: 7500,
    cutoffSCST: 14000,
    region: "SVU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-jnta-ece",
    code: "JNTA",
    name: "JNTU College of Engineering, Anantapur",
    branch: "ECE",
    district: "Anantapur",
    type: "Govt",
    fee: 10000,
    cutoffOC: 6800,
    cutoffBC: 12000,
    cutoffSCST: 22000,
    region: "SVU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-svuce-cse",
    code: "SVUCE",
    name: "SVU College of Engineering",
    branch: "CSE",
    district: "Chittoor",
    type: "Govt",
    fee: 15000,
    cutoffOC: 2800,
    cutoffBC: 5500,
    cutoffSCST: 10500,
    region: "SVU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-svuce-ece",
    code: "SVUCE",
    name: "SVU College of Engineering",
    branch: "ECE",
    district: "Chittoor",
    type: "Govt",
    fee: 15000,
    cutoffOC: 5000,
    cutoffBC: 9200,
    cutoffSCST: 17500,
    region: "SVU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-svuce-eee",
    code: "SVUCE",
    name: "SVU College of Engineering",
    branch: "EEE",
    district: "Chittoor",
    type: "Govt",
    fee: 15000,
    cutoffOC: 8500,
    cutoffBC: 15000,
    cutoffSCST: 26000,
    region: "SVU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-vrse-cse",
    code: "VRSE",
    name: "Velagapudi Ramakrishna Siddhartha Engg College",
    branch: "CSE",
    district: "Krishna",
    type: "Private-Autonomous",
    fee: 70000,
    cutoffOC: 4800,
    cutoffBC: 9800,
    cutoffSCST: 21000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-vrse-aiml",
    code: "VRSE",
    name: "Velagapudi Ramakrishna Siddhartha Engg College",
    branch: "CSE-AIML",
    district: "Krishna",
    type: "Private-Autonomous",
    fee: 70000,
    cutoffOC: 6200,
    cutoffBC: 12000,
    cutoffSCST: 24000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-vrse-ece",
    code: "VRSE",
    name: "Velagapudi Ramakrishna Siddhartha Engg College",
    branch: "ECE",
    district: "Krishna",
    type: "Private-Autonomous",
    fee: 70000,
    cutoffOC: 9500,
    cutoffBC: 17000,
    cutoffSCST: 32000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-gvp-cse",
    code: "GVP",
    name: "Gayatri Vidya Parishad College of Engineering",
    branch: "CSE",
    district: "Visakhapatnam",
    type: "Private-Autonomous",
    fee: 69000,
    cutoffOC: 5200,
    cutoffBC: 10500,
    cutoffSCST: 22000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-gvp-ece",
    code: "GVP",
    name: "Gayatri Vidya Parishad College of Engineering",
    branch: "ECE",
    district: "Visakhapatnam",
    type: "Private-Autonomous",
    fee: 69000,
    cutoffOC: 9800,
    cutoffBC: 18000,
    cutoffSCST: 33000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-pvps-cse",
    code: "PVPS",
    name: "Prasad V Potluri Siddhartha Inst of Tech",
    branch: "CSE",
    district: "Krishna",
    type: "Private-Autonomous",
    fee: 65000,
    cutoffOC: 8200,
    cutoffBC: 16500,
    cutoffSCST: 34000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-gmrit-cse",
    code: "GMRIT",
    name: "GMR Institute of Technology",
    branch: "CSE",
    district: "Srikakulam",
    type: "Private-Autonomous",
    fee: 65000,
    cutoffOC: 9500,
    cutoffBC: 19000,
    cutoffSCST: 38000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-gmrit-ece",
    code: "GMRIT",
    name: "GMR Institute of Technology",
    branch: "ECE",
    district: "Srikakulam",
    type: "Private-Autonomous",
    fee: 65000,
    cutoffOC: 15000,
    cutoffBC: 28000,
    cutoffSCST: 48000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-svec-cse",
    code: "SVEC",
    name: "Sree Vidyanikethan Engineering College",
    branch: "CSE",
    district: "Chittoor",
    type: "Private-Autonomous",
    fee: 72000,
    cutoffOC: 9200,
    cutoffBC: 18500,
    cutoffSCST: 37000,
    region: "SVU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-mits-cse",
    code: "MITS",
    name: "Madanapalle Institute of Technology & Science",
    branch: "CSE",
    district: "Chittoor",
    type: "Private-Autonomous",
    fee: 65000,
    cutoffOC: 12000,
    cutoffBC: 24000,
    cutoffSCST: 45000,
    region: "SVU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-mits-ece",
    code: "MITS",
    name: "Madanapalle Institute of Technology & Science",
    branch: "ECE",
    district: "Chittoor",
    type: "Private-Autonomous",
    fee: 65000,
    cutoffOC: 22000,
    cutoffBC: 39000,
    cutoffSCST: 68000,
    region: "SVU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-rvr-cse",
    code: "RVRJ",
    name: "RVR & JC College of Engineering",
    branch: "CSE",
    district: "Guntur",
    type: "Private-Autonomous",
    fee: 68000,
    cutoffOC: 6500,
    cutoffBC: 12500,
    cutoffSCST: 28000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-rvr-ece",
    code: "RVRJ",
    name: "RVR & JC College of Engineering",
    branch: "ECE",
    district: "Guntur",
    type: "Private-Autonomous",
    fee: 68000,
    cutoffOC: 11500,
    cutoffBC: 21000,
    cutoffSCST: 42000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-srkr-cse",
    code: "SRKR",
    name: "SRKR Engineering College",
    branch: "CSE",
    district: "West Godavari",
    type: "Private",
    fee: 65000,
    cutoffOC: 7000,
    cutoffBC: 14000,
    cutoffSCST: 30000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-anits-cse",
    code: "ANIT",
    name: "Anil Neerukonda Institute of Tech & Sciences",
    branch: "CSE",
    district: "Visakhapatnam",
    type: "Private-Autonomous",
    fee: 63000,
    cutoffOC: 8800,
    cutoffBC: 17000,
    cutoffSCST: 36000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-raghu-cse",
    code: "RAGH",
    name: "Raghu Engineering College",
    branch: "CSE",
    district: "Visakhapatnam",
    type: "Private-Autonomous",
    fee: 60000,
    cutoffOC: 14000,
    cutoffBC: 28000,
    cutoffSCST: 52000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-nbkr-cse",
    code: "NBKR",
    name: "NBKR Institute of Science & Technology",
    branch: "CSE",
    district: "Nellore",
    type: "Private-Autonomous",
    fee: 62000,
    cutoffOC: 16000,
    cutoffBC: 32000,
    cutoffSCST: 58000,
    region: "SVU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-vignan-cse",
    code: "VIGN",
    name: "Vignan's Institute of Information Technology",
    branch: "CSE",
    district: "Visakhapatnam",
    type: "Private-Autonomous",
    fee: 65000,
    cutoffOC: 10500,
    cutoffBC: 21000,
    cutoffSCST: 42000,
    region: "AU",
    exam: "AP_EAPCET"
  },
  {
    id: "ap-vignan-ece",
    code: "VIGN",
    name: "Vignan's Institute of Information Technology",
    branch: "ECE",
    district: "Visakhapatnam",
    type: "Private-Autonomous",
    fee: 65000,
    cutoffOC: 18000,
    cutoffBC: 32000,
    cutoffSCST: 55000,
    region: "AU",
    exam: "AP_EAPCET"
  },

  // ==================== TS EAMCET COLLEGES ====================
  {
    id: "ts-jnth-cse",
    code: "JNTH",
    name: "JNTU College of Engineering, Hyderabad",
    branch: "CSE",
    district: "Hyderabad",
    type: "Govt",
    fee: 18000,
    cutoffOC: 800,
    cutoffBC: 2000,
    cutoffSCST: 6500,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-jnth-ece",
    code: "JNTH",
    name: "JNTU College of Engineering, Hyderabad",
    branch: "ECE",
    district: "Hyderabad",
    type: "Govt",
    fee: 18000,
    cutoffOC: 2200,
    cutoffBC: 4800,
    cutoffSCST: 11000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-jnth-eee",
    code: "JNTH",
    name: "JNTU College of Engineering, Hyderabad",
    branch: "EEE",
    district: "Hyderabad",
    type: "Govt",
    fee: 18000,
    cutoffOC: 4200,
    cutoffBC: 8500,
    cutoffSCST: 18000,
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
    fee: 25000,
    cutoffOC: 1000,
    cutoffBC: 2500,
    cutoffSCST: 7200,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-ouce-ece",
    code: "OUCE",
    name: "University College of Engineering, Osmania University",
    branch: "ECE",
    district: "Hyderabad",
    type: "Govt",
    fee: 25000,
    cutoffOC: 2500,
    cutoffBC: 5200,
    cutoffSCST: 12000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-ouce-mech",
    code: "OUCE",
    name: "University College of Engineering, Osmania University",
    branch: "MECH",
    district: "Hyderabad",
    type: "Govt",
    fee: 25000,
    cutoffOC: 8500,
    cutoffBC: 16000,
    cutoffSCST: 26000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-cbit-cse",
    code: "CBIT",
    name: "Chaitanya Bharathi Institute of Technology",
    branch: "CSE",
    district: "Rangareddy",
    type: "Private-Autonomous",
    fee: 140000,
    cutoffOC: 1500,
    cutoffBC: 3500,
    cutoffSCST: 9800,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-cbit-aiml",
    code: "CBIT",
    name: "Chaitanya Bharathi Institute of Technology",
    branch: "CSE-AIML",
    district: "Rangareddy",
    type: "Private-Autonomous",
    fee: 140000,
    cutoffOC: 2100,
    cutoffBC: 4500,
    cutoffSCST: 11500,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-cbit-ece",
    code: "CBIT",
    name: "Chaitanya Bharathi Institute of Technology",
    branch: "ECE",
    district: "Rangareddy",
    type: "Private-Autonomous",
    fee: 140000,
    cutoffOC: 3800,
    cutoffBC: 7800,
    cutoffSCST: 16000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-cbit-inf",
    code: "CBIT",
    name: "Chaitanya Bharathi Institute of Technology",
    branch: "INF",
    district: "Rangareddy",
    type: "Private-Autonomous",
    fee: 140000,
    cutoffOC: 2600,
    cutoffBC: 5500,
    cutoffSCST: 13000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-vasavi-cse",
    code: "VCE",
    name: "Vasavi College of Engineering",
    branch: "CSE",
    district: "Hyderabad",
    type: "Private-Autonomous",
    fee: 130000,
    cutoffOC: 1800,
    cutoffBC: 4000,
    cutoffSCST: 10500,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-vasavi-ece",
    code: "VCE",
    name: "Vasavi College of Engineering",
    branch: "ECE",
    district: "Hyderabad",
    type: "Private-Autonomous",
    fee: 130000,
    cutoffOC: 4200,
    cutoffBC: 8500,
    cutoffSCST: 18000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-vnrj-cse",
    code: "VNRJ",
    name: "VNR Vignana Jyothi Institute of Engineering & Tech",
    branch: "CSE",
    district: "Rangareddy",
    type: "Private-Autonomous",
    fee: 135000,
    cutoffOC: 2400,
    cutoffBC: 5000,
    cutoffSCST: 12000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-vnrj-aiml",
    code: "VNRJ",
    name: "VNR Vignana Jyothi Institute of Engineering & Tech",
    branch: "CSE-AIML",
    district: "Rangareddy",
    type: "Private-Autonomous",
    fee: 135000,
    cutoffOC: 3000,
    cutoffBC: 6200,
    cutoffSCST: 14000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-vnrj-ece",
    code: "VNRJ",
    name: "VNR Vignana Jyothi Institute of Engineering & Tech",
    branch: "ECE",
    district: "Rangareddy",
    type: "Private-Autonomous",
    fee: 135000,
    cutoffOC: 4900,
    cutoffBC: 9500,
    cutoffSCST: 19500,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-griet-cse",
    code: "GRIET",
    name: "Gokaraju Rangaraju Institute of Engg & Tech",
    branch: "CSE",
    district: "Rangareddy",
    type: "Private-Autonomous",
    fee: 122000,
    cutoffOC: 3500,
    cutoffBC: 7500,
    cutoffSCST: 15500,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-griet-ece",
    code: "GRIET",
    name: "Gokaraju Rangaraju Institute of Engg & Tech",
    branch: "ECE",
    district: "Rangareddy",
    type: "Private-Autonomous",
    fee: 122000,
    cutoffOC: 6800,
    cutoffBC: 13000,
    cutoffSCST: 24000,
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
    fee: 115000,
    cutoffOC: 3200,
    cutoffBC: 7000,
    cutoffSCST: 15000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-vard-cse",
    code: "VARD",
    name: "Vardhaman College of Engineering",
    branch: "CSE",
    district: "Rangareddy",
    type: "Private-Autonomous",
    fee: 125000,
    cutoffOC: 4500,
    cutoffBC: 9200,
    cutoffSCST: 18000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-mvsr-cse",
    code: "MVSR",
    name: "MVSR Engineering College",
    branch: "CSE",
    district: "Rangareddy",
    type: "Private",
    fee: 115000,
    cutoffOC: 5800,
    cutoffBC: 11500,
    cutoffSCST: 22000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-mvsr-ece",
    code: "MVSR",
    name: "MVSR Engineering College",
    branch: "ECE",
    district: "Rangareddy",
    type: "Private",
    fee: 115000,
    cutoffOC: 11000,
    cutoffBC: 19500,
    cutoffSCST: 31000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-mgit-cse",
    code: "MGIT",
    name: "Mahatma Gandhi Institute of Technology",
    branch: "CSE",
    district: "Rangareddy",
    type: "Private-Autonomous",
    fee: 110000,
    cutoffOC: 6200,
    cutoffBC: 12500,
    cutoffSCST: 24000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-cvsr-cse",
    code: "CVSR",
    name: "Anurag University (CVSR)",
    branch: "CSE",
    district: "Medchal",
    type: "Private-Autonomous",
    fee: 125000,
    cutoffOC: 7500,
    cutoffBC: 14500,
    cutoffSCST: 28000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-vjiet-cse",
    code: "VJIT",
    name: "Vidya Jyothi Institute of Technology",
    branch: "CSE",
    district: "Rangareddy",
    type: "Private-Autonomous",
    fee: 105000,
    cutoffOC: 9200,
    cutoffBC: 18000,
    cutoffSCST: 34000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-cmr-cse",
    code: "CMRK",
    name: "CMR College of Engineering & Technology",
    branch: "CSE",
    district: "Medchal",
    type: "Private-Autonomous",
    fee: 100000,
    cutoffOC: 9800,
    cutoffBC: 19000,
    cutoffSCST: 36000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-mlrid-cse",
    code: "MLRD",
    name: "MLR Institute of Technology",
    branch: "CSE",
    district: "Medchal",
    type: "Private-Autonomous",
    fee: 110000,
    cutoffOC: 11500,
    cutoffBC: 22000,
    cutoffSCST: 41000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-iaer-cse",
    code: "IARE",
    name: "Institute of Aeronautical Engineering",
    branch: "CSE",
    district: "Medchal",
    type: "Private-Autonomous",
    fee: 90000,
    cutoffOC: 8500,
    cutoffBC: 16000,
    cutoffSCST: 32000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-sret-cse",
    code: "SRET",
    name: "Sreenidhi Institute of Science & Technology",
    branch: "CSE",
    district: "Rangareddy",
    type: "Private-Autonomous",
    fee: 130000,
    cutoffOC: 4000,
    cutoffBC: 8200,
    cutoffSCST: 17000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-tkrc-cse",
    code: "TKRC",
    name: "TKR College of Engineering & Technology",
    branch: "CSE",
    district: "Rangareddy",
    type: "Private",
    fee: 80000,
    cutoffOC: 15000,
    cutoffBC: 29000,
    cutoffSCST: 54000,
    region: "OU",
    exam: "TS_EAMCET"
  },
  {
    id: "ts-bvrith-cse",
    code: "BVRI",
    name: "BVRIT College of Engineering for Women",
    branch: "CSE",
    district: "Hyderabad",
    type: "Private-Autonomous",
    fee: 120000,
    cutoffOC: 5500,
    cutoffBC: 11000,
    cutoffSCST: 20000,
    region: "OU",
    exam: "TS_EAMCET"
  }
];

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

// Dynamically retrieve the real college database from the server API
export async function loadRealColleges(): Promise<number> {
  try {
    const res = await fetch('/api/colleges');
    if (!res.ok) throw new Error('Failed to fetch colleges list');
    const data = await res.json();
    if (data && Array.isArray(data.colleges) && data.colleges.length > 0) {
      // Clean target reference array and push the server dataset
      COLLEGES_DB.length = 0;
      COLLEGES_DB.push(...data.colleges);
      console.log(`Successfully mapped and populated ${data.colleges.length} real colleges from source: ${data.source}`);
      return data.colleges.length;
    }
  } catch (err) {
    console.error('Failed to populate real colleges database:', err);
  }
  return 0;
}

// Helper to retrieve colleges adapted for a specific academic stream (MPC vs BiPC)
export function getCollegesForStream(stream: 'MPC' | 'BiPC'): College[] {
  if (stream === 'MPC' || !stream) {
    return COLLEGES_DB;
  }

  // Return adapted list for BiPC stream
  return COLLEGES_DB.map((col, idx) => {
    let newBranch = 'PHARM';
    const br = col.branch.toUpperCase();
    if (br.includes('CSE') || br.includes('CS') || br.includes('COMP') || br.includes('INF') || br.includes('IT')) {
      newBranch = 'PHARM'; // B.Pharmacy
    } else if (br.includes('ECE') || br.includes('EC') || br.includes('ELECT')) {
      newBranch = 'AGRI'; // B.Sc. Agriculture
    } else if (br.includes('EEE') || br.includes('EE') || br.includes('BIO') || br.includes('BT')) {
      newBranch = 'BIOTECH'; // B.Tech Biotechnology
    } else if (br.includes('MECH') || br.includes('ME') || br.includes('CHEM') || br.includes('CH')) {
      newBranch = 'FOOD_TECH'; // B.Tech Food Technology
    } else if (br.includes('CIVIL') || br.includes('CE')) {
      newBranch = 'HORTI'; // B.Sc. Horticulture
    } else {
      newBranch = 'VET'; // B.V.Sc. Veterinary
    }

    return {
      ...col,
      branch: newBranch,
      // Modify ID slightly so they are unique distinct items for BiPC options
      id: `${col.id}-bipc-${idx}`
    };
  });
}

