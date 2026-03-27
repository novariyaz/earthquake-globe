import { useState } from 'react';

const TIME_OPTIONS = [
  { value: '1h', label: 'Past Hour', shortLabel: '1H' },
  { value: '24h', label: 'Past 24 Hours', shortLabel: '24H' },
  { value: '7d', label: 'Past 7 Days', shortLabel: '7D' },
];

const DEPTH_OPTIONS = [
  { value: 'all', label: 'All Depths' },
  { value: 'shallow', label: 'Shallow (0–70 km)' },
  { value: 'intermediate', label: 'Mid (70–300 km)' },
  { value: 'deep', label: 'Deep (300+ km)' },
];

export default function Sidebar({
  filters,
  onMinMagnitudeChange,
  onMaxMagnitudeChange,
  onTimeRangeChange,
  onDepthRangeChange,
  onReset,
  quakeCount,
  totalCount,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`overlay-panel sidebar-panel transition-all duration-300 ease-out ${
        isCollapsed ? 'w-14' : 'w-72'
      }`}
      style={{
        top: 'calc(4.5rem + var(--edge-inset))',
        left: 'var(--edge-inset)',
        maxHeight: 'calc(100vh - 8rem)',
      }}
      id="sidebar"
      role="complementary"
      aria-label="Earthquake filters"
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 z-20 w-6 h-12 rounded-r-lg bg-slate-800/90 border border-l-0 border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-sky-500/40 transition-all"
        id="sidebar-toggle"
        aria-label={isCollapsed ? 'Expand filters' : 'Collapse filters'}
        aria-expanded={!isCollapsed}
      >
        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {isCollapsed ? (
        <div className="glass flex flex-col items-center py-5 gap-4">
          <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          <span className="stat-number text-sky-400 text-sm -rotate-90 whitespace-nowrap mt-4" aria-label={`${quakeCount} earthquakes shown`}>
            {quakeCount}
          </span>
        </div>
      ) : (
        <nav className="glass overflow-y-auto p-5 space-y-5" aria-label="Filter controls">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              Filters
            </h2>
            <button
              onClick={onReset}
              className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors px-2 py-1 rounded-md hover:bg-sky-400/10"
              id="reset-filters"
              aria-label="Reset all filters to defaults"
            >
              Reset
            </button>
          </div>

          {/* Count indicator */}
          <div className="glass-subtle px-4 py-3 flex items-center justify-between" role="status" aria-live="polite">
            <div className="flex items-baseline gap-1.5">
              <span className="stat-number text-sky-400 text-xl">{quakeCount}</span>
              <span className="text-slate-500 text-xs">earthquakes</span>
            </div>
            {quakeCount !== totalCount && (
              <span className="text-[11px] text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded-full">of {totalCount}</span>
            )}
          </div>

          {/* ═══ Time Range — Glassmorphism Tabs ═══ */}
          <fieldset className="space-y-2.5">
            <legend className="section-label">Time Range</legend>
            <div className="glass-tabs" role="radiogroup" aria-label="Time range selection">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onTimeRangeChange(opt.value)}
                  className={`glass-tab ${
                    filters.timeRange === opt.value ? 'glass-tab--active' : ''
                  }`}
                  id={`time-${opt.value}`}
                  role="radio"
                  aria-checked={filters.timeRange === opt.value}
                  aria-label={opt.label}
                >
                  {opt.shortLabel}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Magnitude Range */}
          <fieldset className="space-y-3">
            <legend className="section-label">Magnitude</legend>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label htmlFor="min-magnitude-slider" className="text-xs text-slate-500">
                  Min: <span className="stat-number text-white">{filters.minMagnitude.toFixed(1)}</span>
                </label>
                <label htmlFor="max-magnitude-slider" className="text-xs text-slate-500">
                  Max: <span className="stat-number text-white">{filters.maxMagnitude.toFixed(1)}</span>
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.minMagnitude}
                onChange={(e) => onMinMagnitudeChange(e.target.value)}
                id="min-magnitude-slider"
                aria-label={`Minimum magnitude: ${filters.minMagnitude}`}
                aria-valuemin={0}
                aria-valuemax={10}
                aria-valuenow={filters.minMagnitude}
              />
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.maxMagnitude}
                onChange={(e) => onMaxMagnitudeChange(e.target.value)}
                id="max-magnitude-slider"
                aria-label={`Maximum magnitude: ${filters.maxMagnitude}`}
                aria-valuemin={0}
                aria-valuemax={10}
                aria-valuenow={filters.maxMagnitude}
              />
            </div>
          </fieldset>

          {/* ═══ Depth Filter — Glassmorphism Vertical Tabs ═══ */}
          <fieldset className="space-y-2.5">
            <legend className="section-label">Depth</legend>
            <div className="glass-tabs-vertical" role="radiogroup" aria-label="Depth range selection">
              {DEPTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onDepthRangeChange(opt.value)}
                  className={`glass-tab-v ${
                    filters.depthRange === opt.value ? 'glass-tab-v--active' : ''
                  }`}
                  id={`depth-${opt.value}`}
                  role="radio"
                  aria-checked={filters.depthRange === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Info footer */}
          <div className="glass-subtle p-3 text-xs text-slate-500 leading-relaxed space-y-1.5">
            <p className="flex items-center gap-2">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
              </span>
              <span>Live data from USGS</span>
            </p>
            <p className="text-slate-600 pl-4">Updates every 60s · Click dots for details</p>
          </div>
        </nav>
      )}
    </aside>
  );
}
