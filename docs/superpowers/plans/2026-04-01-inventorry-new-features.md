# Inventorry New Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 6 new features: category collapse persistence, important items section, long-press-to-edit, enhanced swipe actions, "opened" flag, and version bump.

**Architecture:** Modifications to Product interface and store, rewrites of ProductList.tsx for new interaction patterns, updates to translations.

**Tech Stack:** React, TypeScript, Zustand, Tailwind CSS

---

## File Structure

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add `opened` field to Product |
| `src/store/useStore.ts` | Add `toggleProductOpened` function |
| `src/components/products/ProductList.tsx` | Complete rewrite of swipe logic, long press, important section, opened display |
| `src/components/products/ProductModal.tsx` | Handle `opened` field |
| `src/i18n/en.json` | Add translations |
| `src/i18n/hu.json` | Add translations |
| `package.json` | Bump version to 1.0.1 |
| `src/lib/version.ts` | Update version |

---

### Task 1: Update Types and Store

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/store/useStore.ts`

- [ ] **Step 1: Add `opened` field to Product interface**

```typescript
export interface Product {
  id: string;
  name: string;
  subname?: string;
  categoryId: string;
  unitId: string;
  quantity: number;
  lowStockThreshold: number;
  important: boolean;
  opened: boolean;  // NEW
  createdAt: number;
  updatedAt: number;
}
```

- [ ] **Step 2: Add `toggleProductOpened` to StoreState interface**

```typescript
toggleProductOpened: (id: string) => void;
```

- [ ] **Step 3: Add `toggleProductOpened` implementation in store**

Add after `toggleProductImportant`:
```typescript
toggleProductOpened: (id) => {
  set((state) => ({
    products: state.products.map((p) =>
      p.id === id ? { ...p, opened: !p.opened, updatedAt: Date.now() } : p
    ),
  }));
},
```

- [ ] **Step 4: Update `partialize` to include `opened`**

Already covered by default persist behavior - no change needed.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/store/useStore.ts
git commit -m "feat: add opened field to Product and toggleProductOpened"
```

---

### Task 2: Update Translations

**Files:**
- Modify: `src/i18n/en.json`
- Modify: `src/i18n/hu.json`

- [ ] **Step 1: Add translations to en.json**

Add to product section:
```json
"opened": "opened"
```

Add new section for important category header:
```json
"important": "Important",
```

- [ ] **Step 2: Add translations to hu.json**

Add to product section:
```json
"opened": "bontott"
```

Add:
```json
"important": "Fontos",
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/en.json src/i18n/hu.json
git commit -m "feat: add translations for opened and important"
```

---

### Task 3: Update ProductModal

**Files:**
- Modify: `src/components/products/ProductModal.tsx`

- [ ] **Step 1: Update productData to include opened field**

In handleSubmit, update the productData object:
```typescript
const productData = {
  name: name.trim(),
  subname: subname.trim() || undefined,
  categoryId,
  unitId,
  quantity: Number(quantity),
  lowStockThreshold: threshold === '' ? 0 : Number(threshold),
  important: product?.important ?? false,
  opened: product?.opened ?? false,  // ADD THIS LINE
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/products/ProductModal.tsx
git commit -m "feat: handle opened field in ProductModal"
```

---

### Task 4: Complete ProductList Rewrite

**Files:**
- Modify: `src/components/products/ProductList.tsx`
- Modify: `package.json`
- Modify: `src/lib/version.ts`

This is the main task. Read the current file fully first.

- [ ] **Step 1: Add faStar import for important section**

```typescript
import { faStar } from '@fortawesome/free-solid-svg-icons';
```

Add to iconMap:
```typescript
'star': faStar,
```

- [ ] **Step 2: Add long press state and handler in SwipeableRow**

Update SwipeableRow component:

