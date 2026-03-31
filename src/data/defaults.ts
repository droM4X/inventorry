import type { Category, Unit } from '../types';

export const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Groceries', color: '#ef4444', icon: 'cart-shopping', order: 0, defaultUnitId: 'unit-1' },
  { id: 'cat-2', name: 'Beverages', color: '#f97316', icon: 'glass-water', order: 1, defaultUnitId: 'unit-4' },
  { id: 'cat-3', name: 'Household', color: '#f59e0b', icon: 'house', order: 2, defaultUnitId: 'unit-7' },
  { id: 'cat-4', name: 'Personal Care', color: '#84cc16', icon: 'user', order: 3, defaultUnitId: 'unit-1' },
  { id: 'cat-5', name: 'Spices', color: '#22c55e', icon: 'pepper-hot', order: 4, defaultUnitId: 'unit-3' },
];

export const defaultUnits: Unit[] = [
  { id: 'unit-1', nameEn: 'pieces', nameHu: 'darab', abbreviation: 'pcs' },
  { id: 'unit-2', nameEn: 'kilogram', nameHu: 'kilogramm', abbreviation: 'kg' },
  { id: 'unit-3', nameEn: 'gram', nameHu: 'gramm', abbreviation: 'g' },
  { id: 'unit-4', nameEn: 'liter', nameHu: 'liter', abbreviation: 'L' },
  { id: 'unit-5', nameEn: 'milliliter', nameHu: 'milliliter', abbreviation: 'mL' },
  { id: 'unit-6', nameEn: 'bag', nameHu: 'tasak', abbreviation: 'bag' },
  { id: 'unit-7', nameEn: 'box', nameHu: 'doboz', abbreviation: 'box' },
];

export const categoryColors = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
];

export const categoryIcons = [
  { id: 'cart-shopping', name: 'Shopping Cart' },
  { id: 'glass-water', name: 'Water' },
  { id: 'house', name: 'House' },
  { id: 'user', name: 'User' },
  { id: 'utensils', name: 'Utensils' },
  { id: 'apple-whole', name: 'Apple' },
  { id: 'bottle-water', name: 'Bottle' },
  { id: 'mug-hot', name: 'Coffee' },
  { id: 'wine-glass', name: 'Wine' },
  { id: 'pills', name: 'Medicine' },
  { id: 'wrench', name: 'Tools' },
  { id: 'shirt', name: 'Clothing' },
  { id: 'gamepad', name: 'Game' },
  { id: 'pet', name: 'Pet' },
  { id: 'car', name: 'Car' },
  { id: 'gift', name: 'Gift' },
  { id: 'box', name: 'Box' },
  { id: 'bag-shopping', name: 'Bag' },
  { id: 'cookie', name: 'Snack' },
  { id: 'drumstick-bite', name: 'Meat' },
  { id: 'carrot', name: 'Vegetable' },
  { id: 'pepper-hot', name: 'Spices' },
  { id: 'broom', name: 'Cleaning' },
  { id: 'snowflake', name: 'Freezer' },
];
