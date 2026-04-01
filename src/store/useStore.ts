import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreState, Product, Category, Unit, ActivityLog } from '../types';
import { defaultCategories, defaultUnits } from '../data/defaults';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      categories: defaultCategories,
      units: defaultUnits,
      activityLogs: [],
      language: 'en',
      theme: 'system',
      logLimit: 100,
      storedVersion: '',
      collapsedSections: [],

      addProduct: (product) => {
        const now = Date.now();
        const newProduct: Product = {
          ...product,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        const unit = get().units.find((u) => u.id === product.unitId);
        set((state) => ({ products: [...state.products, newProduct] }));
        get().addActivityLog({
          productId: newProduct.id,
          productName: newProduct.name,
          action: 'created',
          quantityChange: product.quantity,
          unitName: unit ? get().getUnitName(unit.id, get().language) : '',
          unitAbbreviation: unit?.abbreviation || '',
        });
      },

      updateProduct: (id, updates) => {
        const state = get();
        const product = state.products.find((p) => p.id === id);
        const unit = state.units.find((u) => u.id === (updates.unitId || product?.unitId));
        
        if (product && updates.quantity !== undefined && updates.quantity !== product.quantity) {
          const diff = updates.quantity - product.quantity;
          get().addActivityLog({
            productId: id,
            productName: product.name,
            action: diff > 0 ? 'quantity_added' : 'quantity_removed',
            quantityChange: Math.abs(diff),
            unitName: unit ? get().getUnitName(unit.id, state.language) : '',
            unitAbbreviation: unit?.abbreviation || '',
          });
        }
        
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
        }));
      },

      toggleProductImportant: (id) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, important: !p.important, updatedAt: Date.now() } : p
          ),
        }));
      },

      toggleProductOpened: (id) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, opened: !p.opened, updatedAt: Date.now() } : p
          ),
        }));
      },

      deleteProduct: (id) => {
        const product = get().products.find((p) => p.id === id);
        const unit = get().units.find((u) => u.id === product?.unitId);
        if (product) {
          get().addActivityLog({
            productId: id,
            productName: product.name,
            action: 'deleted',
            unitName: unit ? get().getUnitName(unit.id, get().language) : '',
            unitAbbreviation: unit?.abbreviation || '',
          });
        }
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      addCategory: (category) => {
        const maxOrder = Math.max(...get().categories.map((c) => c.order), -1);
        const newCategory: Category = {
          ...category,
          id: generateId(),
          order: maxOrder + 1,
        };
        set((state) => ({ categories: [...state.categories, newCategory] }));
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        const uncategorizedId = 'uncategorized';
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          products: state.products.map((p) =>
            p.categoryId === id ? { ...p, categoryId: uncategorizedId } : p
          ),
        }));
      },

      reorderCategories: (activeId, overId) => {
        set((state) => {
          const oldCategories = [...state.categories];
          const oldIndex = oldCategories.findIndex((c) => c.id === activeId);
          const newIndex = oldCategories.findIndex((c) => c.id === overId);

          if (oldIndex === -1 || newIndex === -1) return state;

          const [removed] = oldCategories.splice(oldIndex, 1);
          oldCategories.splice(newIndex, 0, removed);

          const reordered = oldCategories.map((c, index) => ({ ...c, order: index }));
          return { categories: reordered };
        });
      },

      addUnit: (unit) => {
        const newUnit: Unit = {
          ...unit,
          id: generateId(),
        };
        set((state) => ({ units: [...state.units, newUnit] }));
      },

      updateUnit: (id, updates) => {
        set((state) => ({
          units: state.units.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          ),
        }));
      },

      deleteUnit: (id) => {
        const state = get();
        if (state.products.some((p) => p.unitId === id)) {
          return false;
        }
        set((state) => ({
          units: state.units.filter((u) => u.id !== id),
        }));
        return true;
      },

      getUnitName: (unitId, language) => {
        const unit = get().units.find((u) => u.id === unitId);
        if (!unit) return '';
        if ('nameHu' in unit && 'nameEn' in unit) {
          return language === 'hu' ? unit.nameHu : unit.nameEn;
        }
        return (unit as Unit & { name?: string }).name || '';
      },

      canDeleteUnit: (unitId) => {
        return !get().products.some((p) => p.unitId === unitId);
      },

      canDeleteCategory: (categoryId) => {
        return !get().products.some((p) => p.categoryId === categoryId);
      },

      getCategoryName: (categoryId) => {
        if (categoryId === 'uncategorized') return 'Uncategorized';
        const category = get().categories.find((c) => c.id === categoryId);
        return category?.name || 'Uncategorized';
      },

      getCategoryColor: (categoryId) => {
        const category = get().categories.find((c) => c.id === categoryId);
        return category?.color || '#6b7280';
      },

      getCategoryIcon: (categoryId) => {
        const category = get().categories.find((c) => c.id === categoryId);
        return category?.icon || 'folder';
      },

      setLanguage: (language) => set({ language }),

      setTheme: (theme) => set({ theme }),

      setLogLimit: (limit) => {
        set({ logLimit: limit });
        const state = get();
        if (state.activityLogs.length > limit) {
          const trimmed = state.activityLogs.slice(0, limit);
          set({ activityLogs: trimmed });
        }
      },

      setStoredVersion: (version) => set({ storedVersion: version }),

      toggleCollapsedSection: (sectionId) => {
        set((state) => {
          const isCollapsed = state.collapsedSections.includes(sectionId);
          return {
            collapsedSections: isCollapsed
              ? state.collapsedSections.filter((id) => id !== sectionId)
              : [...state.collapsedSections, sectionId],
          };
        });
      },

      addActivityLog: (log) => {
        const newLog: ActivityLog = {
          ...log,
          id: generateId(),
          timestamp: Date.now(),
        };
        set((state) => {
          const updated = [newLog, ...state.activityLogs];
          if (updated.length > state.logLimit) {
            return { activityLogs: updated.slice(0, state.logLimit) };
          }
          return { activityLogs: updated };
        });
      },

      exportData: () => {
        const state = get();
        const exportObj = {
          version: 1,
          exportedAt: Date.now(),
          products: state.products,
          categories: state.categories,
          units: state.units,
          activityLogs: state.activityLogs,
        };
        return JSON.stringify(exportObj, null, 2);
      },

      importData: (jsonString) => {
        try {
          const data = JSON.parse(jsonString);
          if (!data.products || !data.categories || !data.units) {
            return false;
          }
          const migratedUnits: Unit[] = (data.units as Array<Record<string, unknown>>).map((u) => {
            if ('nameHu' in u && 'nameEn' in u) {
              return {
                id: u.id as string,
                nameEn: u.nameEn as string,
                nameHu: u.nameHu as string,
                abbreviation: u.abbreviation as string,
              };
            }
            return {
              id: u.id as string,
              nameEn: (u.name as string) || '',
              nameHu: (u.name as string) || '',
              abbreviation: (u.abbreviation as string) || '',
            };
          });
          const migratedCategories: Category[] = (data.categories as Array<Record<string, unknown>>).map((c, index) => ({
            id: c.id as string,
            name: c.name as string,
            color: (c.color as string) || '#6b7280',
            icon: (c.icon as string) || 'folder',
            order: (c.order as number) ?? index,
          }));
          set({
            products: data.products,
            categories: migratedCategories,
            units: migratedUnits,
            activityLogs: data.activityLogs || [],
          });
          return true;
        } catch {
          return false;
        }
      },

      clearAllData: () => {
        set({
          products: [],
          categories: defaultCategories,
          units: defaultUnits,
          activityLogs: [],
          storedVersion: '',
        });
      },
    }),
    {
      name: 'inventorry-storage',
      partialize: (state) => ({
        products: state.products,
        categories: state.categories,
        units: state.units,
        activityLogs: state.activityLogs,
        language: state.language,
        theme: state.theme,
        logLimit: state.logLimit,
        storedVersion: state.storedVersion,
        collapsedSections: state.collapsedSections,
      }),
    }
  )
);
