# Feature Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement multi-database support, remove 500 log option, add search auto-expand, and add release log display.

**Architecture:** Multi-database via separate localStorage keys per database. Search auto-expand via useEffect on searchQuery change. Release log bundled with PWA via copy to public/.

**Tech Stack:** React, Zustand, Vite, PWA

---

## Task 1: Multi-Database Store Support

**Files:**
- Modify: `src/store/useStore.ts`

### Subtask 1.1: Helper Functions for Database Management

- [ ] **Step 1: Add localStorage helper functions**

Add these functions before the `useStore` definition:

```typescript
const STORAGE_PREFIX = 'inventorry-';
const DATABASES_KEY = 'inventorry-databases';
const LAST_USED_KEY = 'inventorry-lastUsed';

export const getDatabaseList = (): string[] => {
  const data = localStorage.getItem(DATABASES_KEY);
  if (!data) return ['default'];
  try {
    const list = JSON.parse(data);
    return Array.isArray(list) && list.length > 0 ? list : ['default'];
  } catch {
    return ['default'];
  }
};

export const setDatabaseList = (databases: string[]): void => {
  localStorage.setItem(DATABASES_KEY, JSON.stringify(databases));
};

export const getLastUsedDatabase = (): string => {
  return localStorage.getItem(LAST_USED_KEY) || 'default';
};

export const setLastUsedDatabase = (name: string): void => {
  localStorage.setItem(LAST_USED_KEY, name);
};

export const initializeDatabases = (): string => {
  const existingList = localStorage.getItem(DATABASES_KEY);
  const lastUsed = getLastUsedDatabase();
  
  if (!existingList) {
    setDatabaseList(['default']);
    setLastUsedDatabase('default');
    return 'default';
  }
  
  return lastUsed;
};
```

### Subtask 1.2: Update Store Interface and Implementation

- [ ] **Step 1: Add new state fields and actions to StoreState type**

Open `src/types/index.ts` and add:
```typescript
activeDatabase: string;
```

And add these action signatures:
```typescript
setActiveDatabase: (name: string) => void;
createDatabase: (name: string) => boolean;
getDatabaseList: () => string[];
```

- [ ] **Step 2: Modify store initialization**

In `useStore.ts`, update the initial state and add actions:

```typescript
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ... existing fields
      
      activeDatabase: 'default',
      
      // ... existing actions
      
      setActiveDatabase: (name: string) => {
        setLastUsedDatabase(name);
        set({ activeDatabase: name });
        window.location.reload();
      },
      
      createDatabase: (name: string) => {
        const normalizedName = name.trim();
        const pattern = /^[a-zA-Z0-9_ ]{1,16}$/;
        if (!pattern.test(normalizedName)) return false;
        if (normalizedName !== name) return false;
        
        const databases = getDatabaseList();
        if (databases.includes(normalizedName)) return false;
        
        databases.push(normalizedName);
        setDatabaseList(databases);
        return true;
      },
      
      getDatabaseList: () => getDatabaseList(),
      
      // ... existing exportData, importData, clearAllData remain the same
    }),
    {
      name: `${STORAGE_PREFIX}${getLastUsedDatabase()}`,
      // ... existing partialize
    }
  )
);
```

- [ ] **Step 3: Make persist storage key dynamic**

The current persist config has a static `name`. Change it to read from `getLastUsedDatabase()` at initialization. However, since `persist` evaluates the config at module load, we need a different approach:

Actually, the better approach is to handle the storage key dynamically. Update the persist config:

```typescript
{
  name: `${STORAGE_PREFIX}runtime`,
  storage: {
    getItem: (name: string) => {
      const dbName = getLastUsedDatabase();
      const fullKey = `${STORAGE_PREFIX}${dbName}`;
      const data = localStorage.getItem(fullKey);
      return data ? JSON.parse(data) : null;
    },
    setItem: (name: string, value: unknown) => {
      const dbName = getLastUsedDatabase();
      const fullKey = `${STORAGE_PREFIX}${dbName}`;
      localStorage.setItem(fullKey, JSON.stringify(value));
    },
    removeItem: (name: string) => {
      const dbName = getLastUsedDatabase();
      const fullKey = `${STORAGE_PREFIX}${dbName}`;
      localStorage.removeItem(fullKey);
    },
  },
  // ... rest of config
}
```

Note: This approach intercepts the storage operations. The `name` field is still required by zustand persist but won't be used as the storage key.

---

## Task 2: Update Header Component

**Files:**
- Modify: `src/components/layout/Header.tsx:9-65`

- [ ] **Step 1: Add dbName prop to Header**

Update the interface and destructuring:
```typescript
interface HeaderProps {
  title: string;
  dbName?: string;
  onSearchChange?: (query: string) => void;
}

export function Header({ title, dbName, onSearchChange }: HeaderProps) {
```

- [ ] **Step 2: Update title rendering**

