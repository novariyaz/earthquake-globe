import { useState, useRef, useEffect } from 'react';

const GLOBE_LAYERS = [
  {
    id: 'blue-marble',
    name: 'Blue Marble',
    icon: '🌍',
    description: 'NASA satellite imagery',
    imageUrl: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    bumpUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
    bgUrl: '//unpkg.com/three-globe/example/img/night-sky.png',
    atmosphereColor: '#38bdf8',
  },
  {
    id: 'night',
    name: 'Night Lights',
    icon: '🌃',
    description: 'City lights at night',
    imageUrl: '//unpkg.com/three-globe/example/img/earth-night.jpg',
    bumpUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
    bgUrl: '//unpkg.com/three-globe/example/img/night-sky.png',
    atmosphereColor: '#fbbf24',
  },
  {
    id: 'topology',
    name: 'Terrain',
    icon: '🏔️',
    description: 'Elevation & topology',
    imageUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
    bumpUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
    bgUrl: '//unpkg.com/three-globe/example/img/night-sky.png',
    atmosphereColor: '#4ade80',
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: '🌑',
    description: 'Minimal dark globe',
    imageUrl: '//unpkg.com/three-globe/example/img/earth-dark.jpg',
    bumpUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
    bgUrl: '//unpkg.com/three-globe/example/img/night-sky.png',
    atmosphereColor: '#818cf8',
  },
  {
    id: 'water',
    name: 'Water',
    icon: '🌊',
    description: 'Ocean-focused view',
    imageUrl: '//unpkg.com/three-globe/example/img/earth-water.png',
    bumpUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
    bgUrl: '//unpkg.com/three-globe/example/img/night-sky.png',
    atmosphereColor: '#06b6d4',
  },
];

const BOUNDARY_COLORS = [
  { color: '#22d3ee', label: 'Divergent' },
  { color: '#f97316', label: 'Convergent' },
  { color: '#a78bfa', label: 'Transform' },
];

export default function LayerSwitcher({ activeLayer, onLayerChange, showPlates, onTogglePlates }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLayer = GLOBE_LAYERS.find((l) => l.id === activeLayer) || GLOBE_LAYERS[0];

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  return (
    <div
      className="overlay-panel"
      style={{
        top: 'calc(3.75rem + var(--edge-inset))',
        right: 'var(--edge-inset)',
      }}
      id="layer-switcher"
      ref={dropdownRef}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass flex items-center gap-2 px-3.5 py-2.5 hover:border-sky-500/20 transition-all group"
        id="layer-switcher-toggle"
        aria-label={`Globe layer: ${currentLayer.name}. Click to change.`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4 text-sky-400 group-hover:text-sky-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25m11.142 0l4.179 2.25L12 22.5l-9.75-5.25 4.179-2.25" />
        </svg>
        <span className="text-xs font-medium text-slate-300">{currentLayer.name}</span>
        <svg
          className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="glass mt-2 p-3 animate-fade-in-up w-56"
          id="layer-dropdown"
          role="listbox"
          aria-label="Globe layers"
        >
          <h4 className="section-label text-[9px] mb-2.5" id="layers-heading">
            Globe Layers
          </h4>

          {/* Layer options */}
          <div className="space-y-0.5 mb-3" aria-labelledby="layers-heading">
            {GLOBE_LAYERS.map((layer) => (
              <button
                key={layer.id}
                onClick={() => onLayerChange(layer.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                  activeLayer === layer.id
                    ? 'bg-sky-500/12 text-sky-300 border border-sky-500/20'
                    : 'hover:bg-white/5 text-slate-400 border border-transparent'
                }`}
                id={`layer-${layer.id}`}
                role="option"
                aria-selected={activeLayer === layer.id}
              >
                <span className="text-sm" aria-hidden="true">{layer.icon}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium truncate">{layer.name}</span>
                  <span className="text-[9px] text-slate-600 truncate">{layer.description}</span>
                </div>
                {activeLayer === layer.id && (
                  <svg className="w-3.5 h-3.5 ml-auto text-sky-400 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-white/5 my-2" />

          {/* Tectonic plates toggle */}
          <button
            onClick={onTogglePlates}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
              showPlates
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                : 'hover:bg-white/5 text-slate-400 border border-transparent'
            }`}
            id="toggle-plates"
            role="switch"
            aria-checked={showPlates}
            aria-label="Show tectonic plate boundaries"
          >
            <span className="text-sm" aria-hidden="true">🗺️</span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium">Tectonic Plates</span>
              <span className="text-[9px] text-slate-600">Plate boundary lines</span>
            </div>
            {/* Toggle switch */}
            <div
              className="toggle-track"
              aria-checked={showPlates ? 'true' : 'false'}
              aria-hidden="true"
            >
              <div className="toggle-thumb" />
            </div>
          </button>

          {/* Boundary type legend */}
          {showPlates && (
            <div className="mt-2 px-3 space-y-1.5 animate-fade-in" aria-label="Boundary type legend">
              <p className="section-label text-[8px]">Boundary Types</p>
              {BOUNDARY_COLORS.map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-5 h-[2px] rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                  <span className="text-[10px] text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { GLOBE_LAYERS };
