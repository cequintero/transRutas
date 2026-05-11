import { STATIONS, EDGES, stationMap } from '../lib/transmilenio';

interface NetworkMapProps {
  highlightPath?: { station: string; edge: unknown }[] | null;
  onStationClick?: (stationId: string) => void;
  compact?: boolean;
}

export function NetworkMap({ highlightPath, onStationClick, compact }: NetworkMapProps) {
  const height = compact ? 250 : 500;
  const vbHeight = compact ? 700 : 720;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 600 ${vbHeight}`}
      className="rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, var(--sky-mist) 0%, var(--snow-white) 50%, var(--mint-wash) 100%)',
      }}
    >
      {/* Edges */}
      {EDGES.map(([from, to, , , type], i) => {
        const s1 = stationMap[from];
        const s2 = stationMap[to];
        if (!s1 || !s2) return null;

        const isHighlighted =
          highlightPath &&
          highlightPath.some(
            (p, j) =>
              j > 0 &&
              ((highlightPath[j - 1].station === from && p.station === to) ||
                (highlightPath[j - 1].station === to && p.station === from))
          );

        return (
          <line
            key={i}
            x1={s1.x}
            y1={s1.y}
            x2={s2.x}
            y2={s2.y}
            stroke={
              isHighlighted
                ? 'var(--transmi-red)'
                : type === 'feeder'
                  ? 'var(--feeder-green)'
                  : 'var(--trunk-route)'
            }
            strokeWidth={isHighlighted ? 5 : 1.5}
            opacity={isHighlighted ? 1 : 0.25}
            strokeLinecap="round"
            strokeDasharray={type === 'feeder' && !isHighlighted ? '6,4' : 'none'}
          />
        );
      })}

      {/* Station nodes */}
      {STATIONS.map((s) => {
        const isOnPath = highlightPath?.some((p) => p.station === s.id) ?? false;
        const isPortal = s.type === 'Portal';
        const r = isOnPath ? 8 : isPortal ? 6 : 3.5;

        return (
          <g
            key={s.id}
            onClick={() => onStationClick?.(s.id)}
            style={{ cursor: onStationClick ? 'pointer' : 'default' }}
          >
            {/* White background ring */}
            <circle cx={s.x} cy={s.y} r={r + 2.5} fill="white" />
            {/* Station dot */}
            <circle
              cx={s.x}
              cy={s.y}
              r={r}
              fill={
                isOnPath
                  ? 'var(--transmi-red)'
                  : isPortal
                    ? 'var(--transit-blue)'
                    : 'var(--muted-gray)'
              }
              stroke="white"
              strokeWidth={2}
            />
            {/* Label */}
            {(isOnPath || isPortal || !compact) && (
              <text
                x={s.x + r + 5}
                y={s.y + 4}
                fontSize={compact ? 8 : 10}
                fill="var(--charcoal)"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight={isOnPath ? 700 : isPortal ? 600 : 400}
              >
                {s.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