Find this line:
```typescript
<h1 className="text-lg font-semibold">{title}</h1>
```

Replace with:
```typescript
<h1 className="text-lg font-semibold">
  {title}
  {dbName && <sup className="text-xs font-normal text-[var(--color-text-secondary)]">{dbName}</sup>}
</h1>
```

- [ ] **Step 3: Update App.tsx to pass dbName**

Open `src/App.tsx` and:
1. Import `getDatabaseList` from store
2. Get `activeDatabase` from store
3. Pass `dbName={activeDatabase}` to Header

```typescript
import { useStore } from '@/store/useStore';
import { getDatabaseList } from '@/store/useStore';

// In component:
const { activeDatabase } = useStore();

// Pass to Header:
<Header title={t('app.name')} dbName={activeDatabase} onSearchChange={handleSearchChange} />
```

---

## Task 3: Add Database Selector to Settings

**Files:**
- Modify: `src/components/settings/Settings.tsx`
- Modify: `src/i18n/en.json` (add translations)
- Modify: `src/i18n/hu.json` (add translations)

### Subtask 3.1: Add Translations

- [ ] **Step 1: Add translation keys**

In `en.json`, add to settings section:
```json
"database": "Database",
"addDatabase": "Add Database",
"databaseName": "Database name",
"databaseNamePlaceholder": "Enter database name",
"databaseNameInvalid": "Invalid name: 1-16 characters (letters, numbers, underscore, space). Cannot start or end with space.",
"databaseNameExists": "Database already exists",
"createDatabase": "Create",
"cancel": "Cancel"
```

In `hu.json`, add:
```json
"database": "Adatbázis",
"addDatabase": "Adatbázis hozzáadása",
"databaseName": "Adatbázis neve",
"databaseNamePlaceholder": "Adatbázis név megadása",
"databaseNameInvalid": "Érvénytelen név: 1-16 karakter (betű, szám, aláhúzás, szóköz). Nem kezdődhet vagy végződhet szóközzel.",
"databaseNameExists": "Az adatbázis már létezik",
"createDatabase": "Létrehozás",
"cancel": "Mégse"
```

### Subtask 3.2: Add Database Selector UI

- [ ] **Step 1: Import Plus icon and add state**

Add to imports:
```typescript
import { Download, Upload, Trash2, Globe, Palette, Check, Folder, Scale, Info, History, Database, Settings as SettingsIcon, Plus } from 'lucide-react';
```

Add state after other useState declarations:
```typescript
const [showAddDatabaseModal, setShowAddDatabaseModal] = useState(false);
const [newDbName, setNewDbName] = useState('');
const [dbNameError, setDbNameError] = useState('');
```

Get database list and active database:
```typescript
const { activeDatabase, setActiveDatabase, createDatabase, getDatabaseList } = useStore();
const databases = getDatabaseList();
```

- [ ] **Step 2: Add database selector row**

Find the Data Management section header and add selector above the buttons:
```typescript
<section className="space-y-3">
  <h2 className="flex items-center gap-2 text-lg font-semibold">
    <Database className="w-5 h-5" />
    {t('settings.dataManagement')}
  </h2>
  
  {/* Database Selector */}
  <div className="flex items-center gap-2">
    <select
      value={activeDatabase}
      onChange={(e) => setActiveDatabase(e.target.value)}
      className="flex-1 py-2 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      {databases.map((db) => (
        <option key={db} value={db}>{db}</option>
      ))}
    </select>
    <button
      onClick={() => setShowAddDatabaseModal(true)}
      className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors"
      title={t('settings.addDatabase')}
    >
      <Plus className="w-5 h-5" />
    </button>
  </div>
  
  {/* Existing buttons... */}
```

- [ ] **Step 3: Add Add Database Modal**

Add the modal component after the existing Modals:
```typescript
<Modal
  isOpen={showAddDatabaseModal}
  onClose={() => { setShowAddDatabaseModal(false); setNewDbName(''); setDbNameError(''); }}
  title={t('settings.addDatabase')}
>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">
        {t('settings.databaseName')}
      </label>
      <input
        type="text"
        value={newDbName}
        onChange={(e) => {
          setNewDbName(e.target.value);
          setDbNameError('');
        }}
        placeholder={t('settings.databaseNamePlaceholder')}
        maxLength={16}
        className="w-full py-2 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-[var(--color-text-secondary)]">
          {newDbName.length}/16
        </span>
        {dbNameError && (
          <span className="text-xs text-red-500">{dbNameError}</span>
        )}
      </div>
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => { setShowAddDatabaseModal(false); setNewDbName(''); setDbNameError(''); }}
        className="flex-1 py-2 px-4 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors"
      >
        {t('settings.cancel')}
      </button>
      <button
        onClick={() => {
          const trimmed = newDbName.trim();
          const pattern = /^[a-zA-Z0-9_ ]{1,16}$/;
          
          if (!pattern.test(trimmed)) {
            setDbNameError(t('settings.databaseNameInvalid'));
            return;
          }
          if (trimmed !== newDbName) {
            setDbNameError(t('settings.databaseNameInvalid'));
            return;
          }
          if (databases.includes(trimmed)) {
            setDbNameError(t('settings.databaseNameExists'));
            return;
          }
          
          if (createDatabase(trimmed)) {
            setActiveDatabase(trimmed);
          }
        }}
        className="flex-1 py-2 px-4 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
      >
        {t('settings.createDatabase')}
      </button>
    </div>
  </div>
</Modal>
```

