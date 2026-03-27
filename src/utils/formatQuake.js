import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Transform raw USGS GeoJSON feature into a clean object
 */
export function formatQuake(feature) {
  const { properties, geometry, id } = feature;
  const [lng, lat, depthKm] = geometry.coordinates;

  return {
    id: id || properties.code || `${lat}-${lng}-${properties.time}`,
    title: properties.title || properties.place || 'Unknown location',
    place: properties.place || 'Unknown',
    magnitude: properties.mag ?? 0,
    depth: depthKm ?? 0,
    time: properties.time,
    timeFormatted: dayjs(properties.time).format('MMM D, YYYY h:mm A'),
    timeAgo: dayjs(properties.time).fromNow(),
    lat,
    lng,
    url: properties.url,
    felt: properties.felt,
    tsunami: properties.tsunami,
    type: properties.type || 'earthquake',
    status: properties.status,
    alert: properties.alert,
  };
}

/**
 * Transform full USGS GeoJSON response into array of clean quake objects
 */
export function formatQuakeCollection(geojson) {
  if (!geojson?.features) return [];
  return geojson.features
    .filter((f) => f.geometry && f.geometry.coordinates)
    .map(formatQuake);
}

/**
 * Get the region from a USGS place string
 * e.g. "10km NNW of Anchorage, Alaska" → "Alaska"
 */
export function extractRegion(place) {
  if (!place) return 'Unknown';
  const parts = place.split(', ');
  return parts.length > 1 ? parts[parts.length - 1] : place;
}

/**
 * Format depth for display
 */
export function formatDepth(depth) {
  if (depth < 0) return 'Surface';
  if (depth < 70) return `${depth.toFixed(1)} km (Shallow)`;
  if (depth < 300) return `${depth.toFixed(1)} km (Intermediate)`;
  return `${depth.toFixed(1)} km (Deep)`;
}
