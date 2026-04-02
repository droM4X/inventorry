import { useState } from 'react';
import { Plus, Edit2, Trash2, Folder, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faGlassWater, faHouse, faUser, faUtensils, faAppleWhole, faBottleWater, faMugHot, faWineGlass, faPills, faWrench, faShirt, faGamepad, faPaw, faCar, faGift, faBox, faBagShopping, faCookie, faDrumstickBite, faCarrot, faPepperHot, faBroom, faSnowflake, faFolder } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import { Modal } from '@/components/layout/Modal';
import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import { CategoryModal } from './CategoryModal';
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

interface SortableItemProps {
  category: Category;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

function SortableItem({ category, onEdit, onDelete, canDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
    >
      <button
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-[var(--color-border)] rounded"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-[var(--color-text-secondary)]" />
      </button>
      <FontAwesomeIcon
        icon={iconMap[category.icon] || faFolder}
        className="w-4 h-4 flex-shrink-0"
        style={{ color: category.color }}
      />
      <span className="flex-1 font-medium">{category.name}</span>
      <button
        onClick={() => onEdit(category.id)}
        className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(category.id)}
        className={`p-2 rounded-lg transition-colors ${
          !canDelete
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600'
        }`}
        disabled={!canDelete}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

interface CategoryListProps {
  inSettingsPage?: boolean;
  onAdd?: () => void;
}

export function CategoryList({ inSettingsPage = false, onAdd }: CategoryListProps) {
  const { t } = useI18n();
  const { categories, deleteCategory, canDeleteCategory, reorderCategories } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderCategories(active.id as string, over.id as string);
    }
  };

  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    } else {
      setEditingCategory(null);
      setIsModalOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    setEditingCategory(id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingCategory(id);
  };

  const confirmDelete = () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory);
      setDeletingCategory(null);
    }
  };

  const editingCat = editingCategory
    ? categories.find((c) => c.id === editingCategory)
    : null;

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="p-4 space-y-4">
      {!inSettingsPage && (
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('category.add')}
        </button>
      )}

      {sortedCategories.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('category.noCategories')}</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedCategories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedCategories.map((category) => (
                <SortableItem
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  canDelete={canDeleteCategory(category.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {inSettingsPage && (
        <button
          onClick={handleAdd}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--color-primary)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--color-primary-hover)] transition-colors z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCat ? t('category.edit') : t('category.add')}
      >
        <CategoryModal
          category={editingCat ?? undefined}
          onClose={() => setIsModalOpen(false)}
          existingColors={categories.map((c) => c.color)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={confirmDelete}
        title={t('category.delete')}
        message={t('category.confirmDelete')}
      />
    </div>
  );
}
