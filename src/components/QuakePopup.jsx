import { getMagnitudeColor } from '../utils/colorScale';
import { formatDepth } from '../utils/formatQuake';

export default function QuakePopup({ quake, onClose, plateInfo }) {
  if (!quake) return null;

  const magColor = getMagnitudeColor(quake.magnitude);
  const boundary = plateInfo?.boundary;
  const cause = plateInfo?.cause;
  const plate = plateInfo?.plate;

  return (
    <div
      className="overlay-panel animate-fade-in-up"
      style={{ bottom: '6rem', right: '1rem', width: '350px', maxHeight: 'calc(100vh - 8rem)' }}
      id="quake-popup"
      role="dialog"
      aria-label={`Earthquake details: Magnitude ${quake.magnitude.toFixed(1)} at ${quake.place}`}
      aria-modal="false"
    >
      <div className="glass p-5 space-y-4 relative overflow-y-auto" style={{ maxHeight: 'calc(100vh - 9rem)' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-800/90 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all z-10"
          id="close-popup"
          aria-label="Close earthquake details"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{
              background: `linear-gradient(135deg, ${magColor}88, ${magColor})`,
              boxShadow: `0 4px 15px ${magColor}40`,
            }}
            aria-hidden="true"
          >
            {quake.magnitude.toFixed(1)}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white leading-snug pr-6">
              {quake.place}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 capitalize">{quake.type}</p>
          </div>
        </div>

        {/* Details grid */}
        <dl className="grid grid-cols-2 gap-2">
          <DetailItem label="Magnitude" value={quake.magnitude.toFixed(1)} accent={magColor} />
          <DetailItem label="Depth" value={formatDepth(quake.depth)} />
          <DetailItem label="Time" value={quake.timeAgo} />
          <DetailItem label="Coordinates" value={`${quake.lat.toFixed(2)}°, ${quake.lng.toFixed(2)}°`} />
          {quake.felt != null && <DetailItem label="Felt Reports" value={quake.felt.toString()} />}
          {quake.tsunami ? <DetailItem label="Tsunami" value="⚠ Warning" accent="#ef4444" /> : null}
        </dl>

        {/* ═══ TECTONIC PLATE INFO ═══ */}
        {(boundary || plate || cause) && (
          <section className="space-y-3 pt-1" aria-label="Tectonic analysis">
            <div className="flex items-center gap-2">
              <div className="w-6 h-px bg-gradient-to-r from-cyan-500 to-transparent" aria-hidden="true" />
              <h4 className="section-label text-[9px]">Tectonic Analysis</h4>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-cyan-500/20" aria-hidden="true" />
            </div>

            {/* Plate location */}
            {plate && (
              <div className="glass-subtle px-3 py-2.5 flex items-center gap-2.5">
                <span className="text-sm" aria-hidden="true">🗺️</span>
                <div>
                  <dt className="text-[10px] text-slate-500 uppercase tracking-wider">Located on</dt>
                  <dd className="text-xs font-medium text-white">{plate.name}</dd>
                </div>
              </div>
            )}

            {/* Plates involved */}
            {boundary && (
              <div className="space-y-2">
                <div className="flex items-center gap-2" role="group" aria-label="Plate boundary interaction">
                  <div
                    className="flex-1 glass-subtle px-3 py-2.5 text-center border-l-2"
                    style={{ borderColor: boundary.color }}
                  >
                    <dt className="text-[9px] text-slate-600 uppercase">Plate A</dt>
                    <dd className="text-[11px] font-semibold text-white mt-0.5">{boundary.plateA}</dd>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 px-1" aria-hidden="true">
                    <span className="text-base font-bold" style={{ color: boundary.color }}>
                      {boundary.icon}
                    </span>
                    <span className="text-[8px] text-slate-600 whitespace-nowrap">{boundary.distanceKm} km</span>
                  </div>
                  <div
                    className="flex-1 glass-subtle px-3 py-2.5 text-center border-r-2"
                    style={{ borderColor: boundary.color }}
                  >
                    <dt className="text-[9px] text-slate-600 uppercase">Plate B</dt>
                    <dd className="text-[11px] font-semibold text-white mt-0.5">{boundary.plateB}</dd>
                  </div>
                </div>

                {/* Boundary type badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium"
                    style={{
                      backgroundColor: boundary.color + '15',
                      color: boundary.color,
                      border: `1px solid ${boundary.color}25`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: boundary.color }} aria-hidden="true" />
                    {boundary.label}
                  </span>
                  {boundary.boundaryName && (
                    <span className="text-[10px] text-slate-600 italic truncate">{boundary.boundaryName}</span>
                  )}
                </div>
              </div>
            )}

            {/* Earthquake cause */}
            {cause && (
              <div className="glass-subtle p-3 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs" aria-hidden="true">⚡</span>
                  <p className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider">
                    {cause.mechanism}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {cause.summary}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Timestamp */}
        <p className="text-[11px] text-slate-600">
          <time dateTime={new Date(quake.time).toISOString()}>{quake.timeFormatted}</time>
        </p>

        {/* USGS Link */}
        {quake.url && (
          <a
            href={quake.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full text-xs"
            id="usgs-link"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on USGS
          </a>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value, accent }) {
  return (
    <div className="glass-subtle px-3 py-2">
      <dt className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{label}</dt>
      <dd className="text-xs font-medium truncate" style={{ color: accent || 'var(--text-primary)' }}>
        {value}
      </dd>
    </div>
  );
}
