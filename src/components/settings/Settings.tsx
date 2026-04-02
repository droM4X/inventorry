import { useState, useRef } from 'react';
import { Download, Upload, Trash2, Globe, Palette, Check, Folder, Scale, Info, History, Database, Settings as SettingsIcon } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import { CategoryList } from '@/components/categories';
import { UnitList } from '@/components/units';
import { About } from './About';
import { Modal } from '@/components/layout/Modal';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { UnitModal } from '@/components/units/UnitModal';

type SettingsTab = 'settings' | 'categories' | 'units' | 'about';

const tabs = [
  { id: 'settings', label: 'settings.title', icon: SettingsIcon },
  { id: 'categories', label: 'category.title', icon: Folder },
  { id: 'units', label: 'unit.title', icon: Scale },
  { id: 'about', label: 'nav.about', icon: Info },
];

export function Settings() {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme, exportData, importData, clearAllData, setLanguage: setStoreLanguage, logLimit, setLogLimit, categories, units } = useStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('settings');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
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

  const renderSettingsContent = () => (
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
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <History className="w-5 h-5" />
          {t('settings.logs')}
        </h2>
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
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Database className="w-5 h-5" />
          {t('settings.dataManagement')}
        </h2>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'settings':
        return renderSettingsContent();
      case 'categories':
        return <CategoryList inSettingsPage onAdd={() => setShowCategoryModal(true)} />;
      case 'units':
        return <UnitList inSettingsPage onAdd={() => setShowUnitModal(true)} />;
      case 'about':
        return <About />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-center gap-4 py-4 px-2 border-b border-[var(--color-border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsTab)}
            className={`flex flex-col items-center gap-1 min-w-[60px] transition-colors ${
              activeTab === tab.id
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              activeTab === tab.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)]'
            }`}>
              {tab.icon && <tab.icon className="w-5 h-5" />}
            </div>
            <span className="text-xs font-medium">{t(tab.label)}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto relative">
        {renderTabContent()}
      </div>

      <Modal
        isOpen={showCategoryModal}
        onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
        title={editingCategory ? t('category.edit') : t('category.add')}
      >
        <CategoryModal
          category={editingCategory ? categories.find(c => c.id === editingCategory) : undefined}
          onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
          existingColors={categories.map((c) => c.color)}
        />
      </Modal>

      <Modal
        isOpen={showUnitModal}
        onClose={() => { setShowUnitModal(false); setEditingUnit(null); }}
        title={editingUnit ? t('unit.edit') : t('unit.add')}
      >
        <UnitModal
          unit={editingUnit ? units.find(u => u.id === editingUnit) : undefined}
          onClose={() => { setShowUnitModal(false); setEditingUnit(null); }}
        />
      </Modal>

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
