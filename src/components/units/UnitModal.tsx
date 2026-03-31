import { useState } from 'react';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';
import type { Unit } from '@/types';

interface UnitModalProps {
  unit?: Unit;
  onClose: () => void;
}

export function UnitModal({ unit, onClose }: UnitModalProps) {
  const { t } = useI18n();
  const { addUnit, updateUnit } = useStore();
  const [nameEn, setNameEn] = useState(unit?.nameEn ?? '');
  const [nameHu, setNameHu] = useState(unit?.nameHu ?? '');
  const [abbreviation, setAbbreviation] = useState(unit?.abbreviation ?? '');
  const [errors, setErrors] = useState<{ nameEn?: string; nameHu?: string; abbr?: string }>({});

  const validate = () => {
    const newErrors: { nameEn?: string; nameHu?: string; abbr?: string } = {};
    if (!nameEn.trim()) newErrors.nameEn = t('errors.required');
    if (!nameHu.trim()) newErrors.nameHu = t('errors.required');
    if (!abbreviation.trim()) newErrors.abbr = t('errors.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (unit) {
      updateUnit(unit.id, { nameEn: nameEn.trim(), nameHu: nameHu.trim(), abbreviation: abbreviation.trim() });
    } else {
      addUnit({ nameEn: nameEn.trim(), nameHu: nameHu.trim(), abbreviation: abbreviation.trim() });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{t('unit.nameEn')}</label>
        <input
          type="text"
          value={nameEn}
          onChange={(e) => {
            setNameEn(e.target.value);
            setErrors((prev) => ({ ...prev, nameEn: undefined }));
          }}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
          placeholder="kilogram"
        />
        {errors.nameEn && <p className="text-red-500 text-sm mt-1">{errors.nameEn}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">{t('unit.nameHu')}</label>
        <input
          type="text"
          value={nameHu}
          onChange={(e) => {
            setNameHu(e.target.value);
            setErrors((prev) => ({ ...prev, nameHu: undefined }));
          }}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
          placeholder="kilogramm"
        />
        {errors.nameHu && <p className="text-red-500 text-sm mt-1">{errors.nameHu}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">{t('unit.abbreviation')}</label>
        <input
          type="text"
          value={abbreviation}
          onChange={(e) => {
            setAbbreviation(e.target.value);
            setErrors((prev) => ({ ...prev, abbr: undefined }));
          }}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-surface)]"
          placeholder="kg"
        />
        {errors.abbr && <p className="text-red-500 text-sm mt-1">{errors.abbr}</p>}
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
