import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Minus, ChevronDown, ChevronRight, Package, AlertTriangle, MoreVertical, Pencil as PencilIcon, Star, StarOff, Trash2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faGlassWater, faHouse, faUser, faUtensils, faAppleWhole, faBottleWater, faMugHot, faWineGlass, faPills, faWrench, faShirt, faGamepad, faPaw, faCar, faGift, faBox, faBagShopping, faCookie, faDrumstickBite, faCarrot, faPepperHot, faBroom, faSnowflake, faFolder, faStar, faWineGlassEmpty } from '@fortawesome/free-solid-svg-icons';
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
  'star': faStar,
};

interface SwipeableRowProps {
  product: Product;
  categoryColor: string;
  categoryIcon: string;
  status: 'ok' | 'low' | 'out';
  onEdit: () => void;
  onDelete: () => void;
  onQuantityChange: (newQuantity: number) => void;
  onToggleOpened: () => void;
  onToggleImportant: () => void;
  menuOpen: string | null;
  setMenuOpen: (id: string | null) => void;
}

function SwipeableRow({ product, categoryColor, categoryIcon, status, onEdit, onDelete, onQuantityChange, onToggleOpened, onToggleImportant, menuOpen, setMenuOpen }: SwipeableRowProps) {
  const { t, language } = useI18n();
  const { getUnitName } = useStore();
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ startX: number; startY: number }>({ startX: 0, startY: 0 });
  const SWIPE_THRESHOLD = 60;

  const handleTouchStart = (e: React.TouchEvent) => {
    swipeRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - swipeRef.current.startX;
    const diffY = Math.abs(currentY - swipeRef.current.startY);

    if (diffY > 20) return;

    if (diffX > 0) {
      setOffsetX(Math.min(diffX, SWIPE_THRESHOLD + 20));
    } else {
      setOffsetX(Math.max(diffX, -(SWIPE_THRESHOLD + 20)));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const absOffset = Math.abs(offsetX);

    if (absOffset > SWIPE_THRESHOLD) {
      if (offsetX > 0) {
        onDelete();
      } else {
        onEdit();
      }
    }
    setOffsetX(0);
  };

  return (
    <div className="relative overflow-visible">
      <div
        className={`absolute inset-y-0 left-0 flex items-center justify-center bg-red-500 text-white rounded-xl ${offsetX > 0 ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: `${Math.max(0, offsetX)}px` }}
      >
        <Trash2 className="w-6 h-6" />
      </div>
      <div
        className={`absolute inset-y-0 right-0 flex items-center justify-center bg-green-500 text-white rounded-xl ${offsetX < 0 ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: `${Math.max(0, -offsetX)}px` }}
      >
        <PencilIcon className="w-6 h-6" />
      </div>
      <div
        ref={rowRef}
        className="relative bg-[var(--color-surface)] transition-transform duration-200 z-10"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`p-3 rounded-xl border transition-colors relative ${
            status === 'out'
              ? 'bg-[var(--color-out-of-stock)] border-red-300 dark:border-red-800'
              : status === 'low'
              ? 'bg-[var(--color-low-stock)] border-yellow-300 dark:border-yellow-800'
              : 'bg-[var(--color-surface)] border-[var(--color-border)]'
          } ${product.opened ? 'border-l-4 rounded-l-xl' : ''}`}
          style={product.opened ? { borderLeftColor: categoryColor } : undefined}
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
              <div className="relative">
                <button
                  id={`menu-btn-${product.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === product.id ? null : product.id);
                  }}
                  className="w-10 h-10 rounded-lg hover:bg-[var(--color-border)] flex items-center justify-center transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {menuOpen === product.id && (() => {
                  const btn = document.getElementById(`menu-btn-${product.id}`);
                  const rect = btn?.getBoundingClientRect();
                  return createPortal(
                    <div
                      id={`menu-${product.id}`}
                      className="fixed z-[9999] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg min-w-36"
                      style={{
                        top: rect ? `${rect.bottom + 4}px` : 'auto',
                        right: rect ? `${window.innerWidth - rect.right}px` : '8px',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          onToggleImportant();
                          setMenuOpen(null);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--color-border)] text-left"
                      >
                        {product.important ? <StarOff className="w-4 h-4 text-yellow-500" /> : <Star className="w-4 h-4 text-yellow-500" />}
                        <span>{product.important ? t('actions.removeImportant') : t('actions.addImportant')}</span>
                      </button>
                      <button
                        onClick={() => {
                          onToggleOpened();
                          setMenuOpen(null);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--color-border)] text-left"
                      >
                        <FontAwesomeIcon icon={faWineGlassEmpty} className="w-4 h-4 text-orange-500" />
                        <span>{product.opened ? t('actions.markClosed') : t('actions.markOpened')}</span>
                      </button>
                    </div>,
                    document.body
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductListProps {
  searchQuery?: string;
}

export function ProductList({ searchQuery = '' }: ProductListProps) {
  const { t } = useI18n();
  const { products, categories, updateProduct, deleteProduct, toggleProductOpened, toggleProductImportant, getCategoryName, getCategoryColor, getCategoryIcon, collapsedSections, toggleCollapsedSection } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = () => setMenuOpen(null);
    if (menuOpen) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [menuOpen]);

  const lastSearchRef = useRef('');

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
  }, [searchQuery, filteredProducts, filter, collapsedSections, toggleCollapsedSection]);

  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};

    filteredProducts.forEach((product) => {
      if (product.important) return;
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
    const sectionId = `${filter}-${categoryId}`;
    toggleCollapsedSection(sectionId);
  };

  const isSectionCollapsed = (sectionId: string) => collapsedSections.includes(`${filter}-${sectionId}`);

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

      {/* Important Section */}
      {(() => {
        const importantProducts = filteredProducts.filter((p) => p.important);
        if (importantProducts.length === 0) return null;

        const isCollapsed = isSectionCollapsed('important');

        return (
          <div className="mb-4 px-4">
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
              <div className="space-y-2 ml-2 overflow-visible">
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
                      onToggleOpened={() => toggleProductOpened(product.id)}
                      onToggleImportant={() => toggleProductImportant(product.id)}
                      menuOpen={menuOpen}
                      setMenuOpen={setMenuOpen}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {filteredProducts.length === 0 ? (
        <div className="flex-1 text-center py-12 text-[var(--color-text-secondary)] px-4">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{filter === 'low-stock' ? t('product.noProductsLowStock') : t('product.noProducts')}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4">
          {sortedCategoryIds.map((categoryId) => {
            const categoryProducts = groupedProducts[categoryId];
            const isCollapsed = isSectionCollapsed(categoryId);
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
                  <div className="space-y-2 ml-2 overflow-visible">
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
                        onToggleOpened={() => toggleProductOpened(product.id)}
                        onToggleImportant={() => toggleProductImportant(product.id)}
                        menuOpen={menuOpen}
                        setMenuOpen={setMenuOpen}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={handleAdd}
        className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-[var(--color-primary)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--color-primary-hover)] transition-colors z-40"
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
