import { Package, History, Settings } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

type View = 'products' | 'settings' | 'logs';

interface BottomNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  const { t } = useI18n();

  const navItems: { view: View; icon: typeof Package; labelKey: string }[] = [
    { view: 'products', icon: Package, labelKey: 'nav.products' },
    { view: 'logs', icon: History, labelKey: 'nav.logs' },
    { view: 'settings', icon: Settings, labelKey: 'nav.settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)]/70 backdrop-blur-sm border-t border-[var(--color-border)]">
      <div className="flex items-center justify-around py-1 px-2">
        {navItems.map(({ view, icon: Icon, labelKey }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors ${
              currentView === view
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            <div className={`w-20 h-10 rounded-full flex flex-col items-center justify-center gap-0.5 ${
              currentView === view
                ? 'bg-[var(--color-primary)] text-white'
                : ''
            }`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-none">{t(labelKey)}</span>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
}

export type { View };
