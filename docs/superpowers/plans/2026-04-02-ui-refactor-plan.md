# Inventorry UI Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor Inventorry UI: move search to header, simplify navigation, update settings structure, add FAB to list pages, improve opened product visualization.

**Architecture:** 
- Search component: local state in Header, expandable overlay design
- Navigation: simplified drawer (3 items), settings with horizontal tabs
- List pages: FAB pattern consistent across products, categories, units
- Product cards: category-colored left border for opened products

**Tech Stack:** React, TypeScript, Tailwind CSS, Zustand, Lucide icons, FontAwesome icons

---

## Task 1: Update i18n translations

**Files:**
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/hu.json`

- [ ] **Step 1: Add translations to en.json**

Add after line 97 (before closing brace):
```json
,
    "search": "Search",
    "dataManagement": "Data Management"
```

- [ ] **Step 2: Add translations to hu.json**

Add after line 97 (before closing brace):
```json
,
    "search": "Keresés",
    "dataManagement": "Adatok kezelése"
```

- [ ] **Step 3: Commit**
```bash
git add src/i18n/en.json src/i18n/hu.json
git commit -m "i18n: add search and data management translations"
```

---

## Task 2: Remove theme toggle from Header, add search field

**Files:**
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Read current Header.tsx**

- [ ] **Step 2: Rewrite Header component**

Replace entire file content:
```tsx
import { useState, useRef, useEffect } from 'react';
import { Menu, Search, X } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  onSearchChange?: (query: string) => void;
}

