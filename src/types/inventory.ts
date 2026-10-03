export type StockStatus = 'safe' | 'low' | 'out';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  costPrice: number;    // Harga modal / beli per unit
  sellingPrice: number; // Harga jual per unit
  updatedAt: string;    // ISO timestamp
  notes?: string;
}

export type MutationType = 'in' | 'out' | 'adjustment';

export interface StockMutation {
  id: string;
  itemId: string;
  itemName: string;
  type: MutationType;
  amount: number;
  previousQuantity: number;
  newQuantity: number;
  note: string;
  timestamp: string;
}

export type SortOption =
  | 'name_asc'
  | 'stock_desc'
  | 'stock_asc'
  | 'value_desc'
  | 'updated_desc';
