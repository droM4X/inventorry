import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Header, BottomNav, type View } from '@/components/layout';
import { ProductList } from '@/components/products';
import { Settings } from '@/components/settings';
import { Logs } from '@/components/logs';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import { usePwaUpdate } from '@/hooks/PwaUpdateProvider';
import { VersionNotification, useVersionCheck } from '@/components/layout/VersionNotification';

const VIEW_TITLES: Record<View, string> = {
  products: 'products',
  logs: 'logs',
  settings: 'settings',
  about: 'settings',
};

function App() {
  const [currentView, setCurrentView] = useState<View>(() => {
    const hash = window.location.hash.replace('#', '');
    return (hash as View) || 'products';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { t, setLanguage } = useI18n();
  const { language, theme, storedVersion, setStoredVersion, activeDatabase } = useStore();
  const { showNotification, dismissNotification } = useVersionCheck(storedVersion, setStoredVersion);
  const { needRefresh, applyUpdate } = usePwaUpdate();
  const [dismissedSwUpdate, setDismissedSwUpdate] = useState(false);

  const navigateTo = useCallback((view: View) => {
    window.location.hash = view;
    setCurrentView(view);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as View;
      if (hash && VIEW_TITLES[hash]) {
        setCurrentView(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '') as View;
      if (hash && VIEW_TITLES[hash]) {
        setCurrentView(hash);
      } else {
        window.location.hash = 'products';
        setCurrentView('products');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query && currentView !== 'products') {
      navigateTo('products');
    }
  };

  useEffect(() => {
    setLanguage(language);
  }, [language, setLanguage]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const getTitle = () => {
    return t('app.name');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'products':
        return <ProductList searchQuery={searchQuery} />;
      case 'logs':
        return <Logs />;
      case 'settings':
        return <Settings />;
      case 'about':
        return <Settings initialTab="about" />;
      default:
        return <ProductList searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-20">
      {needRefresh && !dismissedSwUpdate && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-slide-up">
          <div className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-xl shadow-lg flex items-start gap-3">
            <RefreshCw className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{t('about.updateAvailable')}</p>
              <p className="text-sm text-emerald-100">{t('about.updateDescription')}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={applyUpdate}
                  className="px-3 py-1.5 bg-white text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors"
                >
                  {t('about.updateNow')}
                </button>
                <button
                  onClick={() => setDismissedSwUpdate(true)}
                  className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30 transition-colors"
                >
                  {t('about.later')}
                </button>
              </div>
            </div>
            <button
              onClick={() => setDismissedSwUpdate(true)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      {showNotification && <VersionNotification onDismiss={dismissNotification} onNavigate={() => navigateTo('about')} />}
      <Header
        title={getTitle()}
        dbName={activeDatabase}
        onSearchChange={handleSearchChange}
      />
      <main className="flex-1">
        {renderContent()}
      </main>
      <BottomNav
        currentView={currentView}
        onNavigate={navigateTo}
      />
    </div>
  );
}

export default App;
