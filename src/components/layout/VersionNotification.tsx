import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { APP_VERSION } from '@/lib/version';
import { useI18n } from '@/hooks/useI18n';

interface VersionNotificationProps {
  onDismiss: () => void;
}

export function VersionNotification({ onDismiss }: VersionNotificationProps) {
  const { t } = useI18n();

  return (
    <div className="fixed top-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
        <Sparkles className="w-6 h-6 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">{t('about.versionUpdated', { version: APP_VERSION })}</p>
          <p className="text-sm text-blue-100">{t('about.versionMessage')}</p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function useVersionCheck(storedVersion: string, setStoredVersion: (v: string) => void) {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (storedVersion && storedVersion !== APP_VERSION) {
      setShowNotification(true);
      setStoredVersion(APP_VERSION);
    } else if (!storedVersion) {
      setStoredVersion(APP_VERSION);
    }
  }, [storedVersion, setStoredVersion]);

  const dismissNotification = () => {
    setShowNotification(false);
  };

  return { showNotification, dismissNotification };
}
