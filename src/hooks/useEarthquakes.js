import { useState, useEffect, useCallback, useRef } from 'react';
import { formatQuakeCollection } from '../utils/formatQuake';

const ENDPOINTS = {
  '1h': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
  '24h': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
  '7d': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson',
};

const POLL_INTERVAL = 60_000; // 60 seconds

export function useEarthquakes(timeRange = '24h') {
  const [quakes, setQuakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown, setCountdown] = useState(POLL_INTERVAL / 1000);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  const fetchQuakes = useCallback(async () => {
    try {
      setError(null);
      const url = ENDPOINTS[timeRange] || ENDPOINTS['24h'];
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const formatted = formatQuakeCollection(data);
      setQuakes(formatted);
      setLastUpdated(new Date());
      setCountdown(POLL_INTERVAL / 1000);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch earthquake data:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Initial fetch + polling
  useEffect(() => {
    setLoading(true);
    fetchQuakes();

    intervalRef.current = setInterval(fetchQuakes, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchQuakes]);

  // Countdown timer
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? POLL_INTERVAL / 1000 : prev - 1));
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return {
    quakes,
    loading,
    error,
    lastUpdated,
    countdown,
    refetch: fetchQuakes,
  };
}
