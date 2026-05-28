import { useState, useEffect } from 'react';
import { Package, RefreshCw, Download } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { usePwaUpdate } from '@/hooks/PwaUpdateProvider';

export function About() {
  const { t } = useI18n();
  const { needRefresh, checkForUpdates, applyUpdate } = usePwaUpdate();
  const [checkState, setCheckState] = useState<'idle' | 'checking' | 'uptodate'>('idle');
  const [releaseLog, setReleaseLog] = useState<string>('');

  const handleCheck = async () => {
    setCheckState('checking');
    checkForUpdates();
    setTimeout(() => {
      if (!needRefresh) {
        setCheckState('uptodate');
        setTimeout(() => setCheckState('idle'), 3000);
      } else {
        setCheckState('idle');
      }
    }, 2000);
  };

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
        <p>{t('about.version', { version: __APP_VERSION__ })}</p>
        <p className="mt-4">{t('about.pwaReady')}</p>
        <p>{t('about.offlineSupport')}</p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        {needRefresh ? (
          <button
            onClick={applyUpdate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            {t('about.updateNow')}
          </button>
        ) : (
          <button
            onClick={handleCheck}
            disabled={checkState === 'checking'}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checkState === 'checking' ? 'animate-spin' : ''}`} />
            {checkState === 'checking'
              ? t('about.checking')
              : checkState === 'uptodate'
                ? t('about.upToDate')
                : t('about.checkForUpdates')}
          </button>
        )}
      </div>

      {releaseLog && (
        <div id="release-log" className="mt-6 text-left bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {renderMarkdown(releaseLog)}
          </div>
        </div>
      )}
    </div>
  );
}
