import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Search, Minus, Edit2, Trash2, ChevronDown, ChevronRight, Package, AlertTriangle } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faGlassWater, faHouse, faUser, faUtensils, faAppleWhole, faBottleWater, faMugHot, faWineGlass, faPills, faWrench, faShirt, faGamepad, faPaw, faCar, faGift, faBox, faBagShopping, faCookie, faDrumstickBite, faCarrot, faPepperHot, faBroom, faSnowflake, faFolder } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import { Modal } from '@/components/layout/Modal';
import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import { ProductModal } from './ProductModal';
import type { FilterType, Product } from '@/types';

const iconMap: Record<string, typeof faCartShopping> = {
  'cart-shopping': faCartShopping,
  'glass-water': faGlassWater,
  'house': faHouse,
  'user': faUser,
  'utensils': faUtensils,
  'apple-whole': faAppleWhole,
  'bottle-water': faBottleWater,
  'mug-hot': faMugHot,
  'wine-glass': faWineGlass,
  'pills': faPills,
  'wrench': faWrench,
  'shirt': faShirt,
  'gamepad': faGamepad,
  'pet': faPaw,
  'car': faCar,
  'gift': faGift,
  'box': faBox,
  'bag-shopping': faBagShopping,
  'cookie': faCookie,
  'drumstick-bite': faDrumstickBite,
  'carrot': faCarrot,
  'pepper-hot': faPepperHot,
  'broom': faBroom,
  'snowflake': faSnowflake,
  'folder': faFolder,
};

interface SwipeableRowProps {
  product: Product;
  categoryColor: string;
  categoryIcon: string;
  status: 'ok' | 'low' | 'out';
  onEdit: () => void;
  onDelete: () => void;
  onQuantityChange: (newQuantity: number) => void;
  onToggleImportant: () => void;
}

