import { useState, useMemo, useCallback } from 'react';
import Globe from './components/Globe';
import Sidebar from './components/Sidebar';
import QuakePopup from './components/QuakePopup';
import Legend from './components/Legend';
import StatsBar from './components/StatsBar';
import LayerSwitcher from './components/LayerSwitcher';
import { useEarthquakes } from './hooks/useEarthquakes';
import { useFilters } from './hooks/useFilters';
import { useTectonicPlates } from './hooks/useTectonicPlates';

export default function App() {
  const {
    filters,
    setMinMagnitude,
    setMaxMagnitude,
    setTimeRange,
    setDepthRange,
    resetFilters,
    applyFilters,
  } = useFilters();

  const {
    quakes,
    loading,
    error,
    lastUpdated,
    countdown,
    refetch,
  } = useEarthquakes(filters.timeRange);

  const {
    boundaries,
    showBoundaries,
    toggleBoundaries,
    getPlateInfo,
  } = useTectonicPlates();

  const [selectedQuake, setSelectedQuake] = useState(null);
  const [selectedPlateInfo, setSelectedPlateInfo] = useState(null);
  const [activeLayer, setActiveLayer] = useState('blue-marble');
  const [autoRotate, setAutoRotate] = useState(true);

  const filteredQuakes = useMemo(() => {
    return applyFilters(quakes);
  }, [quakes, applyFilters]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleQuakeClick = useCallback(
    (quake) => {
      setSelectedQuake(quake);
      const info = getPlateInfo(quake.lat, quake.lng);
      setSelectedPlateInfo(info);
    },
    [getPlateInfo]
  );

  const handleClosePopup = useCallback(() => {
    setSelectedQuake(null);
    setSelectedPlateInfo(null);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden" id="app-root">
      {/* Skip link for keyboard users */}
      <a href="#sidebar" className="skip-link">
        Skip to filters
      </a>

      {/* 3D Globe (main content) */}
      <main aria-label="Earthquake visualization globe">
        <Globe
          quakes={filteredQuakes}
          onQuakeClick={handleQuakeClick}
          activeLayer={activeLayer}
          plateBoundaries={boundaries}
          showPlates={showBoundaries}
          autoRotate={autoRotate}
        />
      </main>

      {/* Stats Bar */}
      <StatsBar
        quakes={filteredQuakes}
        countdown={countdown}
        lastUpdated={lastUpdated}
        loading={loading}
      />

      {/* Layer Switcher */}
      <LayerSwitcher
        activeLayer={activeLayer}
        onLayerChange={setActiveLayer}
        showPlates={showBoundaries}
        onTogglePlates={toggleBoundaries}
      />

      {/* Sidebar */}
      <Sidebar
        filters={filters}
        onMinMagnitudeChange={setMinMagnitude}
        onMaxMagnitudeChange={setMaxMagnitude}
        onTimeRangeChange={handleTimeRangeChange}
        onDepthRangeChange={setDepthRange}
        onReset={resetFilters}
        quakeCount={filteredQuakes.length}
        totalCount={quakes.length}
      />

      {/* Quake Popup */}
      <QuakePopup
        quake={selectedQuake}
        onClose={handleClosePopup}
        plateInfo={selectedPlateInfo}
      />

      {/* Legend */}
      <Legend />

      {/* Rotation toggle */}
      <button
        onClick={() => setAutoRotate((prev) => !prev)}
        className={`overlay-panel glass flex items-center gap-2.5 px-4 py-2.5 transition-all cursor-pointer ${
          autoRotate
            ? 'hover:border-sky-500/20'
            : 'hover:border-amber-500/20 border-amber-500/15'
        }`}
        style={{ bottom: 'var(--edge-inset)', right: 'var(--edge-inset)' }}
        id="rotation-toggle"
        role="switch"
        aria-checked={autoRotate}
        aria-label={autoRotate ? 'Globe is rotating. Click to pause.' : 'Globe is paused. Click to resume rotation.'}
      >
        {autoRotate ? (
          <svg className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span className={`text-xs font-medium ${autoRotate ? 'text-slate-300' : 'text-amber-300'}`}>
          {autoRotate ? 'Rotating' : 'Paused'}
        </span>
      </button>

      {/* Error toast */}
      {error && (
        <div
          className="overlay-panel animate-fade-in-up"
          style={{ bottom: '4.5rem', right: 'var(--edge-inset)' }}
          id="error-toast"
          role="alert"
        >
          <div className="glass-subtle px-4 py-3 flex items-center gap-3 border-l-2 border-red-500">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-xs text-red-300 font-medium">Connection Error</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="btn btn-ghost text-[10px] py-1 px-2.5 ml-2"
              id="retry-button"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && quakes.length === 0 && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
          id="loading-overlay"
          role="status"
          aria-label="Loading earthquake data"
        >
          <div className="flex flex-col items-center gap-5 animate-fade-in-up">
            <div className="relative w-16 h-16" aria-hidden="true">
              <div className="absolute inset-0 rounded-full border-2 border-sky-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-sky-300 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Loading Seismic Data</p>
              <p className="text-xs text-slate-500 mt-1.5">Connecting to USGS feed & tectonic plates…</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
