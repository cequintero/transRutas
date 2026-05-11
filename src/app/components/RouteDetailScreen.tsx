import { ArrowLeft, Share2, Bus, Footprints, GitBranch, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useRoute } from '../context/RouteContext';
import { stationMap } from '../lib/transmilenio';
import { NetworkMap } from './NetworkMap';

export function RouteDetailScreen() {
  const navigate = useNavigate();
  const ctx = useRoute();
  const [sheetHeight, setSheetHeight] = useState<'peek' | 'half' | 'full'>('half');

  const route = ctx.selectedRoute;

  useEffect(() => {
    if (!route) navigate('/', { replace: true });
  }, [route, navigate]);

  if (!route) return null;

  // Build step-by-step directions from route segments
  const steps = route.segments.map((seg) => {
    if (seg.type === 'transfer') {
      return {
        type: 'transfer' as const,
        icon: GitBranch,
        description: `Transbordo · ${seg.duration} min espera`,
        duration: `${seg.duration} min`,
        color: 'var(--transfer-orange)',
        details: null,
      };
    }
    const fromName = stationMap[seg.stations[0]]?.name || seg.stations[0];
    const toName = stationMap[seg.stations[seg.stations.length - 1]]?.name || seg.stations[seg.stations.length - 1];
    return {
      type: seg.type as 'trunk' | 'feeder',
      icon: Bus,
      description: `Ruta ${seg.code}: ${fromName} → ${toName}`,
      duration: `${seg.time} min`,
      color: seg.type === 'feeder' ? 'var(--feeder-green)' : 'var(--trunk-route)',
      details: `Frecuencia: cada ${3 + Math.floor(Math.random() * 5)} min · ${seg.stations.length} estaciones`,
    };
  });

  return (
    <div className="h-screen flex flex-col bg-[var(--snow-white)] overflow-hidden">
      {/* Top Bar */}
      <header className="bg-white border-b border-[var(--soft-gray)] px-4 py-3 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/results')}
            className="p-2 hover:bg-[var(--snow-white)] rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-[var(--near-black)]" />
          </button>
          <div className="flex-1">
            <h1 className="text-[17px] font-semibold text-[var(--near-black)]">
              {stationMap[ctx.originId!]?.name} → {stationMap[ctx.destId!]?.name}
            </h1>
          </div>
          <button onClick={() => ctx.setShowFeedback(true)}
            className="p-2 hover:bg-[var(--snow-white)] rounded-lg transition-colors">
            <Star size={20} className="text-[var(--warm-amber)]" />
          </button>
          <button className="p-2 hover:bg-[var(--snow-white)] rounded-lg transition-colors">
            <Share2 size={20} className="text-[var(--near-black)]" />
          </button>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <NetworkMap highlightPath={route.path}
          onStationClick={(sid) => navigate(`/station/${sid}`)} />
      </div>

      {/* Bottom Sheet */}
      <div className={`bg-white/[0.85] backdrop-blur-[20px] border-t border-white/30 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] rounded-t-3xl transition-all duration-300 ${
        sheetHeight === 'peek' ? 'h-[25%]' : sheetHeight === 'half' ? 'h-[50%]' : 'h-[85%]'
      }`}>
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div
            className="w-12 h-1.5 bg-[var(--muted-gray)]/30 rounded-full cursor-pointer"
            onClick={() => setSheetHeight((s) => s === 'peek' ? 'half' : s === 'half' ? 'full' : 'peek')}
          />
        </div>

        <div className="px-4 pb-20 md:pb-4 h-full overflow-y-auto">
          {/* Summary row (always visible) */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[28px] font-bold text-[var(--near-black)]">{route.duration}</span>
              <span className="text-[16px] text-[var(--muted-gray)] ml-1">min</span>
              <span className="text-[13px] text-[var(--charcoal)] ml-3">· {route.transfers} transbordos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: route.congestionColor }} />
              <span className="text-[13px] text-[var(--charcoal)]">{route.congestion}</span>
            </div>
          </div>

          {/* Steps (half + full) */}
          {sheetHeight !== 'peek' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[20px] font-semibold text-[var(--near-black)]">Indicaciones</h2>
                <button onClick={() => setSheetHeight(sheetHeight === 'half' ? 'full' : 'half')}
                  className="text-[13px] text-[var(--transit-blue)] font-semibold">
                  {sheetHeight === 'half' ? 'Ver más' : 'Ver menos'}
                </button>
              </div>

              <div className="space-y-0">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `color-mix(in srgb, ${step.color} 15%, white)`, border: `2px solid ${step.color}` }}>
                          <Icon size={18} style={{ color: step.color }} />
                        </div>
                        {idx < steps.length - 1 && (
                          <div className="w-0.5 h-12 my-1" style={{ backgroundColor: 'var(--soft-gray)' }} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-[15px] text-[var(--near-black)] font-medium flex-1">
                            {step.description}
                          </p>
                          <span className="text-[13px] text-[var(--muted-gray)] ml-2 whitespace-nowrap">
                            {step.duration}
                          </span>
                        </div>
                        {sheetHeight === 'full' && step.details && (
                          <p className="mt-1 text-[13px] text-[var(--charcoal)]">{step.details}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
