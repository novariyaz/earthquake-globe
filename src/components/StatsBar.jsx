import { useMemo } from 'react';
import { extractRegion } from '../utils/formatQuake';
import { getMagnitudeColor } from '../utils/colorScale';

export default function StatsBar({ quakes, countdown, lastUpdated, loading }) {
  const stats = useMemo(() => {
    if (!quakes.length) {
      return { total: 0, strongest: null, avgMagnitude: 0, mostActiveRegion: 'N/A' };
    }

    const sorted = [...quakes].sort((a, b) => b.magnitude - a.magnitude);
    const strongest = sorted[0];
    const avgMagnitude = quakes.reduce((sum, q) => sum + q.magnitude, 0) / quakes.length;

    const regionCounts = {};
    quakes.forEach((q) => {
      const region = extractRegion(q.place);
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });
    const mostActiveRegion = Object.entries(regionCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || 'N/A';

    return { total: quakes.length, strongest, avgMagnitude, mostActiveRegion };
  }, [quakes]);

  const countdownPercent = (countdown / 60) * 100;

  return (
    <header
      className="overlay-panel"
      style={{
        top: 'var(--edge-inset)',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
      id="stats-bar"
      role="banner"
      aria-label="Earthquake statistics"
    >
      <div className="glass stats-bar-inner flex items-center gap-1.5 px-2.5 py-2">
        {/* Branding */}
        <div className="flex items-center gap-2.5 px-3.5 border-r border-white/8 mr-1">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="absolute w-2.5 h-2.5 rounded-full bg-red-500 animate-ping opacity-40" />
          </div>
          <h1 className="font-bold text-white tracking-wide text-sm whitespace-nowrap">
            EarthquakeGlobe
          </h1>
        </div>

        {/* Stats chips */}
        <StatChip label="Events" value={loading ? '—' : stats.total} />

        {stats.strongest && (
          <StatChip
            label="Strongest"
            value={`M${stats.strongest.magnitude.toFixed(1)}`}
            accent={getMagnitudeColor(stats.strongest.magnitude)}
          />
        )}

        <StatChip label="Avg" value={loading ? '—' : `M${stats.avgMagnitude.toFixed(1)}`} />

        <StatChip
          label="Hot Zone"
          value={loading ? '—' : stats.mostActiveRegion}
          maxWidth="130px"
        />

        {/* Countdown */}
        <div
          className="flex items-center gap-2.5 px-3.5 py-1.5 border-l border-white/8 ml-1"
          role="timer"
          aria-label={`Next refresh in ${countdown} seconds`}
        >
          <div className="relative w-5 h-5" aria-hidden="true">
            <svg className="w-5 h-5 -rotate-90" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="2" />
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray={`${(countdownPercent / 100) * 62.83} 62.83`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
          </div>
          <span className="stat-number text-slate-400 text-xs w-7 text-right">
            {countdown}s
          </span>
        </div>
      </div>
    </header>
  );
}

function StatChip({ label, value, accent, maxWidth }) {
  return (
    <div
      className="flex flex-col px-3.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-default min-w-0"
      title={`${label}: ${value}`}
    >
      <span className="section-label text-[9px] leading-none mb-1" aria-hidden="true">
        {label}
      </span>
      <span
        className="stat-number text-xs leading-tight truncate"
        style={{ color: accent || 'var(--text-primary)', maxWidth: maxWidth || 'none' }}
        aria-label={`${label}: ${value}`}
      >
        {value}
      </span>
    </div>
  );
}
