import { Home, Map, BarChart3, Info } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on route detail (full-screen map)
  if (location.pathname === '/route-detail') return null;

  const tabs = [
    { id: '/', label: 'Inicio', icon: Home },
    { id: '/results', label: 'Rutas', icon: Map },
    { id: '/dashboard', label: 'Sistema', icon: BarChart3 },
    { id: '/station/calle_72', label: 'Info', icon: Info },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--soft-gray)] z-50 safe-area-inset-bottom md:hidden">
      <div className="flex items-center justify-around h-16 max-w-screen-sm mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.id ||
            (tab.id === '/station/calle_72' && location.pathname.startsWith('/station'));

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors"
            >
              <Icon
                size={24}
                className={isActive ? 'text-[var(--transmi-red)]' : 'text-[var(--muted-gray)]'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[11px] leading-[1.2] tracking-[0.03em] font-medium ${
                  isActive ? 'text-[var(--transmi-red)]' : 'text-[var(--muted-gray)]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