```typescript
const [isPressed, setIsPressed] = useState(false);
const [showSwipeActions, setShowSwipeActions] = useState(false);  // NEW
const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const LONG_PRESS_DURATION = 1000;

const handlePointerDown = () => {
  setIsPressed(true);
  pressTimerRef.current = setTimeout(() => {
    onEdit();
    setIsPressed(false);
  }, LONG_PRESS_DURATION);
};

const handlePointerUp = () => {
  setIsPressed(false);
  if (pressTimerRef.current) {
    clearTimeout(pressTimerRef.current);
    pressTimerRef.current = null;
  }
};

const handlePointerLeave = () => {
  setIsPressed(false);
  if (pressTimerRef.current) {
    clearTimeout(pressTimerRef.current);
    pressTimerRef.current = null;
  }
};
```

- [ ] **Step 3: Modify swipe handlers for persistent buttons**

Replace handleTouchStart, handleTouchMove, handleTouchEnd:

```typescript
const handleTouchStart = (e: React.TouchEvent) => {
  if (showSwipeActions) return;  // Don't start new swipe if actions visible
  setStartX(e.touches[0].clientX);
  setIsDragging(true);
};

const handleTouchMove = (e: React.TouchEvent) => {
  if (!isDragging || showSwipeActions) return;
  const currentX = e.touches[0].clientX;
  const diff = currentX - startX;
  if (diff > 0) {
    setOffsetX(Math.min(diff, SWIPE_THRESHOLD + 20));
  } else {
    setOffsetX(Math.max(diff, -(SWIPE_THRESHOLD + 20)));
  }
};

const handleTouchEnd = () => {
  setIsDragging(false);
  if (offsetX > SWIPE_THRESHOLD) {
    setShowSwipeActions(true);
  } else if (offsetX < -SWIPE_THRESHOLD) {
    setShowSwipeActions(true);
  }
  setOffsetX(0);
};
```

- [ ] **Step 4: Update touch handlers and long press in row div**

Replace the row div's event handlers:
```typescript
<div
  ref={rowRef}
  className={`relative bg-[var(--color-surface)] transition-transform ${
    isPressed ? 'scale-[0.98]' : ''
  }`}
  style={{ transform: showSwipeActions ? 'none' : `translateX(${offsetX}px)` }}
  onPointerDown={handlePointerDown}
  onPointerUp={handlePointerUp}
  onPointerLeave={handlePointerLeave}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
```

- [ ] **Step 5: Add click handler to dismiss swipe actions**

Add onClick to dismiss when tapping the row:
```typescript
const handleRowClick = () => {
  if (showSwipeActions) {
    setShowSwipeActions(false);
  }
};
```

Update the row div:
```typescript
onClick={handleRowClick}
```

- [ ] **Step 6: Update swipe buttons for delete and opened toggle**

Replace the swipe action buttons section:
```typescript
<div className="absolute inset-0 flex">
  <div 
    className={`flex items-center justify-center w-20 bg-red-500 text-white cursor-pointer transition-opacity ${
      showSwipeActions || offsetX > 30 ? 'opacity-100' : 'opacity-0'
    }`}
    onClick={(e) => {
      e.stopPropagation();
      onDelete();
      setShowSwipeActions(false);
    }}
  >
    <Trash2 className="w-6 h-6" />
  </div>
  <div className="flex-1" />
  <div 
    className={`flex items-center justify-center w-20 bg-orange-500 text-white cursor-pointer transition-opacity ${
      showSwipeActions || offsetX < -30 ? 'opacity-100' : 'opacity-0'
    }`}
    onClick={(e) => {
      e.stopPropagation();
      onToggleOpened();
      setShowSwipeActions(false);
    }}
  >
    <Edit2 className="w-6 h-6" />
  </div>
</div>
```

- [ ] **Step 7: Add onToggleOpened prop to SwipeableRow**

Update interface and component props:
```typescript
interface SwipeableRowProps {
  // ... existing props
  onToggleOpened: () => void;  // ADD THIS
}
```

- [ ] **Step 8: Display "opened" status**

Add after the quantity line:
```typescript
{product.opened && (
  <span className="text-xs italic text-orange-600 dark:text-orange-400">
    + {t('product.opened')}
  </span>
)}
```

- [ ] **Step 9: Update ProductList to handle collapsed state per filter**

In ProductList component, update collapsedCategories state:
```typescript
const [collapsedCategories, setCollapsedCategories] = useState<Record<FilterType, Set<string>>>({
  'all': new Set(),
  'low-stock': new Set(),
});
```

