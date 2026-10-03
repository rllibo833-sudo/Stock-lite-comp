import { InventoryItem, StockMutation, StockStatus } from '../types/inventory';

const STORAGE_KEY_ITEMS = 'stocklite_items_v1';
const STORAGE_KEY_MUTATIONS = 'stocklite_mutations_v1';

export const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'item-1',
    sku: 'SEM-001',
    name: 'Minyak Goreng Sawit 2L',
    category: 'Sembako',
    quantity: 18,
    minStock: 10,
    unit: 'pouch',
    costPrice: 32000,
    sellingPrice: 36000,
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    notes: 'Kemasan pouch 2 liter, merk favorit pelanggan'
  },
  {
    id: 'item-2',
    sku: 'SEM-002',
    name: 'Beras Premium Ramos 5kg',
    category: 'Sembako',
    quantity: 4,
    minStock: 8,
    unit: 'karung',
    costPrice: 68000,
    sellingPrice: 75000,
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    notes: 'Kualitas pulen, stok sisa 4 karung'
  },
  {
    id: 'item-3',
    sku: 'SEM-003',
    name: 'Gula Pasir Putih 1kg',
    category: 'Sembako',
    quantity: 25,
    minStock: 12,
    unit: 'kg',
    costPrice: 15500,
    sellingPrice: 18000,
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    notes: 'Gula tebu murni'
  },
  {
    id: 'item-4',
    sku: 'MIN-001',
    name: 'Kopi Hitam Special 165g',
    category: 'Minuman',
    quantity: 0,
    minStock: 6,
    unit: 'bungkus',
    costPrice: 12500,
    sellingPrice: 15000,
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: 'Habis sejak kemarin, segera pesan ke distributor'
  },
  {
    id: 'item-5',
    sku: 'SEM-004',
    name: 'Telur Ayam Negeri',
    category: 'Sembako',
    quantity: 5,
    minStock: 10,
    unit: 'kg',
    costPrice: 27000,
    sellingPrice: 30000,
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    notes: 'Stok menipis, cek kondisi keretakan'
  },
  {
    id: 'item-6',
    sku: 'MAU-001',
    name: 'Mi Goreng Instan 85g',
    category: 'Makanan',
    quantity: 48,
    minStock: 20,
    unit: 'bungkus',
    costPrice: 2800,
    sellingPrice: 3500,
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    notes: '1 dus isi 40 bungkus'
  },
  {
    id: 'item-7',
    sku: 'KEB-001',
    name: 'Sabun Cuci Piring Jeruk Nipis 750ml',
    category: 'Kebersihan',
    quantity: 8,
    minStock: 5,
    unit: 'pouch',
    costPrice: 13500,
    sellingPrice: 16500,
    updatedAt: new Date(Date.now() - 3600000 * 16).toISOString(),
    notes: 'Refill kemasan pouch'
  },
  {
    id: 'item-8',
    sku: 'MIN-002',
    name: 'Susu Kental Manis Putih 370g',
    category: 'Minuman',
    quantity: 0,
    minStock: 10,
    unit: 'kaleng',
    costPrice: 11000,
    sellingPrice: 13500,
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    notes: 'Kaleng 370gr'
  }
];

export function getStockStatus(quantity: number, minStock: number): StockStatus {
  if (quantity <= 0) {
    return 'out';
  }
  if (quantity <= minStock) {
    return 'low';
  }
  return 'safe';
}

export function loadItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (!raw) {
      // First time initialization with sample data
      saveItems(INITIAL_ITEMS);
      return INITIAL_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_ITEMS;
  } catch (error) {
    console.error('Gagal membaca data persediaan dari localStorage:', error);
    return INITIAL_ITEMS;
  }
}

export function saveItems(items: InventoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  } catch (error) {
    console.error('Gagal menyimpan data persediaan ke localStorage:', error);
  }
}

export function loadMutations(): StockMutation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MUTATIONS);
    if (!raw) {
      const initialLogs: StockMutation[] = [
        {
          id: 'log-1',
          itemId: 'item-1',
          itemName: 'Minyak Goreng Sawit 2L',
          type: 'in',
          amount: 10,
          previousQuantity: 8,
          newQuantity: 18,
          note: 'Penerimaan stok dari supplier',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'log-2',
          itemId: 'item-4',
          itemName: 'Kopi Hitam Special 165g',
          type: 'out',
          amount: 6,
          previousQuantity: 6,
          newQuantity: 0,
          note: 'Penjualan ke pelanggan (stok habis)',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ];
      saveMutations(initialLogs);
      return initialLogs;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Gagal membaca mutasi stok:', error);
    return [];
  }
}

export function saveMutations(mutations: StockMutation[]): void {
  try {
    // Keep max 200 recent mutations to preserve storage
    const trimmed = mutations.slice(0, 200);
    localStorage.setItem(STORAGE_KEY_MUTATIONS, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Gagal menyimpan mutasi stok:', error);
  }
}

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return '-';
  }
}

export function generateNextSku(items: InventoryItem[], categoryPrefix?: string): string {
  const prefix = (categoryPrefix ? categoryPrefix.slice(0, 3).toUpperCase() : 'BRG');
  const count = items.length + 1;
  const pad = String(count).padStart(3, '0');
  let candidate = `${prefix}-${pad}`;
  
  let i = 1;
  while (items.some(item => item.sku.toLowerCase() === candidate.toLowerCase())) {
    candidate = `${prefix}-${String(count + i).padStart(3, '0')}`;
    i++;
  }
  return candidate;
}

export function exportItemsToCSV(items: InventoryItem[]): void {
  // Build clean CSV rows with Indonesian headers
  const headers = [
    'Kode SKU',
    'Nama Barang',
    'Kategori',
    'Jumlah Stok',
    'Satuan',
    'Batas Minimum',
    'Status Stok',
    'Harga Modal (Rp)',
    'Harga Jual (Rp)',
    'Total Nilai Modal (Rp)',
    'Terakhir Diperbarui'
  ];

  const escapeCSV = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = items.map(item => {
    const status = getStockStatus(item.quantity, item.minStock);
    const statusText = status === 'out' ? 'Habis' : status === 'low' ? 'Menipis' : 'Aman';
    const totalCost = item.quantity * item.costPrice;

    return [
      escapeCSV(item.sku),
      escapeCSV(item.name),
      escapeCSV(item.category),
      escapeCSV(item.quantity),
      escapeCSV(item.unit),
      escapeCSV(item.minStock),
      escapeCSV(statusText),
      escapeCSV(item.costPrice),
      escapeCSV(item.sellingPrice),
      escapeCSV(totalCost),
      escapeCSV(new Date(item.updatedAt).toLocaleString('id-ID'))
    ].join(',');
  });

  // UTF-8 BOM (\uFEFF) ensures Excel opens Indonesian characters and numbers without encoding bugs
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const today = new Date().toISOString().split('T')[0];
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `STOCKLITE_Persediaan_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
