import { createContext, useContext, useState, type ReactNode } from 'react';
import { findRoutes, stationMap, type RouteResult } from '../lib/transmilenio';

interface RouteContextType {
  // Search state
  origin: string;
  destination: string;
  originId: string | null;
  destId: string | null;
  selectedFilter: string;
  departureMode: 'now' | 'later';
  customHour: number;
  currentHour: number;

  // Results state
  routes: RouteResult[];
  selectedRoute: RouteResult | null;

  // Feedback
  showFeedback: boolean;
  setShowFeedback: (v: boolean) => void;

  // Actions
  setOrigin: (v: string) => void;
  setDestination: (v: string) => void;
  setOriginId: (v: string | null) => void;
  setDestId: (v: string | null) => void;
  setSelectedFilter: (v: string) => void;
  setDepartureMode: (v: 'now' | 'later') => void;
  setCustomHour: (v: number) => void;
  searchRoutes: () => void;
  selectRoute: (route: RouteResult) => void;
  swapStations: () => void;
  setOriginFromStation: (stationId: string) => void;
  clearSearch: () => void;
}

const RouteContext = createContext<RouteContextType | null>(null);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originId, setOriginId] = useState<string | null>(null);
  const [destId, setDestId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('time');
  const [departureMode, setDepartureMode] = useState<'now' | 'later'>('now');
  const [customHour, setCustomHour] = useState(new Date().getHours());
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteResult | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentHour = departureMode === 'now' ? new Date().getHours() : customHour;

  const searchRoutes = () => {
    if (!originId || !destId) return;
    const results = findRoutes(originId, destId, currentHour);
    setRoutes(results);
  };

  const selectRoute = (route: RouteResult) => {
    setSelectedRoute(route);
  };

  const swapStations = () => {
    const [a, b, c, d] = [origin, destination, originId, destId];
    setOrigin(b);
    setDestination(a);
    setOriginId(d);
    setDestId(c);
  };

  const setOriginFromStation = (stationId: string) => {
    const station = stationMap[stationId];
    if (station) {
      setOrigin(station.name);
      setOriginId(stationId);
    }
  };

  const clearSearch = () => {
    setRoutes([]);
    setSelectedRoute(null);
  };

  return (
    <RouteContext.Provider value={{
      origin, destination, originId, destId, selectedFilter,
      departureMode, customHour, currentHour, routes, selectedRoute,
      showFeedback, setShowFeedback,
      setOrigin, setDestination, setOriginId, setDestId,
      setSelectedFilter, setDepartureMode, setCustomHour,
      searchRoutes, selectRoute, swapStations, setOriginFromStation, clearSearch,
    }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  const ctx = useContext(RouteContext);
  if (!ctx) throw new Error('useRoute must be used within RouteProvider');
  return ctx;
}