---

## Task 4: Remove 500 Log Option

**Files:**
- Modify: `src/components/settings/Settings.tsx:170-173`

- [ ] **Step 1: Remove the 500 option**

Find and remove this line:
```tsx
<option value={500}>500</option>
```

---

## Task 5: Search Auto-Expand

**Files:**
- Modify: `src/components/products/ProductList.tsx:243-272`

- [ ] **Step 1: Add useEffect for auto-expand**

Find the existing `useEffect` for menu click handling (around line 243) and add a new one after it:

```typescript
useEffect(() => {
  if (searchQuery.trim()) {
    const matchedCategoryIds = new Set<string>();
    filteredProducts.forEach((product) => {
      const catId = product.categoryId || 'uncategorized';
      matchedCategoryIds.add(catId);
      if (product.important) {
        matchedCategoryIds.add('important');
      }
    });
    
    matchedCategoryIds.forEach((catId) => {
      const sectionId = `${filter}-${catId}`;
      if (collapsedSections.includes(sectionId)) {
        toggleCollapsedSection(sectionId);
      }
    });
  }
}, [searchQuery, filteredProducts, filter, collapsedSections]);
```

Note: The `collapsedSections` dependency is intentional - we only want to trigger this when searchQuery changes, not when sections are actually collapsed.

Actually, to avoid infinite loops, we should use a ref for the last search query:

```typescript
const lastSearchRef = useRef('');

useEffect(() => {
  if (searchQuery === lastSearchRef.current) return;
  lastSearchRef.current = searchQuery;
  
  if (searchQuery.trim()) {
    const matchedCategoryIds = new Set<string>();
    filteredProducts.forEach((product) => {
      const catId = product.categoryId || 'uncategorized';
      matchedCategoryIds.add(catId);
      if (product.important) {
        matchedCategoryIds.add('important');
      }
    });
    
    matchedCategoryIds.forEach((catId) => {
      const sectionId = `${filter}-${catId}`;
      if (collapsedSections.includes(sectionId)) {
        toggleCollapsedSection(sectionId);
      }
    });
  }
}, [searchQuery]);
```

---

## Task 6: Release Log

**Files:**
- Create: `docs/RELEASE_LOG.md`
- Modify: `vite.config.ts` (add copy plugin)
- Modify: `src/components/settings/About.tsx`
- Create: `public/release_log.md`

### Subtask 6.1: Create Release Log File

- [ ] **Step 1: Create docs/RELEASE_LOG.md**

```markdown
# Release Log

## v1.3.0 - 2026-04-04
- Added multi-database support for managing separate inventories
- Fixed search to automatically expand collapsed sections with matching products
- Removed 500 log limit option

## v1.2.0 - 2026-02-15
- Initial feature release with products, categories, units management
- Import/export data functionality
- Activity logging
```

- [ ] **Step 2: Create initial public/release_log.md**

Same content as above.

### Subtask 6.2: Add Vite Copy Plugin

- [ ] **Step 1: Install vite-plugin-copy**

```bash
npm install -D vite-plugin-copy
```

- [ ] **Step 2: Update vite.config.ts**

Add import and plugin:

```typescript
import copy from 'vite-plugin-copy';

// In plugins array:
copy({
  targets: [
    { src: 'docs/RELEASE_LOG.md', dest: 'public/', rename: 'release_log.md' },
  ],
  hook: 'writeBundle',
}),
```

### Subtask 6.3: Display Release Log in About

- [ ] **Step 1: Update About.tsx**

```typescript
import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { APP_VERSION } from '@/lib/version';

export function About() {
  const { t } = useI18n();
  const [releaseLog, setReleaseLog] = useState<string>('');
  
  useEffect(() => {
    fetch('/release_log.md')
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
```

---

## Task 7: Initialize Database on First Run

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Add initialization before App render**

Open `src/main.tsx` and add:

```typescript
import { initializeDatabases } from '@/store/useStore';

// Initialize databases before render
initializeDatabases();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

---

## Verification

After all tasks complete:

- [ ] Run `npm run build` to verify no build errors
- [ ] Run `npm run lint` if available to check linting
- [ ] Verify TypeScript with `npx tsc --noEmit`
- [ ] Test multi-database creation and switching
- [ ] Test search auto-expand with collapsed sections
- [ ] Verify release log displays in About page
