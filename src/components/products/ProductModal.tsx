import { useState, useEffect } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types';

interface ProductModalProps {
  product?: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { t, language } = useI18n();
  const { categories, units, addProduct, updateProduct, getUnitName } = useStore();
  const [name, setName] = useState(product?.name ?? '');
  const [subname, setSubname] = useState(product?.subname ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [unitId, setUnitId] = useState(product?.unitId ?? '');
  const [quantity, setQuantity] = useState<string>(String(product?.quantity ?? 1));
  const [threshold, setThreshold] = useState<string>(String(product?.lowStockThreshold ?? 0));
  const [errors, setErrors] = useState<{ name?: string; quantity?: string; threshold?: string }>({});

  const getCategoryDefaultUnit = (catId: string) => {
    const category = categories.find((c) => c.id === catId);
    return category?.defaultUnitId || '';
  };

  useEffect(() => {
    if (!product) {
      const firstCat = categories[0]?.id ?? '';
      setCategoryId(firstCat);
      const defaultUnit = getCategoryDefaultUnit(firstCat) || units[0]?.id || '';
      setUnitId(defaultUnit);
    }
  }, [product, categories, units]);

  useEffect(() => {
    if (product) return;
    const defaultUnit = getCategoryDefaultUnit(categoryId);
    if (defaultUnit) {
      setUnitId(defaultUnit);
    }
  }, [categoryId]);

  const validate = () => {
    const newErrors: { name?: string; quantity?: string; threshold?: string } = {};
    if (!name.trim()) newErrors.name = t('errors.required');
    if (quantity === '' || isNaN(Number(quantity)) || Number(quantity) < 0) {
      newErrors.quantity = t('errors.minZero');
    }
    if (threshold !== '' && (isNaN(Number(threshold)) || Number(threshold) < 0)) {
      newErrors.threshold = t('errors.minZero');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const productData = {
      name: name.trim(),
      subname: subname.trim() || undefined,
      categoryId,
      unitId,
      quantity: Number(quantity),
      lowStockThreshold: threshold === '' ? 0 : Number(threshold),
      important: product?.important ?? false,
      opened: product?.opened ?? false,
    };

    if (product) {
      updateProduct(product.id, productData);
    } else {
      addProduct(productData);
    }
    onClose();
  };

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
  const sortedUnits = [...units].sort((a, b) => getUnitName(a.id, language).localeCompare(getUnitName(b.id, language)));

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{t('product.name')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
          placeholder={t('product.name')}
          autoFocus
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('product.subname')}</label>
        <input
          type="text"
          value={subname}
          onChange={(e) => setSubname(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
          placeholder={t('product.subnamePlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('product.category')}</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
        >
          {sortedCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">{t('product.unit')}</label>
        <select
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
        >
          {sortedUnits.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {getUnitName(unit.id, language)} ({unit.abbreviation})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">{t('product.quantity')}</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setErrors((prev) => ({ ...prev, quantity: undefined }));
            }}
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
          />
          {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{t('product.threshold')}</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => {
              setThreshold(e.target.value);
              setErrors((prev) => ({ ...prev, threshold: undefined }));
            }}
            min="0"
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
          />
          {errors.threshold && <p className="text-red-500 text-sm mt-1">{errors.threshold}</p>}
        </div>
      </div>

      {product && (
        <div className="text-sm text-[var(--color-text-secondary)]">
          {t('product.lastModified')}: {formatDate(product.updatedAt)}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] font-medium hover:bg-[var(--color-border)] transition-colors"
        >
          {t('actions.cancel')}
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          {t('actions.save')}
        </button>
      </div>
    </form>
  );
}
