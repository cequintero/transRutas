import { Search, ArrowUpDown, Clock, MapPin, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRoute } from '../context/RouteContext';
import { filterStations, stationMap } from '../lib/transmilenio';
import { NetworkMap } from './NetworkMap';

export function HomeScreen() {
  const navigate = useNavigate();
  const ctx = useRoute();
  const [showOriginDD, setShowOriginDD] = useState(false);
  const [showDestDD, setShowDestDD] = useState(false);

  const currentDate = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const handleSearch = () => {
    if (ctx.originId && ctx.destId) {
      ctx.searchRoutes();
      navigate('/results');
    }
  };

  const handleStationClick = (sid: string) => {
    navigate(`/station/${sid}`);
  };

  const filteredOrigin = filterStations(ctx.origin);
  const filteredDest = filterStations(ctx.destination);

  return (
    <div className="min-h-screen bg-[var(--snow-white)] pb-20 md:pb-0">
      <header className="bg-white border-b border-[var(--soft-gray)] px-4 py-4 md:px-6">
        <div className="max-w-screen-lg mx-auto">
          <h1 className="text-[24px] font-bold leading-[1.2] tracking-[-0.02em]">
            <span className="text-[var(--near-black)]">Trans</span>
            <span className="text-[var(--transmi-red)]">Rutas</span>
          </h1>
        </div>
      </header>

      <main className="px-4 pt-6 max-w-screen-lg mx-auto md:px-6">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-[24px] md:text-[32px] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--near-black)] mb-2">
            ¿A dónde vas hoy?
          </h1>
          <div className="flex items-center gap-3 text-[13px] text-[var(--charcoal)]">
            <span className="capitalize">{currentDate}</span>
            <span className="px-2 py-1 bg-[var(--sky-mist)] text-[var(--transit-blue)] rounded-lg text-[12px] font-semibold">
              ☀️ 18°C
            </span>
          </div>
        </div>

        {/* Search Card */}
        <div className="relative bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)] mb-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center pt-3 pb-3">
              <div className="w-3 h-3 rounded-full bg-[var(--transit-blue)] border-2 border-white shadow-sm" />
              <div className="w-[2px] h-full bg-[var(--soft-gray)] my-1" />
              <div className="w-3 h-3 rounded-full bg-[var(--transmi-red)] border-2 border-white shadow-sm" />
            </div>

            <div className="flex-1 space-y-3 relative">
              {/* Origin Input */}
              <div className="relative">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 text-[var(--muted-gray)]" size={20} />
                  <input
                    type="text"
                    placeholder="Estación de origen"
                    value={ctx.origin}
                    onChange={(e) => {
                      ctx.setOrigin(e.target.value);
                      ctx.setOriginId(null);
                      setShowOriginDD(true);
                    }}
                    onFocus={() => setShowOriginDD(true)}
                    onBlur={() => setTimeout(() => setShowOriginDD(false), 200)}
                    className="w-full pl-11 pr-10 py-3 bg-[var(--snow-white)] border border-[var(--soft-gray)] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--transmi-red)] focus:border-transparent"
                  />
                  {ctx.origin && (
                    <button onClick={() => { ctx.setOrigin(''); ctx.setOriginId(null); }}
                      className="absolute right-3 text-[var(--muted-gray)] hover:text-[var(--charcoal)]">
                      <X size={18} />
                    </button>
                  )}
                </div>
                {showOriginDD && ctx.origin && !ctx.originId && filteredOrigin.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] max-h-64 overflow-y-auto z-50">
                    {filteredOrigin.map((station) => (
                      <button key={station.id}
                        onClick={() => { ctx.setOrigin(station.name); ctx.setOriginId(station.id); setShowOriginDD(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--snow-white)] transition-colors text-left border-b border-[var(--soft-gray)] last:border-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: station.line === 'feeder' ? 'var(--feeder-green)' : 'var(--trunk-route)' }} />
                        <div className="flex-1">
                          <div className="text-[15px] text-[var(--near-black)] font-medium">{station.name}</div>
                        </div>
                        <span className="text-[11px] px-2 py-1 bg-[var(--soft-gray)] text-[var(--charcoal)] rounded-md font-semibold tracking-[0.02em]">
                          {station.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap */}
              <div className="flex justify-center -my-1 relative z-10">
                <button onClick={ctx.swapStations}
                  className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[var(--soft-gray)] rounded-full hover:border-[var(--transmi-red)] hover:text-[var(--transmi-red)] transition-colors">
                  <ArrowUpDown size={18} />
                </button>
              </div>

              {/* Destination Input */}
              <div className="relative">
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 text-[var(--muted-gray)]" size={20} />
                  <input
                    type="text"
                    placeholder="Estación de destino"
                    value={ctx.destination}
                    onChange={(e) => {
                      ctx.setDestination(e.target.value);
                      ctx.setDestId(null);
                      setShowDestDD(true);
                    }}
                    onFocus={() => setShowDestDD(true)}
                    onBlur={() => setTimeout(() => setShowDestDD(false), 200)}
                    className="w-full pl-11 pr-10 py-3 bg-[var(--snow-white)] border border-[var(--soft-gray)] rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--transmi-red)] focus:border-transparent"
                  />
                  {ctx.destination && (
                    <button onClick={() => { ctx.setDestination(''); ctx.setDestId(null); }}
                      className="absolute right-3 text-[var(--muted-gray)] hover:text-[var(--charcoal)]">
                      <X size={18} />
                    </button>
                  )}
                </div>
                {showDestDD && ctx.destination && !ctx.destId && filteredDest.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] max-h-64 overflow-y-auto z-50">
                    {filteredDest.map((station) => (
                      <button key={station.id}
                        onClick={() => { ctx.setDestination(station.name); ctx.setDestId(station.id); setShowDestDD(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--snow-white)] transition-colors text-left border-b border-[var(--soft-gray)] last:border-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: station.line === 'feeder' ? 'var(--feeder-green)' : 'var(--trunk-route)' }} />
                        <div className="flex-1">
                          <div className="text-[15px] text-[var(--near-black)] font-medium">{station.name}</div>
                        </div>
                        <span className="text-[11px] px-2 py-1 bg-[var(--soft-gray)] text-[var(--charcoal)] rounded-md font-semibold tracking-[0.02em]">
                          {station.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: 'time', label: '⏱ Menor tiempo' },
            { key: 'transfers', label: '🔀 Menos transbordos' },
            { key: 'congestion', label: '📊 Menos congestión' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => ctx.setSelectedFilter(key)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-[13px] font-semibold tracking-[0.02em] transition-all ${
                ctx.selectedFilter === key
                  ? 'bg-[var(--transmi-red)] text-white shadow-sm'
                  : 'bg-white border border-[var(--soft-gray)] text-[var(--charcoal)] hover:border-[var(--muted-gray)]'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Time Selector */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-6">
          <div className="flex items-center gap-2">
            <button onClick={() => ctx.setDepartureMode('now')}
              className={`flex-1 py-2.5 rounded-lg text-[15px] font-semibold transition-all ${
                ctx.departureMode === 'now' ? 'bg-[var(--transmi-red)] text-white' : 'bg-[var(--snow-white)] text-[var(--charcoal)]'
              }`}>
              Salir ahora
            </button>
            <button onClick={() => ctx.setDepartureMode('later')}
              className={`flex-1 py-2.5 rounded-lg text-[15px] font-semibold transition-all ${
                ctx.departureMode === 'later' ? 'bg-[var(--transmi-red)] text-white' : 'bg-[var(--snow-white)] text-[var(--charcoal)]'
              }`}>
              <Clock size={16} className="inline mr-1" /> Elegir hora
            </button>
          </div>
          {ctx.departureMode === 'later' && (
            <div className="mt-4 px-2">
              <input type="range" min={5} max={23} value={ctx.customHour}
                onChange={(e) => ctx.setCustomHour(parseInt(e.target.value))}
                className="w-full h-2 bg-[var(--soft-gray)] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--transmi-red)]
                  [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md" />
              <div className="flex justify-between mt-2 text-[11px] text-[var(--muted-gray)]">
                <span>5:00</span>
                <span className="font-semibold text-[var(--transmi-red)] text-[13px]">{ctx.customHour}:00</span>
                <span>23:00</span>
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button onClick={handleSearch}
          disabled={!ctx.originId || !ctx.destId}
          className="w-full py-4 bg-[var(--transmi-red)] text-white rounded-xl text-[15px] font-semibold tracking-[0.01em] shadow-[0_4px_12px_rgba(204,27,43,0.25)] hover:bg-[var(--deep-red)] disabled:bg-[var(--fog-gray)] disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-[0.98]">
          Buscar ruta óptima
        </button>

        {/* Nearby Stations */}
        <div className="mt-8">
          <h2 className="text-[20px] font-semibold text-[var(--near-black)] mb-4">Estaciones cercanas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'calle_72', dist: '350m', cong: 'low' },
              { id: 'museo_nacional', dist: '720m', cong: 'medium' },
              { id: 'calle_76', dist: '890m', cong: 'low' },
            ].map((item) => {
              const station = stationMap[item.id];
              return (
                <div key={item.id}
                  onClick={() => handleStationClick(item.id)}
                  className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-[17px] font-semibold text-[var(--near-black)]">{station?.name}</h3>
                    <div className={`w-2 h-2 rounded-full ${item.cong === 'low' ? 'bg-[var(--fresh-green)]' : 'bg-[var(--warm-amber)]'}`} />
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[var(--muted-gray)]">{item.dist}</span>
                    <span className="px-2 py-1 bg-[var(--sky-mist)] text-[var(--transit-blue)] rounded-md text-[11px] font-semibold">
                      {station?.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Network Map */}
        <div className="mt-8 mb-6">
          <h2 className="text-[20px] font-semibold text-[var(--near-black)] mb-4">Red Transmilenio</h2>
          <NetworkMap compact onStationClick={handleStationClick} />
        </div>
      </main>
    </div>
  );
}
