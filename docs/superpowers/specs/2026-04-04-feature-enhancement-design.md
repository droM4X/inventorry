# Feature Enhancement Spec

Date: 2026-04-04

## 1. Multi-Database Support

### Overview
Enable users to maintain multiple independent databases, each with the same data structure, stored in separate localStorage entries.

### Storage Structure
- **Database list**: localStorage key `inventorry-databases` → JSON array of database names
- **Per-database storage**: localStorage key `inventorry-{dbName}` → full app state (products, categories, units, etc.)
- **Last used**: localStorage key `inventorry-lastUsed` → database name string
- **Default database name**: `default`

### App Initialization
1. On app load, read `inventorry-lastUsed`
2. If no value exists:
   - Check if `inventorry-default` exists (existing data from single-db version)
   - If yes: migrate by writing to `inventorry-databases` as `["default"]`, keep data
   - If no: create fresh default database with `inventorry-databases = ["default"]`
3. Load the persisted state from `inventorry-{lastUsed}` into Zustand store

### Store Changes
- Zustand store remains single-instance (in-memory)
- `persist` middleware storage key becomes dynamic: `inventorry-{activeDatabase}`
- Add `activeDatabase: string` state
- Add `setActiveDatabase(name: string)` action
- Add `getDatabases(): string[]` action (reads from localStorage directly)
- Add `createDatabase(name: string): boolean` action
- Export/Import/Clear operations use current `activeDatabase`

### UI Changes

#### Header (`Header.tsx`)
```tsx
<h1 className="text-lg font-semibold">
  {title} <sup className="text-xs font-normal text-[var(--color-text-secondary)]">{dbName}</sup>
</h1>
```
- Pass `dbName` as new prop
- Uses smaller font, secondary color

#### Settings Page - Data Management Section
- Add row above existing buttons:
  - `<select>` listing all databases (from `inventorry-databases`)
  - `<button>` with `+` icon (Plus icon from lucide)
- On database change: update `activeDatabase`, save to `inventorry-lastUsed`, reload page
- On `+` click: open modal

#### Add Database Modal
- Text input for database name
- Validation regex: `/^[a-zA-Z0-9_ ]{1,16}$/` (1-16 chars, no leading/trailing spaces)
- Character counter showing "X/16"
- Error message if invalid
- Cancel and Create buttons
- On create: add to `inventorry-databases`, create empty storage, reload

### Validation Rules
- Length: 1-16 characters
- Characters: a-z, A-Z, 0-9, underscore, space only
- Cannot start with space
- Cannot end with space
- Case sensitive (but could add "already exists" check)

### Export/Import Behavior
- Export: exports from `inventorry-{activeDatabase}`
- Import: imports to `inventorry-{activeDatabase}` (replaces current)
- Clear All: clears `inventorry-{activeDatabase}` only

---

## 2. Remove Log Option 500

### Changes
In `Settings.tsx`, remove `<option value={500}>500</option>` from the log limit select.

---

## 3. Search Auto-Expand Collapsed Sections

### Overview
When user searches and a matching product is in a collapsed section, automatically expand that section.

### Implementation
In `ProductList.tsx`:
1. When `searchQuery` changes and is non-empty:
2. Get list of category IDs that have matching products in `filteredProducts`
3. For each matching category ID, remove from `collapsedSections` if present
4. Section IDs follow pattern: `{filter}-{categoryId}` (e.g., `all-important`, `low-stock-groceries`)

### Logic
```typescript
useEffect(() => {
  if (searchQuery.trim()) {
    const matchedCategoryIds = new Set<string>();
    filteredProducts.forEach(p => {
      const catId = p.categoryId || 'uncategorized';
      matchedCategoryIds.add(catId);
    });
    // Uncollapse each matched section
    matchedCategoryIds.forEach(catId => {
      const sectionId = `${filter}-${catId}`;
      if (collapsedSections.includes(sectionId)) {
        toggleCollapsedSection(sectionId);
      }
    });
  }
}, [searchQuery, filteredProducts, filter]);
```

---

## 4. Release Log

### Overview
Create a changelog/release notes file that is editable and bundled with the PWA for offline access.

### File Location
`docs/RELEASE_LOG.md`

### Content Format
```markdown
# Release Log

## v1.2.1 - 2026-04-04
- Added multi-database support
- Fixed search auto-expand behavior
- Removed 500 log limit option

## v1.2.0 - 2026-xx-xx
...
```

### Bundling (Vite Configuration)
Add to `vite.config.ts`:
```typescript
export default defineConfig({
  // ... existing config
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  plugins: [
    {
      name: 'copy-release-log',
      writeBundle() {
        // File is in public/, served as-is
      }
    }
  ]
})
```

Alternative: Copy `docs/RELEASE_LOG.md` to `public/release_log.md` during build via script.

### Display in About Page
- Import the release log content
- Parse markdown to HTML (simple conversion for headers, lists, paragraphs)
- Display at bottom of Settings/About page
- Show version, date, and changelog entries

### Implementation
In `About.tsx`:
1. Import release log content via `import releaseLogContent from '../../../docs/RELEASE_LOG.md?raw'`
2. Parse markdown (basic: split by lines, render headers/lists/paragraphs)
3. Display below existing content

---

## Files to Modify

1. `src/store/useStore.ts` - Add database management actions
2. `src/components/layout/Header.tsx` - Add dbName prop
3. `src/components/settings/Settings.tsx` - Add database selector, modal, remove 500 option
4. `src/components/products/ProductList.tsx` - Add search auto-expand effect
5. `src/components/settings/About.tsx` - Add release log display
6. `docs/RELEASE_LOG.md` - Create with initial content
7. `vite.config.ts` - Add copy step for release log to public/

## Dependencies
- No new dependencies needed
- Use existing `Modal` component for add database modal
