import { X, Package, Settings, ScrollText } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

type View = 'products' | 'settings' | 'logs';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: View;
  onNavigate: (view: View) => void;
}

export function Drawer({ isOpen, onClose, currentView, onNavigate }: DrawerProps) {
  const { t } = useI18n();

  const navItems: { view: View; icon: typeof Package; labelKey: string }[] = [
    { view: 'products', icon: Package, labelKey: 'nav.products' },
    { view: 'settings', icon: Settings, labelKey: 'nav.settings' },
    { view: 'logs', icon: ScrollText, labelKey: 'nav.logs' },
  ];

  const handleNavigate = (view: View) => {
    onNavigate(view);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[var(--color-surface)] z-50 transform transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <span className="text-xl font-bold text-[var(--color-primary)]">
            Inventorry
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-2">
          {navItems.map(({ view, icon: Icon, labelKey }) => (
            <button
              key={view}
              onClick={() => handleNavigate(view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                currentView === view
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'hover:bg-[var(--color-border)]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{t(labelKey)}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}

export type { View };
