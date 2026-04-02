import { useState, useEffect } from 'react';
import { Header, Drawer, type View } from '@/components/layout';
import { ProductList } from '@/components/products';
import { Settings } from '@/components/settings';
import { Logs } from '@/components/logs';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import { VersionNotification, useVersionCheck } from '@/components/layout/VersionNotification';

function App() {
  const [currentView, setCurrentView] = useState<View>('products');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t, setLanguage } = useI18n();
  const { language, theme, storedVersion, setStoredVersion } = useStore();
  const { showNotification, dismissNotification } = useVersionCheck(storedVersion, setStoredVersion);

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
    switch (currentView) {
      case 'products':
        return t('product.title');
      case 'logs':
        return t('logs.title');
      case 'settings':
        return t('settings.title');
      default:
        return t('app.name');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'products':
        return <ProductList />;
      case 'logs':
        return <Logs />;
      case 'settings':
        return <Settings />;
      default:
        return <ProductList />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {showNotification && <VersionNotification onDismiss={dismissNotification} />}
      <Header
        onMenuClick={() => setIsDrawerOpen(true)}
        title={getTitle()}
      />
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentView={currentView}
        onNavigate={setCurrentView}
      />
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
