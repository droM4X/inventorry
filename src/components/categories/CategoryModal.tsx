import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faGlassWater, faHouse, faUser, faUtensils, faAppleWhole, faBottleWater, faMugHot, faWineGlass, faPills, faWrench, faShirt, faGamepad, faPaw, faCar, faGift, faBox, faBagShopping, faCookie, faDrumstickBite, faCarrot, faPepperHot, faBroom, faSnowflake, faFolder } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import { categoryColors, categoryIcons } from '@/data/defaults';
import type { Category } from '@/types';

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

interface CategoryModalProps {
  category?: Category;
  onClose: () => void;
  existingColors: string[];
}

export function CategoryModal({ category, onClose, existingColors }: CategoryModalProps) {
  const { t } = useI18n();
  const { addCategory, updateCategory } = useStore();
  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState(category?.color ?? categoryColors[0]);
  const [icon, setIcon] = useState(category?.icon ?? categoryIcons[0].id);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!category && existingColors) {
      const availableColor = categoryColors.find((c) => !existingColors.includes(c));
      if (availableColor) setColor(availableColor);
    }
  }, [category, existingColors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('errors.required'));
      return;
    }
    if (category) {
      updateCategory(category.id, { name: name.trim(), color, icon });
    } else {
      addCategory({ name: name.trim(), color, icon });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{t('category.name')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
          placeholder={t('category.name')}
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">{t('category.color')}</label>
        <div className="flex flex-wrap gap-2">
          {categoryColors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-lg transition-transform ${
                color === c ? 'ring-2 ring-offset-2 ring-[var(--color-primary)] scale-110' : ''
              }`}
              style={{ backgroundColor: c }}
            >
              {color === c && <Check className="w-5 h-5 mx-auto text-white" />}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">{t('category.icon')}</label>
        <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
          {categoryIcons.map((iconItem) => (
            <button
              key={iconItem.id}
              type="button"
              onClick={() => setIcon(iconItem.id)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                icon === iconItem.id
                  ? 'ring-2 ring-offset-2 ring-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)]'
              }`}
              title={iconItem.name}
            >
              <FontAwesomeIcon icon={iconMap[iconItem.id] || faFolder} className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>
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
