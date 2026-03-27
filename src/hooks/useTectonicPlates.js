import { useState, useEffect, useCallback } from 'react';
import {
  fetchPlateBoundaries,
  fetchPlatePolygons,
  findNearestBoundary,
  findPlateForPoint,
  getQuakeCause,
} from '../data/tectonicPlates';

export function useTectonicPlates() {
  const [boundaries, setBoundaries] = useState({ paths: [], segments: [] });
  const [plates, setPlates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBoundaries, setShowBoundaries] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      const [boundaryData, plateData] = await Promise.all([
        fetchPlateBoundaries(),
        fetchPlatePolygons(),
      ]);

      if (!cancelled) {
        setBoundaries(boundaryData);
        setPlates(plateData);
        setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  /**
   * Get tectonic context for a specific earthquake
   */
  const getPlateInfo = useCallback(
    (lat, lng) => {
      // Find nearest boundary
      const boundaryInfo = findNearestBoundary(lat, lng, boundaries.segments, 800);

      // Find which plate the quake is on
      const plateInfo = findPlateForPoint(lat, lng, plates);

      // Get human-readable cause
      const cause = getQuakeCause(boundaryInfo);

      return {
        boundary: boundaryInfo,
        plate: plateInfo,
        cause,
      };
    },
    [boundaries.segments, plates]
  );

  const toggleBoundaries = useCallback(() => {
    setShowBoundaries((prev) => !prev);
  }, []);

  return {
    boundaries,
    plates,
    loading,
    showBoundaries,
    toggleBoundaries,
    getPlateInfo,
  };
}
