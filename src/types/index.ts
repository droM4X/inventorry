export interface Product {
  id: string;
  name: string;
  subname?: string;
  categoryId: string;
  unitId: string;
  quantity: number;
  lowStockThreshold: number;
  important: boolean;
  opened: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  defaultUnitId?: string;
}

export interface Unit {
  id: string;
  nameEn: string;
  nameHu: string;
  abbreviation: string;
}

export interface ActivityLog {
  id: string;
  productId: string;
  productName: string;
  action: 'created' | 'updated' | 'deleted' | 'quantity_added' | 'quantity_removed';
  quantityChange?: number;
  unitName: string;
  unitAbbreviation: string;
  timestamp: number;
}

export interface StoreState {
  products: Product[];
  categories: Category[];
  units: Unit[];
  activityLogs: ActivityLog[];
  language: 'en' | 'hu';
  theme: 'light' | 'dark' | 'system';
  logLimit: number;
  storedVersion: string;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  toggleProductImportant: (id: string) => void;
  toggleProductOpened: (id: string) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id' | 'order'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (activeId: string, overId: string) => void;
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  updateUnit: (id: string, updates: Partial<Unit>) => void;
  deleteUnit: (id: string) => boolean;
  getUnitName: (unitId: string, language: 'en' | 'hu') => string;
  getCategoryName: (categoryId: string) => string;
  getCategoryColor: (categoryId: string) => string;
  getCategoryIcon: (categoryId: string) => string;
  canDeleteUnit: (unitId: string) => boolean;
  canDeleteCategory: (categoryId: string) => boolean;
  setLanguage: (language: 'en' | 'hu') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLogLimit: (limit: number) => void;
  setStoredVersion: (version: string) => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  exportData: () => string;
  importData: (jsonString: string) => boolean;
  clearAllData: () => void;
}

export type FilterType = 'all' | 'low-stock';
