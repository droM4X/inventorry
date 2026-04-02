# Inventorry UI Refactoring - Design Spec

**Date:** 2026-04-02
**Version:** 1.1.0 → 1.2.0

---

## 1. Search Field Refactor

### Location
- Move from main content area to header
- Aligned to right side, next to where theme toggle currently is

### States
**Compact (default):**
- Small input field (w-10, h-10)
- Magnifying glass icon inside (Search icon from lucide)
- Placeholder: "Search"
- Read-only
- Background: transparent or subtle

**Expanded (on tap):**
- Full width minus padding
- Input becomes editable, auto-focuses
- X button (Times icon) appears on right to close
- Overlay style: floats above header content
- Animation: smooth width transition

**Collapse behavior:**
- Tap X button to collapse back to compact
- Tap outside to collapse
- ESC key to collapse

---

## 2. Navigation Structure

### Drawer Menu Items
Remove: Categories, Units, About
Keep: Products, Settings, Logs

### Settings Page Sub-navigation
Horizontal tabs with underline indicator:
1. Settings
2. Categories
3. Units
4. About

**Tab bar style:** Full-width horizontal tabs at top of page

---

## 3. Settings Page Updates

### Section Icons
Add icons to all sections:
- Language: Globe (existing)
- Theme: Palette (existing)
- Logs: ScrollText icon
- Data Management: Database icon

### Rename
- "Data" → "Data Management" (EN)
- "Data" → "Adatok kezelése" (HU)

---

## 4. Theme Toggle Removal

### Changes
- Remove theme button from header completely
- Keep theme options in Settings page
- Default theme: "System"

### Implementation
- Remove cycleTheme function from Header
- Remove theme-related imports and state from Header
- Set default theme to 'system' in store

---

## 5. Categories & Units Pages

### Add Button
- Replace current "Add" button in header with FAB
- Position: Fixed, bottom-right (bottom-6, right-6)
- Style: Same as Products page FAB (blue circle with + icon)
- Opens add modal

### Remove
- Remove "Add" button from header area

---

## 6. Opened Product Visual

### Change
- Remove faWineGlassEmpty icon from product row
- Add 4px border-left using product's **category color**
- Rounded left corners matching card border-radius

### Implementation
- Apply conditional class when `product.opened === true`
- Border color: category color (via getCategoryColor)
- Border width: 4px
- Border style: solid
- Border radius: rounded-l-xl (matches card)

---

## Technical Notes

### Files to Modify
- `src/components/layout/Header.tsx` - Remove theme, add search
- `src/components/layout/Drawer.tsx` - Simplify nav items
- `src/components/products/ProductList.tsx` - Update product row styling
- `src/components/settings/Settings.tsx` - Add tabs, update sections
- `src/components/categories/CategoryList.tsx` - Add FAB
- `src/components/units/UnitList.tsx` - Add FAB
- `src/App.tsx` - Remove Categories/Units/About direct routes
- `src/i18n/en.json` - Add translations
- `src/i18n/hu.json` - Add translations
- `src/store/useStore.ts` - Default theme to 'system'

### State Management
- Search state: local state in Header (or lift to App)
- Settings tabs: local state in Settings component
- Product opened border: derived from category color

### Animation
- Search expand: CSS transition on width (200ms ease)
- Search collapse: reverse transition

---

## Acceptance Criteria

- [ ] Search field in header with compact/expanded states
- [ ] Search overlay works without pushing header down
- [ ] X button closes expanded search
- [ ] Drawer only shows: Products, Settings, Logs
- [ ] Settings page has horizontal tabs: Settings, Categories, Units, About
- [ ] All Settings sections have icons
- [ ] "Data Management" translation correct in both languages
- [ ] Theme toggle removed from header
- [ ] Default theme is "System" for new users
- [ ] Categories page has FAB button
- [ ] Units page has FAB button
- [ ] Opened products show 4px category-colored left border
- [ ] Wine glass icon removed from product row
