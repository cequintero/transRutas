import { ArrowLeft, Clock, GitBranch, Navigation } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  STATIONS, EDGES, stationMap,
  getCongestionMultiplier, getCongestionLevel, getCongestionHex,
} from '../lib/transmilenio';

export function CongestionDashboardScreen() {
  const navigate = useNavigate();
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());

  const mult = getCongestionMultiplier(selectedHour);
  const overallLevel = getCongestionLevel(mult);

  // Generate dynamic congested stations based on selected hour
  const congestedStations = [
    { name: 'Portal Norte', base: 95 },
    { name: 'Calle 72', base: 88 },
    { name: 'Av. Jiménez', base: 82 },
    { name: 'Museo Nacional', base: 74 },
    { name: 'Calle 100', base: 68 },
  ].map((s) => ({
    ...s,
    level: Math.min(100, Math.round(s.base * mult / 1.6)),
  })).sort((a, b) => b.level - a.level);

  const slowSegments = [
    { route: 'Portal Norte → Calle 170', base: 28, baseDelta: 12 },
    { route: 'Av. Jiménez → Museo Nacional', base: 22, baseDelta: 8 },
    { route: 'Calle 100 → Calle 127', base: 18, baseDelta: 6 },
    { route: 'Portal Sur → NQS 30 Sur', base: 16, baseDelta: 5 },
    { route: 'Portal Suba → Calle 95', base: 14, baseDelta: 4 },
  ].map((s) => ({
    route: s.route,
    time: Math.round(s.base * mult / 1.2),
    delta: Math.round(s.baseDelta * mult / 1.2),
    color: mult > 1.2 ? 'var(--alert-red)' : 'var(--warm-amber)',
  }));

  return (
    <div className="min-h-screen bg-[var(--snow-white)] pb-20 md:pb-0">
      <header className="bg-white border-b border-[var(--soft-gray)] px-4 py-4 md:px-6 sticky top-0 z-40">
        <div className="max-w-screen-lg mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')}
              className="p-2 hover:bg-[var(--snow-white)] rounded-lg transition-colors">
              <ArrowLeft size={24} className="text-[var(--near-black)]" />
            </button>
            <div className="flex-1">
              <h1 className="text-[24px] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--near-black)]">
                Estado del sistema
              </h1>
              <span className="text-[13px] text-[var(--muted-gray)]">
                {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 pt-4 max-w-screen-lg mx-auto md:px-6">
        {/* Time Simulator */}
        <div className="mb-6">
          <label className="block text-[15px] font-medium text-[var(--near-black)] mb-3">
            Simula la congestión por hora
          </label>
          <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <input type="range" min="5" max="23" value={selectedHour}
              onChange={(e) => setSelectedHour(parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--soft-gray)] rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--transmi-red)]
                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-[var(--transmi-red)] [&::-moz-range-thumb]:border-0" />
            <div className="flex justify-between mt-2 text-[11px] text-[var(--muted-gray)]">
              <span>5:00</span>
              <span className="font-semibold text-[var(--transmi-red)] text-[13px]">
                {selectedHour}:00 — Congestión {overallLevel}
              </span>
              <span>23:00</span>
            </div>
          </div>
        </div>

        {/* Congestion Map */}
        <div className="mb-6">
          <h2 className="text-[20px] font-semibold text-[var(--near-black)] mb-3">Mapa de congestión</h2>
          <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="relative bg-[var(--snow-white)] rounded-xl overflow-hidden" style={{ height: '250px' }}>
              <svg width="100%" height="100%" viewBox="0 0 600 700" preserveAspectRatio="xMidYMid meet">
                {EDGES.map(([from, to, , , type], i) => {
                  const s1 = stationMap[from]; const s2 = stationMap[to];
                  if (!s1 || !s2) return null;
                  return (
                    <line key={i} x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y}
                      stroke={type === 'feeder' ? 'var(--feeder-green)' : 'var(--trunk-route)'}
                      strokeWidth="1.5" opacity="0.15" />
                  );
                })}
                {STATIONS.map((s) => {
                  // Randomized per-station congestion based on hour
                  const seed = s.id.length + selectedHour;
                  const localMult = mult * (0.6 + ((seed * 7) % 10) / 10);
                  const level = getCongestionLevel(localMult);
                  const color = getCongestionHex(level);
                  const isPortal = s.type === 'Portal';
                  return (
                    <g key={s.id} onClick={() => navigate(`/station/${s.id}`)} style={{ cursor: 'pointer' }}>
                      <circle cx={s.x} cy={s.y} r={isPortal ? 7 : 4} fill={color} opacity={0.85} />
                      {isPortal && (
                        <text x={s.x + 10} y={s.y + 4} fontSize="8" fill="#3D4852" fontWeight="600" fontFamily="system-ui">
                          {s.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-3 text-[12px]">
              {[
                { color: 'var(--fresh-green)', label: 'Baja' },
                { color: 'var(--warm-amber)', label: 'Media' },
                { color: 'var(--alert-red)', label: 'Alta' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[var(--charcoal)]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-center">
            <Clock size={24} className="text-[var(--transit-blue)] mx-auto mb-2" />
            <div className="text-[32px] font-bold leading-[1.0] tracking-[-0.02em] text-[var(--near-black)]">
              {Math.round(47 * mult)}
            </div>
            <div className="text-[12px] text-[var(--muted-gray)] mt-1">Tiempo prom (min)</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-center">
            <GitBranch size={24} className="text-[var(--transfer-orange)] mx-auto mb-2" />
            <div className="text-[32px] font-bold leading-[1.0] tracking-[-0.02em] text-[var(--near-black)]">
              {(1.8 * (0.8 + mult * 0.2)).toFixed(1)}
            </div>
            <div className="text-[12px] text-[var(--muted-gray)] mt-1">Transbordos prom</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-center">
            <Navigation size={24} className="text-[var(--fresh-green)] mx-auto mb-2" />
            <div className="text-[32px] font-bold leading-[1.0] tracking-[-0.02em] text-[var(--near-black)]">
              {STATIONS.length}
            </div>
            <div className="text-[12px] text-[var(--muted-gray)] mt-1">Estaciones activas</div>
          </div>
        </div>

        {/* Most Congested */}
        <div className="mb-6">
          <h2 className="text-[20px] font-semibold text-[var(--near-black)] mb-3">Estaciones más congestionadas</h2>
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] divide-y divide-[var(--soft-gray)]">
            {congestedStations.map((station, idx) => (
              <div key={idx} className="flex items-center gap-3 px-4 py-3">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--snow-white)] text-[12px] font-bold text-[var(--charcoal)]">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] text-[var(--near-black)] font-medium mb-1">{station.name}</div>
                  <div className="w-full bg-[var(--snow-white)] rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${station.level}%`,
                        backgroundColor: station.level > 70 ? 'var(--alert-red)' : 'var(--warm-amber)',
                      }} />
                  </div>
                </div>
                <span className="text-[11px] px-2 py-1 rounded-md font-semibold tracking-[0.02em]"
                  style={{
                    color: station.level > 70 ? 'var(--alert-red)' : 'var(--warm-amber)',
                    backgroundColor: station.level > 70 ? 'var(--rose-wash)' : 'var(--honey-wash)',
                  }}>
                  {station.level > 70 ? 'ALTA' : 'MEDIA'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Slowest Segments */}
        <div className="mb-6">
          <h2 className="text-[20px] font-semibold text-[var(--near-black)] mb-3">Tramos más lentos</h2>
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] divide-y divide-[var(--soft-gray)]">
            {slowSegments.map((segment, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1">
                  <div className="text-[15px] text-[var(--near-black)] font-medium">{segment.route}</div>
                </div>
                <div className="text-right">
                  <div className="text-[15px] text-[var(--near-black)] font-semibold">{segment.time} min</div>
                  <div className="text-[12px] font-semibold flex items-center gap-1 justify-end"
                    style={{ color: segment.color }}>
                    <span>↑</span>
                    <span>{segment.delta} min vs promedio</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