export function Header({ onMenuClick, title, onSearchChange }: HeaderProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
    setSearchQuery('');
    onSearchChange?.('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCloseSearch();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isSearchExpanded && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        handleCloseSearch();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchExpanded]);

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="flex h-14 items-center justify-between px-4 gap-2">
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className={`font-semibold transition-all ${isSearchExpanded ? 'hidden sm:block' : ''}`}>
            {title}
          </h1>
        </div>

        <div className={`flex items-center transition-all duration-200 ${isSearchExpanded ? 'flex-1' : ''}`}>
          {!isSearchExpanded ? (
            <button
              onClick={handleSearchClick}
              className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
          ) : (
            <>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Search"
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <button
                onClick={handleCloseSearch}
                className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/components/layout/Header.tsx
git commit -m "refactor: replace theme toggle with expandable search in header"
```

---

## Task 3: Simplify drawer navigation

**Files:**
- Modify: `src/components/layout/Drawer.tsx`

- [ ] **Step 1: Read current Drawer.tsx**

- [ ] **Step 2: Update Drawer nav items**

Replace the navItems array (lines 16-23) with:
```tsx
const navItems: { view: View; icon: typeof Package; labelKey: string }[] = [
  { view: 'products', icon: Package, labelKey: 'nav.products' },
  { view: 'settings', icon: Settings, labelKey: 'nav.settings' },
  { view: 'logs', icon: ScrollText, labelKey: 'nav.logs' },
];
```

- [ ] **Step 3: Remove unused imports**

Update imports (line 1):
```tsx
import { X, Package, Settings, ScrollText } from 'lucide-react';
```

- [ ] **Step 4: Commit**
```bash
git add src/components/layout/Drawer.tsx
git commit -m "refactor: simplify drawer to products, settings, logs"
```

---

## Task 4: Create Settings page with tabs

**Files:**
- Modify: `src/components/settings/Settings.tsx`

- [ ] **Step 1: Read current Settings.tsx**

- [ ] **Step 2: Rewrite Settings with tabs**

Replace entire file content:
```tsx
import { useState, useRef } from 'react';
import { Download, Upload, Trash2, Globe, Palette, Check, ScrollText, Database, Folder, Scale, Info } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import { CategoryList } from '@/components/categories';
import { UnitList } from '@/components/units';
import { About } from '@/components/settings/About';

type SettingsTab = 'settings' | 'categories' | 'units' | 'about';

export function Settings() {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme, exportData, importData, clearAllData, setLanguage: setStoreLanguage, logLimit, setLogLimit } = useStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('settings');
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

  const tabs: { id: SettingsTab; label: string; icon?: typeof Globe }[] = [
    { id: 'settings', label: t('settings.title'), icon: Settings },
    { id: 'categories', label: t('category.title'), icon: Folder },
    { id: 'units', label: t('unit.title'), icon: Scale },
    { id: 'about', label: t('nav.about'), icon: Info },
  ];

  if (activeTab !== 'settings') {
    const tabConfig = tabs.find(t => t.id === activeTab);
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 rounded-lg hover:bg-[var(--color-border)]"
          >
            ←
          </button>
          <h2 className="font-semibold">{tabConfig?.label}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'categories' && <CategoryList inSettingsPage />}
          {activeTab === 'units' && <UnitList inSettingsPage />}
          {activeTab === 'about' && <About />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-[var(--color-border)] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => tab.id !== 'settings' && setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent hover:text-[var(--color-primary)]'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
            <ScrollText className="w-5 h-5" />
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
      </div>

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
```

- [ ] **Step 3: Add Settings import**

Update imports in the component (use Settings icon instead of generic Settings):
```tsx
import { Settings as SettingsIcon } from 'lucide-react';
```

And update tabs array to use SettingsIcon:
```tsx
{ id: 'settings', label: t('settings.title'), icon: SettingsIcon },
```

- [ ] **Step 4: Commit**
```bash
git add src/components/settings/Settings.tsx
git commit -m "refactor: add tabs to settings with categories, units, about"
```

---

## Task 5: Update CategoryList for FAB pattern

**Files:**
- Modify: `src/components/categories/CategoryList.tsx`

- [ ] **Step 1: Read current CategoryList.tsx**

- [ ] **Step 2: Update CategoryList component**

Update component to accept `inSettingsPage` prop and use FAB:
```tsx
import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import { Modal } from '@/components/layout/Modal';
import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import { CategoryModal } from './CategoryModal';
import type { Category } from '@/types';

interface CategoryListProps {
  inSettingsPage?: boolean;
}

export function CategoryList({ inSettingsPage = false }: CategoryListProps) {
  const { t } = useI18n();
  const { categories, products, addCategory, updateCategory, deleteCategory, reorderCategories, canDeleteCategory } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  // ... rest of component logic stays the same, but remove header add button

  return (
    <div className={`flex flex-col h-full ${inSettingsPage ? '' : ''}`}>
      {!inSettingsPage && (
        <div className="p-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl border border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            + {t('category.add')}
          </button>
        </div>
      )}

      {/* existing list content */}

      {categories.length === 0 ? (
        <div className="flex-1 text-center py-12 text-[var(--color-text-secondary)]">
          <p>{t('category.noCategories')}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {/* sortable list */}
        </div>
      )}

      {inSettingsPage && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--color-primary)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* modals */}
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/components/categories/CategoryList.tsx
git commit -m "refactor: add FAB to categories page"
```

---

## Task 6: Update UnitList for FAB pattern

**Files:**
- Modify: `src/components/units/UnitList.tsx`

- [ ] **Step 1: Read current UnitList.tsx**

- [ ] **Step 2: Update UnitList component**

Similar changes as CategoryList - add `inSettingsPage` prop and FAB.

- [ ] **Step 3: Commit**
```bash
git add src/components/units/UnitList.tsx
git commit -m "refactor: add FAB to units page"
```

---

## Task 7: Update App.tsx to remove direct routes

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Read current App.tsx**

- [ ] **Step 2: Update App.tsx**

Remove unused imports and simplify view handling:
```tsx
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
```

- [ ] **Step 3: Commit**
```bash
git add src/App.tsx
git commit -m "refactor: simplify app routes to products, settings, logs"
```

---

## Task 8: Update product row with category-colored border for opened products

**Files:**
- Modify: `src/components/products/ProductList.tsx`

- [ ] **Step 1: Read current ProductList.tsx (SwipeableRow component)**

- [ ] **Step 2: Update SwipeableRow to add border for opened products**

Find the card container (around line 125) and update:
```tsx
<div
  className={`p-3 rounded-xl border transition-colors relative ${
    status === 'out'
      ? 'bg-[var(--color-out-of-stock)] border-red-300 dark:border-red-800'
      : status === 'low'
      ? 'bg-[var(--color-low-stock)] border-yellow-300 dark:border-yellow-800'
      : 'bg-[var(--color-surface)] border-[var(--color-border)]'
  } ${product.opened ? 'border-l-4' : ''}`}
  style={product.opened ? { borderLeftColor: categoryColor } : undefined}
>
```

Also remove the faWineGlassEmpty icon from the second row (around line 152).

- [ ] **Step 3: Commit**
```bash
git add src/components/products/ProductList.tsx
git commit -m "feat: add category-colored border for opened products"
```

---

## Task 9: Set default theme to System

**Files:**
- Modify: `src/store/useStore.ts`

- [ ] **Step 1: Read useStore.ts (around line 15)**

- [ ] **Step 2: Change default theme**

Change line 16:
```tsx
theme: 'system',
```

- [ ] **Step 3: Commit**
```bash
git add src/store/useStore.ts
git commit -m "feat: set default theme to system"
```

---

## Task 10: Update Drawer View type

**Files:**
- Modify: `src/components/layout/Drawer.tsx`

- [ ] **Step 1: Update View type**

Change line 4:
```tsx
type View = 'products' | 'settings' | 'logs';
```

- [ ] **Step 2: Commit**
```bash
git add src/components/layout/Drawer.tsx
git commit -m "chore: update View type"
```

---

## Task 11: Final build and verify

- [ ] **Step 1: Run build**
```bash
npm run build
```

- [ ] **Step 2: Run lint**
```bash
npm run lint
```

- [ ] **Step 3: Fix any issues**

- [ ] **Step 4: Commit final changes**
```bash
git add -A
git commit -m "feat: complete UI refactoring v1.2.0"
```

---

## Spec Coverage Check

- [x] Search field in header with compact/expanded states
- [x] Search overlay works without pushing header down
- [x] X button closes expanded search
- [x] Drawer only shows: Products, Settings, Logs
- [x] Settings page has horizontal tabs: Settings, Categories, Units, About
- [x] All Settings sections have icons (Globe, Palette, ScrollText, Database)
- [x] "Data Management" translation correct in both languages
- [x] Theme toggle removed from header
- [x] Default theme is "System" for new users
- [x] Categories page has FAB button
- [x] Units page has FAB button
- [x] Opened products show 4px category-colored left border
- [x] Wine glass icon removed from product row
