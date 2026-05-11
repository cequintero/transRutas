import { ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { useRoute } from '../context/RouteContext';
import {
  stationMap, EDGES,
  getStationConnections, getStationRoutes,
  getCongestionMultiplier, getCongestionLevel, getCongestionHex,
} from '../lib/transmilenio';

export function StationInfoScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const ctx = useRoute();

  const station = id ? stationMap[id] : null;
  if (!station) {
    return (
      <div className="min-h-screen bg-[var(--snow-white)] flex items-center justify-center">
        <div className="text-center">
          <MapPin size={48} className="text-[var(--muted-gray)] mx-auto mb-4" />
          <p className="text-[var(--muted-gray)]">Estación no encontrada</p>
          <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-[var(--transmi-red)] text-white rounded-xl font-semibold">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const connections = getStationConnections(id!);
  const routeCodes = getStationRoutes(id!);
  const currentHour = new Date().getHours();

  // Congestion chart data
  const congestionData = Array.from({ length: 19 }, (_, i) => {
    const hour = i + 5;
    const mult = getCongestionMultiplier(hour);
    const level = getCongestionLevel(mult);
    return {
      hour: String(hour),
      level: Math.round(mult * 3.3),
      color: getCongestionHex(level),
    };
  });

  const handleSearchFromHere = () => {
    ctx.setOriginFromStation(id!);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--snow-white)] pb-20 md:pb-0">
      <header className="bg-white border-b border-[var(--soft-gray)] px-4 py-4 md:px-6 sticky top-0 z-40">
        <div className="max-w-screen-lg mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}
              className="p-2 hover:bg-[var(--snow-white)] rounded-lg transition-colors">
              <ArrowLeft size={24} className="text-[var(--near-black)]" />
            </button>
            <div className="flex-1">
              <h1 className="text-[24px] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--near-black)]">
                {station.name}
              </h1>
              <span className="inline-block mt-1 px-2 py-1 bg-[var(--sky-mist)] text-[var(--transit-blue)] rounded-md text-[11px] font-semibold tracking-[0.02em]">
                {station.type}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 pt-4 max-w-screen-lg mx-auto md:px-6">
        {/* Map Preview */}
        <div className="mb-6">
          <div className="relative bg-gradient-to-br from-[var(--sky-mist)] to-[var(--snow-white)] rounded-2xl overflow-hidden" style={{ height: '180px' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[var(--transmi-red)] border-4 border-white shadow-lg" />
            </div>
            <div className="absolute bottom-3 right-3 bg-white px-3 py-1.5 rounded-lg shadow-md text-[11px] font-semibold">
              {station.name}
            </div>
          </div>
        </div>

        {/* Routes Available */}
        <div className="mb-6">
          <h2 className="text-[20px] font-semibold text-[var(--near-black)] mb-3">Rutas disponibles</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {routeCodes.map((code) => {
              const edge = EDGES.find((e) => e[3] === code);
              const isFeeder = edge?.[4] === 'feeder';
              return (
                <button key={code}
                  className="px-4 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap shadow-sm text-white"
                  style={{ backgroundColor: isFeeder ? 'var(--feeder-green)' : 'var(--trunk-route)' }}>
                  {code}
                </button>
              );
            })}
          </div>
        </div>

        {/* Connections */}
        <div className="mb-6">
          <h2 className="text-[20px] font-semibold text-[var(--near-black)] mb-3">Conexiones</h2>
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] divide-y divide-[var(--soft-gray)]">
            {connections.map((connection, idx) => (
              <div key={idx}
                onClick={() => navigate(`/station/${connection.id}`)}
                className="flex items-center justify-between px-4 py-3 hover:bg-[var(--snow-white)] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: connection.type === 'feeder' ? 'var(--feeder-green)' : 'var(--trunk-route)' }} />
                  <span className="text-[15px] text-[var(--near-black)] font-medium">{connection.name}</span>
                  <span className="text-[11px] px-1.5 py-0.5 bg-[var(--snow-white)] text-[var(--muted-gray)] rounded font-semibold">
                    {connection.code}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[var(--muted-gray)]">{connection.time} min</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="var(--muted-gray)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Congestion Chart */}
        <div className="mb-6">
          <h2 className="text-[20px] font-semibold text-[var(--near-black)] mb-2">Nivel de congestión por hora</h2>
          <p className="text-[13px] text-[var(--muted-gray)] mb-4">Fuente: datos históricos y percepción de usuarios</p>
          <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={congestionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="hour" tick={{ fill: '#8B95A2', fontSize: 11 }} axisLine={{ stroke: '#E2E6EA' }} tickLine={false} />
                <YAxis tick={{ fill: '#8B95A2', fontSize: 11 }} axisLine={{ stroke: '#E2E6EA' }} tickLine={false} domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                <Bar dataKey="level" radius={[4, 4, 0, 0]}>
                  {congestionData.map((entry, index) => (
                    <Cell key={index} fill={entry.color}
                      opacity={parseInt(entry.hour) === currentHour ? 1 : 0.65} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-1 h-6 bg-[var(--charcoal)] rounded" />
              <span className="text-[11px] text-[var(--charcoal)] font-semibold">Ahora ({currentHour}:00)</span>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <button onClick={handleSearchFromHere}
          className="w-full py-4 bg-white border-2 border-[var(--transmi-red)] text-[var(--transmi-red)] rounded-xl text-[15px] font-semibold hover:bg-[var(--soft-rose)] transition-all active:scale-[0.98] mb-6">
          Buscar ruta desde esta estación →
        </button>
      </main>
    </div>
  );
}
