import { useState } from 'react';
import { Plus, Edit2, Trash2, Scale } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import { Modal } from '@/components/layout/Modal';
import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import { UnitModal } from './UnitModal';

export function UnitList() {
  const { t, language } = useI18n();
  const { units, deleteUnit, canDeleteUnit, getUnitName } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingUnit(id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingUnit(id);
  };

  const confirmDelete = () => {
    if (deletingUnit) {
      deleteUnit(deletingUnit);
      setDeletingUnit(null);
    }
  };

  const editingU = editingUnit ? units.find((u) => u.id === editingUnit) : null;
  const sortedUnits = [...units].sort((a, b) => getUnitName(a.id, language).localeCompare(getUnitName(b.id, language)));

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={handleAdd}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
      >
        <Plus className="w-5 h-5" />
        {t('unit.add')}
      </button>

      {sortedUnits.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('unit.noUnits')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedUnits.map((unit) => {
            const canDelete = canDeleteUnit(unit.id);
            const unitName = getUnitName(unit.id, language);
            return (
              <div
                key={unit.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]"
              >
                <div className="flex-1">
                  <span className="font-medium">{unitName}</span>
                  <span className="ml-2 text-[var(--color-text-secondary)]">
                    ({unit.abbreviation})
                  </span>
                </div>
                <button
                  onClick={() => handleEdit(unit.id)}
                  className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(unit.id)}
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
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingU ? t('unit.edit') : t('unit.add')}
      >
        <UnitModal
          unit={editingU ?? undefined}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingUnit}
        onClose={() => setDeletingUnit(null)}
        onConfirm={confirmDelete}
        title={t('unit.delete')}
        message={t('unit.confirmDelete')}
      />
    </div>
  );
}
