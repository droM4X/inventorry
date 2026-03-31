import { useState, useMemo } from 'react';
import { History, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faGlassWater, faHouse, faUser, faUtensils, faAppleWhole, faBottleWater, faMugHot, faWineGlass, faPills, faWrench, faShirt, faGamepad, faPaw, faCar, faGift, faBox, faBagShopping, faCookie, faDrumstickBite, faCarrot, faPepperHot, faBroom, faSnowflake, faFolder } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/hooks/useI18n';
import { useStore } from '@/store/useStore';

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

export function Logs() {
  const { t, language } = useI18n();
  const { activityLogs, getCategoryColor, getCategoryIcon, products } = useStore();
  const [currentPage, setCurrentPage] = useState(1);

  const logsPerPage = 15;
  const totalPages = Math.ceil(activityLogs.length / logsPerPage);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * logsPerPage;
    return activityLogs.slice(start, start + logsPerPage);
  }, [activityLogs, currentPage, logsPerPage]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (language === 'hu') {
      return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`;
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getActionText = (action: string, quantityChange?: number) => {
    switch (action) {
      case 'created':
        return t('logs.actionCreated');
      case 'updated':
        return t('logs.actionUpdated');
      case 'deleted':
        return t('logs.actionDeleted');
      case 'quantity_added':
        return t('logs.actionAdded', { count: quantityChange ?? 0 });
      case 'quantity_removed':
        return t('logs.actionRemoved', { count: quantityChange ?? 0 });
      default:
        return action;
    }
  };

  const getRowStyle = (action: string) => {
    switch (action) {
      case 'quantity_added':
        return 'bg-[var(--color-log-increased)] border-green-400 dark:border-green-600';
      case 'quantity_removed':
        return 'bg-[var(--color-log-decreased)] border-red-400 dark:border-red-600';
      default:
        return 'bg-[var(--color-surface)] border-[var(--color-border)]';
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <History className="w-5 h-5" />
        {t('logs.title')}
      </h2>

      {activityLogs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-[var(--color-text-secondary)]">
          <div>
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('logs.noLogs')}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-2">
            {paginatedLogs.map((log) => {
              const product = products.find((p) => p.id === log.productId);
              const categoryId = product?.categoryId || 'uncategorized';
              const categoryColor = getCategoryColor(categoryId);
              const categoryIcon = getCategoryIcon(categoryId);
              
              return (
                <div
                  key={log.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border ${getRowStyle(log.action)}`}
                >
                  <FontAwesomeIcon
                    icon={iconMap[categoryIcon] || faFolder}
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: categoryColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{log.productName}</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">
                      {getActionText(log.action, log.quantityChange)} {log.unitAbbreviation && `(${log.quantityChange} ${log.unitAbbreviation})`}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium">{formatDate(log.timestamp)}</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">{formatTime(log.timestamp)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4 mt-4 border-t border-[var(--color-border)]">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-border)] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-border)] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
