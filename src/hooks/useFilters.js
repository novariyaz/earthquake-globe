import { useState, useCallback, useMemo } from 'react';

const DEFAULT_FILTERS = {
  minMagnitude: 0,
  maxMagnitude: 10,
  timeRange: '24h',   // '1h' | '24h' | '7d'
  depthRange: 'all',  // 'all' | 'shallow' | 'intermediate' | 'deep'
};

const DEPTH_RANGES = {
  all: { min: -Infinity, max: Infinity, label: 'All Depths' },
  shallow: { min: 0, max: 70, label: 'Shallow (0–70 km)' },
  intermediate: { min: 70, max: 300, label: 'Intermediate (70–300 km)' },
  deep: { min: 300, max: Infinity, label: 'Deep (300+ km)' },
};

export function useFilters() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const setMinMagnitude = useCallback((val) => {
    setFilters((prev) => ({ ...prev, minMagnitude: parseFloat(val) }));
  }, []);

  const setMaxMagnitude = useCallback((val) => {
    setFilters((prev) => ({ ...prev, maxMagnitude: parseFloat(val) }));
  }, []);

  const setTimeRange = useCallback((val) => {
    setFilters((prev) => ({ ...prev, timeRange: val }));
  }, []);

  const setDepthRange = useCallback((val) => {
    setFilters((prev) => ({ ...prev, depthRange: val }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const applyFilters = useCallback(
    (quakes) => {
      return quakes.filter((q) => {
        // Magnitude filter
        if (q.magnitude < filters.minMagnitude) return false;
        if (q.magnitude > filters.maxMagnitude) return false;

        // Depth filter
        const depthConfig = DEPTH_RANGES[filters.depthRange];
        if (depthConfig) {
          if (q.depth < depthConfig.min || q.depth >= depthConfig.max) return false;
        }

        return true;
      });
    },
    [filters]
  );

  return {
    filters,
    setMinMagnitude,
    setMaxMagnitude,
    setTimeRange,
    setDepthRange,
    resetFilters,
    applyFilters,
    DEPTH_RANGES,
  };
}
