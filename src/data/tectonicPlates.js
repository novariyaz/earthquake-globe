/**
 * Tectonic Plates Data Module
 * Uses the PB2002 dataset (Bird, 2003) — the gold standard for plate boundaries.
 * Fetches boundary GeoJSON at runtime from the public GitHub mirror.
 */

const BOUNDARIES_URL =
  'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';
const PLATES_URL =
  'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json';

// Full plate name mapping from PB2002 codes
export const PLATE_NAMES = {
  AF: 'African Plate',
  AN: 'Antarctic Plate',
  AP: 'Altiplano Plate',
  AR: 'Arabian Plate',
  AS: 'Aegean Sea Plate',
  AT: 'Anatolian Plate',
  AU: 'Australian Plate',
  BH: 'Birds Head Plate',
  BR: 'Balmoral Reef Plate',
  BS: 'Banda Sea Plate',
  BU: 'Burma Plate',
  CA: 'Caribbean Plate',
  CL: 'Caroline Plate',
  CO: 'Cocos Plate',
  CR: 'Conway Reef Plate',
  EA: 'Easter Plate',
  EU: 'Eurasian Plate',
  FT: 'Futuna Plate',
  GP: 'Galapagos Plate',
  IN: 'Indian Plate',
  JF: 'Juan de Fuca Plate',
  JZ: 'Juan Fernandez Plate',
  KE: 'Kermadec Plate',
  MA: 'Mariana Plate',
  MN: 'Manus Plate',
  MO: 'Maoke Plate',
  MS: 'Molucca Sea Plate',
  NA: 'North American Plate',
  NB: 'North Bismarck Plate',
  ND: 'North Andes Plate',
  NH: 'New Hebrides Plate',
  NI: 'Niuafo\'ou Plate',
  NZ: 'Nazca Plate',
  OK: 'Okhotsk Plate',
  ON: 'Okinawa Plate',
  PA: 'Pacific Plate',
  PM: 'Panama Plate',
  PS: 'Philippine Sea Plate',
  RI: 'Rivera Plate',
  SA: 'South American Plate',
  SB: 'South Bismarck Plate',
  SC: 'Scotia Plate',
  SL: 'Shetland Plate',
  SO: 'Somali Plate',
  SS: 'Solomon Sea Plate',
  SU: 'Sunda Plate',
  SW: 'Sandwich Plate',
  TI: 'Timor Plate',
  TO: 'Tonga Plate',
  WL: 'Woodlark Plate',
  YA: 'Yangtze Plate',
};

// Boundary type descriptions
export const BOUNDARY_TYPES = {
  'divergent': { label: 'Divergent', description: 'Plates moving apart', color: '#22d3ee', icon: '↔' },
  'convergent': { label: 'Convergent (Subduction)', description: 'One plate diving under another', color: '#f97316', icon: '→←' },
  'transform': { label: 'Transform', description: 'Plates sliding past each other', color: '#a78bfa', icon: '⇌' },
  'unknown': { label: 'Plate Boundary', description: 'Tectonic plate boundary', color: '#94a3b8', icon: '—' },
};

/**
 * Fetch and parse plate boundaries GeoJSON
 */
