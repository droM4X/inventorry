import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { APP_VERSION } from '@/lib/version';
import { useI18n } from '@/hooks/useI18n';

interface VersionNotificationProps {
  onDismiss: () => void;
}

export function VersionNotification({ onDismiss }: VersionNotificationProps) {
  const { t } = useI18n();
  const [releaseLog, setReleaseLog] = useState<string>('');

  useEffect(() => {
    fetch('/release_log.md')
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split('\n');
        const currentVersionLines: string[] = [];
        let capture = false;

        for (const line of lines) {
          if (line.startsWith('## v') && line.includes(APP_VERSION)) {
            capture = true;
            currentVersionLines.push(line);
          } else if (capture) {
            if (line.startsWith('## ')) {
              break;
            }
            currentVersionLines.push(line);
          }
        }

        setReleaseLog(currentVersionLines.join('\n'));
      })
      .catch(() => setReleaseLog(''));
  }, []);

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.slice(1).map((line, i) => {
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 text-sm text-blue-100">{line.slice(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return null;
    }).filter(Boolean);
  };

  return (
    <div className="fixed top-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl shadow-lg flex items-start gap-3">
        <Sparkles className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">{t('about.versionUpdated', { version: APP_VERSION })}</p>
          {releaseLog && (
            <ul className="mt-1 space-y-0.5">
              {renderMarkdown(releaseLog)}
            </ul>
          )}
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
