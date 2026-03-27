/**
 * Maps earthquake magnitude to a color and dot radius.
 * Green → Yellow → Orange → Red scale for M2 → M8+
 */

const MAGNITUDE_COLORS = [
  { threshold: 0, color: '#22c55e', label: '< 2.0' },     // Green – micro
  { threshold: 2, color: '#4ade80', label: '2.0–2.9' },    // Light green – minor
  { threshold: 3, color: '#a3e635', label: '3.0–3.9' },    // Yellow-green – minor
  { threshold: 4, color: '#eab308', label: '4.0–4.9' },    // Yellow – light
  { threshold: 5, color: '#f97316', label: '5.0–5.9' },    // Orange – moderate
  { threshold: 6, color: '#ef4444', label: '6.0–6.9' },    // Red – strong
  { threshold: 7, color: '#dc2626', label: '7.0–7.9' },    // Dark red – major
  { threshold: 8, color: '#991b1b', label: '8.0+' },       // Deep red – great
];

/**
 * Get color for a given magnitude
 */
export function getMagnitudeColor(mag) {
  const m = mag ?? 0;
  for (let i = MAGNITUDE_COLORS.length - 1; i >= 0; i--) {
    if (m >= MAGNITUDE_COLORS[i].threshold) {
      return MAGNITUDE_COLORS[i].color;
    }
  }
  return MAGNITUDE_COLORS[0].color;
}

/**
 * Get dot radius scaled by magnitude (0.15 to 1.2 relative units)
 */
export function getMagnitudeRadius(mag) {
  const m = Math.max(0, mag ?? 0);
  // Exponential scale for visual impact
  return 0.15 + Math.pow(m / 10, 1.8) * 3.5;
}

/**
 * Get altitude for 3D globe points (slight raise for larger quakes)
 */
export function getMagnitudeAltitude(mag) {
  const m = Math.max(0, mag ?? 0);
  return 0.005 + (m / 10) * 0.04;
}

/**
 * Returns legend items for the color scale
 */
export function getLegendItems() {
  return MAGNITUDE_COLORS.map(({ threshold, color, label }) => ({
    threshold,
    color,
    label,
  }));
}

/**
 * Should this quake pulse? (M6+)
 */
export function shouldPulse(mag) {
  return (mag ?? 0) >= 6;
}

export default {
  getMagnitudeColor,
  getMagnitudeRadius,
  getMagnitudeAltitude,
  getLegendItems,
  shouldPulse,
};