function SwipeableRow({ product, categoryColor, categoryIcon, status, onEdit, onDelete, onQuantityChange, onToggleImportant }: SwipeableRowProps) {
  const { t, language } = useI18n();
  const { getUnitName } = useStore();
  const [offsetX, setOffsetX] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const SWIPE_THRESHOLD = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      onToggleImportant();
      setLastTap(0);
    } else {
      setLastTap(now);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
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
      onDelete();
    } else if (offsetX < -SWIPE_THRESHOLD) {
      onEdit();
    }
    setOffsetX(0);
  };

  const isDeleteRevealed = offsetX > 30;
  const isEditRevealed = offsetX < -30;

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 flex">
        <div className={`flex items-center justify-center w-20 bg-red-500 text-white transition-opacity ${isDeleteRevealed ? 'opacity-100' : 'opacity-0'}`}>
          <Trash2 className="w-6 h-6" />
        </div>
        <div className="flex-1" />
        <div className={`flex items-center justify-center w-20 bg-blue-500 text-white transition-opacity ${isEditRevealed ? 'opacity-100' : 'opacity-0'}`}>
          <Edit2 className="w-6 h-6" />
        </div>
      </div>
      <div
        ref={rowRef}
        className="relative bg-[var(--color-surface)] transition-transform"
        style={{ transform: `translateX(${offsetX}px)` }}
        onClick={handleDoubleTap}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`p-3 rounded-xl border transition-colors relative overflow-hidden ${
            status === 'out'
              ? 'bg-[var(--color-out-of-stock)] border-red-300 dark:border-red-800'
              : status === 'low'
              ? 'bg-[var(--color-low-stock)] border-yellow-300 dark:border-yellow-800'
              : 'bg-[var(--color-surface)] border-[var(--color-border)]'
          }`}
        >
          <div className="flex items-center gap-2 relative">
            <FontAwesomeIcon
              icon={iconMap[categoryIcon] || faFolder}
              className="w-5 h-5 flex-shrink-0"
              style={{ color: categoryColor }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {product.name}
                {product.subname && <span className="font-normal text-[var(--color-text-secondary)]"> ({product.subname})</span>}
              </div>
              <div className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                <span>
                  {t('product.quantityFormat', {
                    quantity: product.quantity,
                    unit: getUnitName(product.unitId, language),
                  })}
                </span>
                {product.important && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                    {t('product.important')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onQuantityChange(Math.max(0, product.quantity - 1))}
                className="w-10 h-10 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-border)] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => onQuantityChange(product.quantity + 1)}
                className="w-10 h-10 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-border)] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductList() {
  const { t } = useI18n();
  const { products, categories, updateProduct, deleteProduct, toggleProductImportant, getCategoryName, getCategoryColor, getCategoryIcon } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (filter === 'low-stock') {
      setCollapsedCategories(new Set());
    }
  }, [filter]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => 
        p.name.toLowerCase().includes(query) || 
        (p.subname && p.subname.toLowerCase().includes(query))
      );
    }

    if (filter === 'low-stock') {
      result = result.filter((p) => {
        if (p.lowStockThreshold > 0) {
          return p.quantity <= p.lowStockThreshold;
        }
        return p.quantity === 0;
      });
    }

    return result;
  }, [products, searchQuery, filter]);

  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    
    filteredProducts.forEach((product) => {
      const categoryId = product.categoryId || 'uncategorized';
      if (!groups[categoryId]) groups[categoryId] = [];
      groups[categoryId].push(product);
    });

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [filteredProducts]);

  const sortedCategoryIds = useMemo(() => {
    return Object.keys(groupedProducts).sort((a, b) => {
      if (a === 'uncategorized') return 1;
      if (b === 'uncategorized') return -1;
      const catA = categories.find((c) => c.id === a);
      const catB = categories.find((c) => c.id === b);
      return (catA?.order ?? 999) - (catB?.order ?? 999);
    });
  }, [groupedProducts, categories]);

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingProduct(id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingProduct(id);
  };

  const confirmDelete = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct);
      setDeletingProduct(null);
    }
  };

  const editingProd = editingProduct ? products.find((p) => p.id === editingProduct) : null;

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) return 'out';
    if (product.lowStockThreshold > 0 && product.quantity <= product.lowStockThreshold) return 'low';
    return 'ok';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('product.search')}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)]'
            }`}
          >
            {t('filter.all')}
          </button>
          <button
            onClick={() => setFilter('low-stock')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              filter === 'low-stock'
                ? 'bg-yellow-500 text-white'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {t('filter.lowStock')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-secondary)]">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{filter === 'low-stock' ? t('product.noProductsLowStock') : t('product.noProducts')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCategoryIds.map((categoryId) => {
              const categoryProducts = groupedProducts[categoryId];
              const isCollapsed = collapsedCategories.has(categoryId);
              const categoryColor = getCategoryColor(categoryId);
              const categoryIcon = getCategoryIcon(categoryId);
              
              return (
                <div key={categoryId}>
                  <button
                    onClick={() => toggleCategory(categoryId)}
                    className="flex items-center gap-2 w-full py-2 text-left"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                    <FontAwesomeIcon
                      icon={iconMap[categoryIcon] || faFolder}
                      className="w-4 h-4"
                      style={{ color: categoryColor }}
                    />
                    <span className="font-medium">{getCategoryName(categoryId)}</span>
                    <span className="text-[var(--color-text-secondary)]">
                      ({categoryProducts.length})
                    </span>
                  </button>
                  {!isCollapsed && (
                    <div className="space-y-2 ml-2">
                      {categoryProducts.map((product) => (
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
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={handleAdd}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--color-primary)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--color-primary-hover)] transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProd ? t('product.edit') : t('product.add')}
      >
        <ProductModal
          product={editingProd ?? undefined}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={confirmDelete}
        title={t('product.delete')}
        message={t('product.confirmDelete')}
      />
    </div>
  );
}
