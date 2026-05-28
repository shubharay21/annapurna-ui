// Master data imported from the bundled JSON in /public/data/masterData.json
// This file re-exports typed arrays so components don't need raw fetch calls.
// The JSON is loaded once at module initialization via fetch.

export interface DocumentTypeOption {
  value: string;
  label: string;
}

export interface MasterData {
  districts: string[];
  genders: string[];
  categories: string[];
  rcTypes: string[];
  liftingStatuses: string[];
  landOwnershipTypes: string[];
  electricityProviders: string[];
  employmentNatures: string[];
  documentTypes: DocumentTypeOption[];
  schoolTypes: string[];
  benefitSchemes: string[];
}

let _cache: MasterData | null = null;

export async function loadMasterData(): Promise<MasterData> {
  if (_cache) return _cache;
  try {
    const res = await fetch('/data/masterData.json');
    _cache = await res.json();
    return _cache!;
  } catch {
    // Return empty structure so the app doesn't crash
    _cache = {
      districts: [],
      genders: ['Male', 'Female', 'Other'],
      categories: ['UR', 'EWS', 'SC', 'ST', 'OBC'],
      rcTypes: ['AAY', 'PHH', 'SPHH', 'RKSY-I', 'RKSY-II', 'Non-Subsidized'],
      liftingStatuses: ['Lifting Regularly', 'Not Lifting', 'Surrendered'],
      landOwnershipTypes: ['Own', 'Leased', 'Both'],
      electricityProviders: ['WBSEDCL', 'CESC'],
      employmentNatures: ['Government Sector', 'Salaried, in Private Sector', 'Others'],
      documentTypes: [
        { value: 'KCC', label: 'Kisan Credit Card (KCC)' },
        { value: 'MJCC', label: 'MGNREGA Job Card (MJCC)' },
        { value: 'Student CC', label: 'Student Credit Card' },
        { value: 'Others', label: 'Others' },
      ],
      schoolTypes: ['Govt School', 'Recognized Private School', 'Others'],
      benefitSchemes: ['Lakshmir Bhandar', 'Swasthya Sathi', 'Others'],
    };
    return _cache;
  }
}