Update the useEffect:
```typescript
useEffect(() => {
  if (filter === 'low-stock') {
    setCollapsedCategories((prev) => ({ ...prev, 'low-stock': new Set() }));
  }
}, [filter]);
```

Update toggleCategory:
```typescript
const toggleCategory = (categoryId: string) => {
  setCollapsedCategories((prev) => {
    const current = prev[filter];
    const next = new Set(current);
    if (next.has(categoryId)) next.delete(categoryId);
    else next.add(categoryId);
    return { ...prev, [filter]: next };
  });
};
```

Update isCollapsed reference:
```typescript
const isCollapsed = collapsedCategories[filter].has(categoryId);
```

- [ ] **Step 10: Add Important section rendering**

Add after the search/filter section and before the main product list:

```typescript
{/* Important Section */}
{(() => {
  const importantProducts = filteredProducts.filter((p) => p.important);
  if (importantProducts.length === 0) return null;
  
  const isCollapsed = collapsedCategories[filter].has('important');
  
  return (
    <div className="mb-4">
      <button
        onClick={() => toggleCategory('important')}
        className="flex items-center gap-2 w-full py-2 text-left"
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
        <FontAwesomeIcon
          icon={faStar}
          className="w-4 h-4 text-yellow-500"
        />
        <span className="font-medium">{t('product.important')}</span>
        <span className="text-[var(--color-text-secondary)]">
          ({importantProducts.length})
        </span>
      </button>
      {!isCollapsed && (
        <div className="space-y-2 ml-2">
          {importantProducts.map((product) => {
            const categoryColor = getCategoryColor(product.categoryId);
            const categoryIcon = getCategoryIcon(product.categoryId);
            return (
              <SwipeableRow
                key={product.id}
                product={product}
                categoryColor={categoryColor}
                categoryIcon={categoryIcon}
                status={getStockStatus(product)}
                onEdit={() => handleEdit(product.id)}
                onDelete={() => handleDelete(product.id)}
                onQuantityChange={(newQty) => updateProduct(product.id, { quantity: newQty })}
                onToggleImportant={() => toggleProductImportant(product.id)}
                onToggleOpened={() => toggleProductOpened(product.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
})()}
```

- [ ] **Step 11: Update SwipeableRow usage to include onToggleOpened**

Update all SwipeableRow calls:
```typescript
onToggleOpened={() => toggleProductOpened(product.id)}
```

- [ ] **Step 12: Add toggleProductOpened to useStore destructuring**

```typescript
const { products, categories, updateProduct, deleteProduct, toggleProductImportant, toggleProductOpened, getCategoryName, getCategoryColor, getCategoryIcon } = useStore();
```

- [ ] **Step 13: Bump version**

In package.json:
```json
"version": "1.0.1",
```

In src/lib/version.ts:
```typescript
export const APP_VERSION = '1.0.1';
```

- [ ] **Step 14: Build and test**

```bash
npm run build
```

Expected: Success with no errors.

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "feat: add important section, long-press edit, enhanced swipe, opened flag
- Add important items section with star icon before categories
- Long press (1s) opens edit modal
- Swipe shows persistent buttons, tap to execute action
- Swipe left toggles opened flag
- Display 'opened' status after unit
- Category collapse state persisted per filter tab
- Bump version to 1.0.1"
```

---

## Verification

After implementation, verify:
1. Create important products - they appear in Important section
2. Double-tap important product removes it from Important section
3. Long press (1s) opens edit modal
4. Swipe right shows red delete button - tap executes delete
5. Swipe left shows orange opened button - tap toggles opened status
6. Opened products show "+ opened" or "+ bontott"
7. Collapsing categories on "All" tab persists when switching tabs
8. "Low stock" tab always shows all categories expanded
9. Build passes without errors

---

## Self-Review Checklist

- [ ] All spec requirements covered by tasks
- [ ] No placeholders (TBD, TODO, etc.)
- [ ] Type consistency verified
- [ ] Code compiles successfully
- [ ] All commits made

