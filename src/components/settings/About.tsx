import { Package } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { APP_VERSION } from '@/lib/version';

export function About() {
  const { t } = useI18n();

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
    </div>
  );
}
