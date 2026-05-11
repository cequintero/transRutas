import { HashRouter, Routes, Route } from 'react-router';
import { RouteProvider, useRoute } from './context/RouteContext';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { RouteResultsScreen } from './components/RouteResultsScreen';
import { RouteDetailScreen } from './components/RouteDetailScreen';
import { StationInfoScreen } from './components/StationInfoScreen';
import { CongestionDashboardScreen } from './components/CongestionDashboardScreen';
import { FeedbackModal } from './components/FeedbackModal';

function AppShell() {
  const { showFeedback, setShowFeedback } = useRoute();

  return (
    <div className="size-full bg-[var(--snow-white)]">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/results" element={<RouteResultsScreen />} />
        <Route path="/route-detail" element={<RouteDetailScreen />} />
        <Route path="/station/:id" element={<StationInfoScreen />} />
        <Route path="/dashboard" element={<CongestionDashboardScreen />} />
      </Routes>
      <BottomNav />
      {showFeedback && (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
          onSubmit={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <RouteProvider>
        <AppShell />
      </RouteProvider>
    </HashRouter>
  );
}
