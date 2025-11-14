/**
 * Location ID mapping utility
 * Maps real map locations to crowd data location IDs
 */

// Location name to crowd ID mapping
export const LOCATION_TO_CROWD_ID_MAP: Record<string, string> = {
  'Starbucks Kızılay': 'starbucks_kizilay',
  'Kahve Dünyası Kızılay': 'kahve_dunyasi_kizilay', 
  'Migros Kızılay': 'migros_kizilay',
  'Ziraat Bankası Kızılay Şubesi': 'ziraat_bank_kizilay',
  'Kızılay Metro İstasyonu': 'kizilay_metro',
  'CarrefourSA Bilkent': 'carrefour_bilkent',
  'ANKAmall': 'ankamall',
  'Armada AVM': 'armada_avm',
  // Add more mappings as needed
};

// Reverse mapping - crowd ID to location name
export const CROWD_ID_TO_LOCATION_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(LOCATION_TO_CROWD_ID_MAP).map(([name, id]) => [id, name])
);

/**
 * Get crowd ID for a location
 */
export function getCrowdIdForLocation(locationName: string): string | null {
  // Try exact match first
  if (LOCATION_TO_CROWD_ID_MAP[locationName]) {
    return LOCATION_TO_CROWD_ID_MAP[locationName];
  }
  
  // Try partial match (case insensitive)
  const normalizedName = locationName.toLowerCase();
  for (const [name, id] of Object.entries(LOCATION_TO_CROWD_ID_MAP)) {
    if (name.toLowerCase().includes(normalizedName) || normalizedName.includes(name.toLowerCase())) {
      return id;
    }
  }
  
  return null;
}

/**
 * Get location name for a crowd ID
 */
export function getLocationNameForCrowdId(crowdId: string): string | null {
  return CROWD_ID_TO_LOCATION_MAP[crowdId] || null;
}

/**
 * Check if a location has crowd data
 */
export function hasLocationCrowdData(locationName: string): boolean {
  return getCrowdIdForLocation(locationName) !== null;
}