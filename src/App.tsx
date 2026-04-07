import { useState, useEffect, useCallback } from 'react';
import { Header, BottomNav, type View } from '@/components/layout';
import { ProductList } from '@/components/products';
import { Settings } from '@/components/settings';
import { Logs } from '@/components/logs';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import { VersionNotification, useVersionCheck } from '@/components/layout/VersionNotification';

const VIEW_TITLES: Record<View, string> = {
  products: 'products',
  logs: 'logs',
  settings: 'settings',
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
      default:
        return <ProductList searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-20">
      {showNotification && <VersionNotification onDismiss={dismissNotification} />}
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