export async function fetchPlateBoundaries() {
  try {
    const response = await fetch(BOUNDARIES_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const geojson = await response.json();
    return parseBoundaries(geojson);
  } catch (err) {
    console.error('Failed to fetch plate boundaries:', err);
    return { paths: [], segments: [] };
  }
}

/**
 * Fetch plate polygons for point-in-plate lookup
 */
export async function fetchPlatePolygons() {
  try {
    const response = await fetch(PLATES_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const geojson = await response.json();
    return geojson.features.map((f) => ({
      code: f.properties.Code || f.properties.PlateName,
      name: PLATE_NAMES[f.properties.Code] || f.properties.PlateName || 'Unknown',
      geometry: f.geometry,
    }));
  } catch (err) {
    console.error('Failed to fetch plate polygons:', err);
    return [];
  }
}

/**
 * Parse boundary features into Globe.gl path data
 */
function parseBoundaries(geojson) {
  const paths = [];
  const segments = [];

  geojson.features.forEach((feature, idx) => {
    const props = feature.properties || {};
    const name = props.Name || '';
    const plateA = props.PlateA || '';
    const plateB = props.PlateB || '';

    // Determine boundary type from name hints
    let boundaryType = 'unknown';
    const nameLower = name.toLowerCase();
    if (nameLower.includes('ridge') || nameLower.includes('rift') || nameLower.includes('rise')) {
      boundaryType = 'divergent';
    } else if (nameLower.includes('trench') || nameLower.includes('subduction') || nameLower.includes('thrust')) {
      boundaryType = 'convergent';
    } else if (nameLower.includes('transform') || nameLower.includes('fault')) {
      boundaryType = 'transform';
    }

    const typeInfo = BOUNDARY_TYPES[boundaryType];
    const coords = extractCoords(feature.geometry);

    coords.forEach((ring) => {
      const pathCoords = ring.map(([lng, lat]) => ({ lat, lng }));
      if (pathCoords.length >= 2) {
        paths.push({
          coords: pathCoords,
          color: typeInfo.color,
          name,
          plateA,
          plateB,
          boundaryType,
          id: `boundary-${idx}`,
        });

        // Store segments for nearest-boundary lookup
        for (let i = 0; i < ring.length - 1; i++) {
          segments.push({
            lat1: ring[i][1],
            lng1: ring[i][0],
            lat2: ring[i + 1][1],
            lng2: ring[i + 1][0],
            plateA,
            plateB,
            boundaryType,
            name,
          });
        }
      }
    });
  });

  return { paths, segments };
}

/**
 * Extract coordinates from GeoJSON geometry
 */
function extractCoords(geometry) {
  if (!geometry) return [];
  switch (geometry.type) {
    case 'LineString':
      return [geometry.coordinates];
    case 'MultiLineString':
      return geometry.coordinates;
    case 'Polygon':
      return geometry.coordinates;
    case 'MultiPolygon':
      return geometry.coordinates.flat();
    default:
      return [];
  }
}

/**
 * Find nearest plate boundary to a given lat/lng
 * Returns { plateA, plateB, boundaryType, name, distance }
 */
export function findNearestBoundary(lat, lng, segments, maxDistKm = 500) {
  if (!segments || segments.length === 0) return null;

  let nearest = null;
  let minDist = Infinity;

  for (const seg of segments) {
    const dist = pointToSegmentDistance(lat, lng, seg.lat1, seg.lng1, seg.lat2, seg.lng2);
    if (dist < minDist) {
      minDist = dist;
      nearest = seg;
    }
  }

  if (minDist > maxDistKm) return null;

  return {
    plateA: PLATE_NAMES[nearest.plateA] || nearest.plateA,
    plateACode: nearest.plateA,
    plateB: PLATE_NAMES[nearest.plateB] || nearest.plateB,
    plateBCode: nearest.plateB,
    boundaryType: nearest.boundaryType,
    boundaryName: nearest.name,
    distanceKm: Math.round(minDist),
    ...BOUNDARY_TYPES[nearest.boundaryType],
  };
}

/**
 * Ray-casting point-in-polygon for plate identification
 */
export function findPlateForPoint(lat, lng, plates) {
  if (!plates || plates.length === 0) return null;

  for (const plate of plates) {
    if (isPointInPlate(lat, lng, plate.geometry)) {
      return { code: plate.code, name: plate.name };
    }
  }
  return null;
}

function isPointInPlate(lat, lng, geometry) {
  const rings = extractPolygonRings(geometry);
  for (const ring of rings) {
    if (pointInPolygon(lng, lat, ring)) return true;
  }
  return false;
}

function extractPolygonRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates[0]];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.map((p) => p[0]);
  return [];
}

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Haversine distance from a point to a line segment (approximate, in km)
 */
function pointToSegmentDistance(lat, lng, lat1, lng1, lat2, lng2) {
  const dAB = haversine(lat1, lng1, lat2, lng2);
  if (dAB === 0) return haversine(lat, lng, lat1, lng1);

  const t = Math.max(0, Math.min(1,
    ((lat - lat1) * (lat2 - lat1) + (lng - lng1) * (lng2 - lng1)) /
    ((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2)
  ));

  const closestLat = lat1 + t * (lat2 - lat1);
  const closestLng = lng1 + t * (lng2 - lng1);

  return haversine(lat, lng, closestLat, closestLng);
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Get a human-readable explanation of why an earthquake occurred
 */
export function getQuakeCause(boundaryInfo) {
  if (!boundaryInfo) {
    return {
      summary: 'Intraplate earthquake — occurred within a tectonic plate, possibly due to ancient faults or stress accumulation.',
      mechanism: 'Intraplate',
    };
  }

  const { plateA, plateB, boundaryType, boundaryName } = boundaryInfo;

  switch (boundaryType) {
    case 'divergent':
      return {
        summary: `The ${plateA} and ${plateB} are pulling apart at this divergent boundary${boundaryName ? ` (${boundaryName})` : ''}. Magma rises to fill the gap, causing shallow earthquakes.`,
        mechanism: 'Divergent — Plates pulling apart',
      };
    case 'convergent':
      return {
        summary: `At this convergent boundary${boundaryName ? ` (${boundaryName})` : ''}, the ${plateA} is colliding with the ${plateB}. One plate is being forced under the other (subduction), generating powerful earthquakes.`,
        mechanism: 'Convergent — Subduction zone',
      };
    case 'transform':
      return {
        summary: `The ${plateA} and ${plateB} are sliding horizontally past each other at this transform boundary${boundaryName ? ` (${boundaryName})` : ''}. Friction and sudden slips along the fault produce earthquakes.`,
        mechanism: 'Transform — Plates sliding past each other',
      };
    default:
      return {
        summary: `This earthquake occurred near the boundary between the ${plateA} and ${plateB}${boundaryName ? ` (${boundaryName})` : ''}.`,
        mechanism: 'Plate boundary interaction',
      };
  }
}
