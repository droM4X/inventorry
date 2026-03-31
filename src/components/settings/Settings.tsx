import { useState, useRef } from 'react';
import { Download, Upload, Trash2, Globe, Palette, Check } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import { ConfirmDialog } from '@/components/layout/ConfirmDialog';

export function Settings() {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme, exportData, importData, clearAllData, setLanguage: setStoreLanguage, logLimit, setLogLimit } = useStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventorry-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        setImportMessage({ type: 'success', text: t('settings.importSuccess') });
      } else {
        setImportMessage({ type: 'error', text: t('settings.importError') });
      }
      setTimeout(() => setImportMessage(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    clearAllData();
    setShowClearConfirm(false);
  };

  const handleLanguageChange = (lang: 'en' | 'hu') => {
    setLanguage(lang);
    setStoreLanguage(lang);
  };

  const handleLogLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLogLimit(parseInt(e.target.value, 10));
  };

  return (
    <div className="p-4 space-y-6">
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Globe className="w-5 h-5" />
          {t('settings.language')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`flex-1 py-3 px-4 rounded-xl border transition-colors flex items-center justify-center gap-2 ${
              language === 'en'
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-border)]'
            }`}
          >
            {language === 'en' && <Check className="w-4 h-4" />}
            English
          </button>
          <button
            onClick={() => handleLanguageChange('hu')}
            className={`flex-1 py-3 px-4 rounded-xl border transition-colors flex items-center justify-center gap-2 ${
              language === 'hu'
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-border)]'
            }`}
          >
            {language === 'hu' && <Check className="w-4 h-4" />}
            Magyar
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Palette className="w-5 h-5" />
          {t('settings.theme')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 py-3 px-4 rounded-xl border transition-colors ${
              theme === 'light'
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-border)]'
            }`}
          >
            {t('settings.themeLight')}
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 py-3 px-4 rounded-xl border transition-colors ${
              theme === 'dark'
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-border)]'
            }`}
          >
            {t('settings.themeDark')}
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`flex-1 py-3 px-4 rounded-xl border transition-colors ${
              theme === 'system'
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-border)]'
            }`}
          >
            {t('settings.themeSystem')}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('settings.logs')}</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm text-[var(--color-text-secondary)]">
            {t('settings.logLimit')}
          </label>
          <select
            value={logLimit}
            onChange={handleLogLimitChange}
            className="flex-1 py-2 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
          </select>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Data</h2>
        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors"
          >
            <Download className="w-5 h-5" />
            {t('settings.export')}
          </button>
          <button
            onClick={handleImportClick}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors"
          >
            <Upload className="w-5 h-5" />
            {t('settings.import')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-300 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            {t('settings.clearAll')}
          </button>
        </div>
        {importMessage && (
          <div
            className={`p-3 rounded-xl text-sm ${
              importMessage.type === 'success'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}
          >
            {importMessage.text}
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
        title={t('settings.clearAll')}
        message={t('settings.confirmClear')}
      />
    </div>
  );
}
