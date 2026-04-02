import { Package, ScrollText, Settings } from 'lucide-react';
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
    { view: 'logs', icon: ScrollText, labelKey: 'nav.logs' },
    { view: 'settings', icon: Settings, labelKey: 'nav.settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)] border-t border-[var(--color-border)] pb-safe">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map(({ view, icon: Icon, labelKey }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              currentView === view
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            <div className={`w-12 h-10 rounded-full flex items-center justify-center ${
              currentView === view
                ? 'bg-[var(--color-primary)] text-white'
                : ''
            }`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export type { View };
