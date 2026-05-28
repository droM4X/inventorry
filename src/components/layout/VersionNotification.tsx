import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

interface VersionNotificationProps {
  onDismiss: () => void;
  onNavigate: () => void;
}

export function VersionNotification({ onDismiss, onNavigate }: VersionNotificationProps) {
  const { t } = useI18n();

  const handleClick = () => {
    onDismiss();
    onNavigate();
  };

  return (
    <div className="fixed top-20 left-4 right-4 z-50 animate-slide-up">
      <button
        onClick={handleClick}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl shadow-lg flex items-start gap-3 text-left"
      >
        <Sparkles className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">{t('about.versionUpdated', { version: __APP_VERSION__ })}</p>
          <p className="text-sm text-blue-100">{t('about.more')}...</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </button>
    </div>
  );
}

export function useVersionCheck(storedVersion: string, setStoredVersion: (v: string) => void) {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (storedVersion && storedVersion !== __APP_VERSION__) {
      setShowNotification(true);
      setStoredVersion(__APP_VERSION__);
    } else if (!storedVersion) {
      setStoredVersion(__APP_VERSION__);
    }
  }, [storedVersion, setStoredVersion]);

  const dismissNotification = () => {
    setShowNotification(false);
  };

  return { showNotification, dismissNotification };
}
