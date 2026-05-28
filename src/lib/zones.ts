import Cookies from 'js-cookie';

export interface Zone {
  zoneId: string;
  zoneName: string;
  apiEnvKey: string;
  districts: string[];
}

export interface ZonesConfig {
  zones: Zone[];
}

// Map env keys to runtime values (baked in at build time via Next.js)
const ZONE_API_URLS: Record<string, string> = {
  NEXT_PUBLIC_ZONE_1_API: process.env.NEXT_PUBLIC_ZONE_1_API || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api',
  NEXT_PUBLIC_ZONE_2_API: process.env.NEXT_PUBLIC_ZONE_2_API || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api',
  NEXT_PUBLIC_ZONE_3_API: process.env.NEXT_PUBLIC_ZONE_3_API || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api',
  NEXT_PUBLIC_ZONE_4_API: process.env.NEXT_PUBLIC_ZONE_4_API || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api',
};

let _zonesData: ZonesConfig | null = null;

export async function loadZonesConfig(): Promise<ZonesConfig> {
  if (_zonesData) return _zonesData;
  try {
    const res = await fetch('/data/zones.json');
    _zonesData = await res.json();
    return _zonesData!;
  } catch {
    // Fallback inline (should not happen in production)
    _zonesData = { zones: [] };
    return _zonesData;
  }
}

export function getApiUrlForZone(zone: Zone): string {
  return ZONE_API_URLS[zone.apiEnvKey] || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
}

export function getZoneForDistrict(district: string, zones: Zone[]): Zone | null {
  const upper = district.toUpperCase();
  return zones.find(z => z.districts.map(d => d.toUpperCase()).includes(upper)) ?? null;
}

export function getAllDistricts(zones: Zone[]): string[] {
  return zones.flatMap(z => z.districts).sort();
}

// ── Session helpers (localStorage wrappers) ────────────────────────────────

export function saveZoneSession(district: string, zone: Zone): void {
  if (typeof window === 'undefined') return;
  Cookies.set('annapurna_district', district, { path: '/', sameSite: 'lax' });
  Cookies.set('annapurna_zone_id', zone.zoneId, { path: '/', sameSite: 'lax' });
  Cookies.set('annapurna_zone_name', zone.zoneName, { path: '/', sameSite: 'lax' });
}

export function getSessionZoneId(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get('annapurna_zone_id') || null;
}

export function getSessionDistrict(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get('annapurna_district') || null;
}
