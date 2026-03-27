import { getLegendItems } from '../utils/colorScale';

export default function Legend() {
  const items = getLegendItems();

  return (
    <div
      className="overlay-panel"
      style={{
        bottom: 'var(--edge-inset)',
        left: 'var(--edge-inset)',
      }}
      id="legend"
      role="img"
      aria-label="Earthquake magnitude color scale from minor (green) to great (red)"
    >
      <div className="glass-subtle px-4 py-3 space-y-2">
        <h3 className="section-label text-[9px] mb-1" id="legend-title">
          Magnitude
        </h3>

        {/* Color bar */}
        <div className="flex" role="list" aria-labelledby="legend-title">
          {items.map((item, i) => (
            <div
              key={item.threshold}
              className="flex-1 flex flex-col items-center"
              role="listitem"
              aria-label={`Magnitude ${item.label}: ${item.color}`}
            >
              <div
                className="w-full h-2.5 transition-all hover:h-4"
                style={{
                  backgroundColor: item.color,
                  borderRadius: i === 0 ? '4px 0 0 4px' : i === items.length - 1 ? '0 4px 4px 0' : '0',
                }}
              />
            </div>
          ))}
        </div>

        {/* Labels */}
        <div className="flex justify-between">
          <span className="text-[9px] text-slate-500">2.0</span>
          <span className="text-[9px] text-slate-500">4.0</span>
          <span className="text-[9px] text-slate-500">6.0</span>
          <span className="text-[9px] text-slate-500">8.0+</span>
        </div>
      </div>
    </div>
  );
}
