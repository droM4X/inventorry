import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { APP_VERSION } from '@/lib/version';

export function About() {
  const { t } = useI18n();
  const [releaseLog, setReleaseLog] = useState<string>('');

  useEffect(() => {
    fetch('release_log.md')
      .then((res) => res.text())
      .then((text) => setReleaseLog(text))
      .catch(() => setReleaseLog(''));
  }, []);

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('# ')) {
        return <h2 key={i} className="text-xl font-bold mt-6 mb-3">{line.slice(2)}</h2>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(3)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4">{line.slice(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return <p key={i}>{line}</p>;
    });
  };

  return (
    <div className="p-6 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-primary)] text-white mb-4">
        <Package className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-bold mb-2">{t('app.name')}</h1>
      <p className="text-[var(--color-text-secondary)] mb-6">{t('app.tagline')}</p>
      <div className="text-sm text-[var(--color-text-secondary)]">
        <p>{t('about.version', { version: APP_VERSION })}</p>
        <p className="mt-4">{t('about.pwaReady')}</p>
        <p>{t('about.offlineSupport')}</p>
      </div>

      {releaseLog && (
        <div className="mt-8 text-left bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {renderMarkdown(releaseLog)}
          </div>
        </div>
      )}
    </div>
  );
}
