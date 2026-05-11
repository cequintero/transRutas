import { ArrowLeft, ArrowRight, GitBranch, MapPin } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useRoute } from '../context/RouteContext';
import { stationMap } from '../lib/transmilenio';
import { NetworkMap } from './NetworkMap';

export function RouteResultsScreen() {
  const navigate = useNavigate();
  const ctx = useRoute();

  useEffect(() => {
    if (!ctx.originId || !ctx.destId) navigate('/', { replace: true });
  }, [ctx.originId, ctx.destId, navigate]);

  if (!ctx.originId || !ctx.destId) return null;

  const handleSelectRoute = (route: typeof ctx.routes[0]) => {
    ctx.selectRoute(route);
    navigate('/route-detail');
  };

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
              <h1 className="text-[20px] font-semibold text-[var(--near-black)] mb-1">Resultados</h1>
              <div className="flex items-center gap-2 text-[13px] text-[var(--muted-gray)]">
                <span>{stationMap[ctx.originId!]?.name}</span>
                <ArrowRight size={14} />
                <span>{stationMap[ctx.destId!]?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 pt-4 max-w-screen-lg mx-auto md:px-6">
        {/* Filter recap */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <span className="px-3 py-1.5 bg-[var(--transmi-red)] text-white rounded-full text-[11px] font-semibold tracking-[0.02em]">
            {ctx.selectedFilter === 'time' ? '⏱ Menor tiempo' : ctx.selectedFilter === 'transfers' ? '🔀 Menos transbordos' : '📊 Menos congestión'}
          </span>
        </div>

        {/* Empty state */}
        {ctx.routes.length === 0 && (
          <div className="text-center py-16">
            <MapPin size={48} className="text-[var(--muted-gray)] mx-auto mb-4 opacity-40" />
            <p className="text-[15px] text-[var(--muted-gray)] mb-4">No encontramos rutas para este trayecto.</p>
            <button onClick={() => navigate('/')}
              className="px-6 py-3 bg-[var(--transmi-red)] text-white rounded-xl text-[15px] font-semibold">
              Volver a buscar
            </button>
          </div>
        )}

        {/* Route Cards */}
        <div className="space-y-4">
          {ctx.routes.map((route) => (
            <div key={route.id}
              onClick={() => handleSelectRoute(route)}
              className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all cursor-pointer active:scale-[0.98]">
              
              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-lg text-[11px] font-semibold tracking-[0.02em]"
                  style={{ color: route.labelColor, backgroundColor: route.labelBg }}>
                  {route.label}
                </span>
              </div>

              {/* Metrics */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-[32px] md:text-[40px] font-bold leading-[1.0] tracking-[-0.02em] text-[var(--near-black)]">
                  {route.duration} <span className="text-[20px] md:text-[24px] text-[var(--muted-gray)]">min</span>
                </div>
                <div className="flex items-center gap-3 text-[13px]">
                  <div className="flex items-center gap-1.5">
                    <GitBranch size={16} className="text-[var(--muted-gray)]" />
                    <span className="text-[var(--charcoal)] font-medium">{route.transfers} transbordos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: route.congestionColor }} />
                    <span className="text-[var(--charcoal)] font-medium">{route.congestion}</span>
                  </div>
                </div>
              </div>

              {/* Route segments bar */}
              <div className="relative h-12 mb-4 bg-[var(--snow-white)] rounded-lg p-2 overflow-x-auto">
                <div className="flex items-center gap-1 h-full min-w-max">
                  {route.segments.map((segment, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      {segment.type === 'transfer' ? (
                        <div className="flex items-center gap-1 px-2">
                          <div className="w-2 h-2 rounded-full bg-[var(--transfer-orange)]" />
                          <span className="text-[10px] text-[var(--muted-gray)] whitespace-nowrap">
                            {segment.duration}min
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <div className="h-1.5 rounded-full"
                            style={{
                              backgroundColor: segment.type === 'feeder' ? 'var(--feeder-green)' : 'var(--trunk-route)',
                              minWidth: `${Math.max(40, segment.time * 4)}px`,
                            }} />
                          <span className="text-[10px] font-semibold mt-0.5 tracking-[0.02em]"
                            style={{ color: segment.type === 'feeder' ? 'var(--feeder-green)' : 'var(--trunk-route)' }}>
                            {segment.code}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--muted-gray)]">
                  Salida estimada: <span className="text-[var(--charcoal)] font-medium">{route.departure}</span>
                </span>
                <button className="text-[var(--transit-blue)] font-semibold hover:text-[var(--deep-blue)] flex items-center gap-1">
                  Ver detalle <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Map Preview */}
        {ctx.routes.length > 0 && (
          <div className="mt-6 mb-6">
            <NetworkMap compact highlightPath={ctx.routes[0]?.path}
              onStationClick={(sid) => navigate(`/station/${sid}`)} />
          </div>
        )}
      </main>
    </div>
  );
}
