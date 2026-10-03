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

/**
 * Sanitizes an item object to ensure data integrity, backward compatibility,
 * and prevention of NaN / null / undefined values.
 */
export function sanitizeItem(raw: unknown, index: number = 0): InventoryItem {
  const obj = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;

  // Safe ID
  const id = typeof obj.id === 'string' && obj.id.trim()
    ? obj.id.trim()
    : `item-${Date.now()}-${index}`;

  // Safe SKU
  const sku = typeof obj.sku === 'string' && obj.sku.trim()
    ? obj.sku.trim().toUpperCase()
    : `BRG-${String(index + 1).padStart(3, '0')}`;

  // Safe Name
  const name = typeof obj.name === 'string' && obj.name.trim()
    ? obj.name.trim()
    : 'Barang Tanpa Nama';

  // Safe Category
  const category = typeof obj.category === 'string' && obj.category.trim()
    ? obj.category.trim()
    : 'Umum';

  // Safe Quantity (0 to 999,999,999)
  const rawQty = Number(obj.quantity);
  const quantity = !isNaN(rawQty) && isFinite(rawQty) && rawQty >= 0
    ? Math.min(999999999, Math.floor(rawQty))
    : 0;

  // Safe MinStock (0 to 999,999,999)
  const rawMin = Number(obj.minStock);
  const minStock = !isNaN(rawMin) && isFinite(rawMin) && rawMin >= 0
    ? Math.min(999999999, Math.floor(rawMin))
    : 0;

  // Safe Unit
  const unit = typeof obj.unit === 'string' && obj.unit.trim()
    ? obj.unit.trim()
    : 'pcs';

  // Safe CostPrice
  const rawCost = Number(obj.costPrice);
  const costPrice = !isNaN(rawCost) && isFinite(rawCost) && rawCost >= 0
    ? Math.min(999999999999, Math.round(rawCost))
    : 0;

  // Safe SellingPrice
  const rawSell = Number(obj.sellingPrice);
  const sellingPrice = !isNaN(rawSell) && isFinite(rawSell) && rawSell >= 0
    ? Math.min(999999999999, Math.round(rawSell))
    : 0;

  // Safe UpdatedAt
  let updatedAt = new Date().toISOString();
  if (typeof obj.updatedAt === 'string') {
    const parsed = new Date(obj.updatedAt);
    if (!isNaN(parsed.getTime())) {
      updatedAt = parsed.toISOString();
    }
  }

  // Safe Notes
  const notes = typeof obj.notes === 'string' && obj.notes.trim()
    ? obj.notes.trim()
    : undefined;

  return {
    id,
    sku,
    name,
    category,
    quantity,
    minStock,
    unit,
    costPrice,
    sellingPrice,
    updatedAt,
    notes,
  };
}

/**
 * Sanitizes a stock mutation record to prevent corrupted history
 */
export function sanitizeMutation(raw: unknown, index: number = 0): StockMutation {
  const obj = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;

  const id = typeof obj.id === 'string' && obj.id.trim()
    ? obj.id.trim()
    : `mut-${Date.now()}-${index}`;

  const itemId = typeof obj.itemId === 'string' ? obj.itemId : '';
  const itemName = typeof obj.itemName === 'string' && obj.itemName.trim()
    ? obj.itemName.trim()
    : 'Barang';

  const type = (obj.type === 'in' || obj.type === 'out' || obj.type === 'adjustment')
    ? obj.type
    : 'adjustment';

  const rawAmount = Number(obj.amount);
  const amount = !isNaN(rawAmount) && isFinite(rawAmount) && rawAmount >= 0
    ? Math.floor(rawAmount)
    : 0;

  const rawPrev = Number(obj.previousQuantity);
  const previousQuantity = !isNaN(rawPrev) && isFinite(rawPrev) && rawPrev >= 0
    ? Math.floor(rawPrev)
    : 0;

  const rawNew = Number(obj.newQuantity);
  const newQuantity = !isNaN(rawNew) && isFinite(rawNew) && rawNew >= 0
    ? Math.floor(rawNew)
    : 0;

  const note = typeof obj.note === 'string' ? obj.note.trim() : '';

  let timestamp = new Date().toISOString();
  if (typeof obj.timestamp === 'string') {
    const parsed = new Date(obj.timestamp);
    if (!isNaN(parsed.getTime())) {
      timestamp = parsed.toISOString();
    }
  }

  return {
    id,
    itemId,
    itemName,
    type,
    amount,
    previousQuantity,
    newQuantity,
    note,
    timestamp,
  };
}

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
      const sanitized = INITIAL_ITEMS.map((item, idx) => sanitizeItem(item, idx));
      saveItems(sanitized);
      return sanitized;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item, idx) => sanitizeItem(item, idx));
    }
    return INITIAL_ITEMS;
  } catch (error) {
    console.error('Gagal membaca data persediaan dari localStorage:', error);
    return INITIAL_ITEMS;
  }
}

export function saveItems(items: InventoryItem[]): void {
  try {
    const sanitized = items.map((it, idx) => sanitizeItem(it, idx));
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(sanitized));
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
    if (Array.isArray(parsed)) {
      return parsed.map((m, idx) => sanitizeMutation(m, idx));
    }
    return [];
  } catch (error) {
    console.error('Gagal membaca mutasi stok:', error);
    return [];
  }
}

export function saveMutations(mutations: StockMutation[]): void {
  try {
    const trimmed = mutations.slice(0, 200).map((m, idx) => sanitizeMutation(m, idx));
    localStorage.setItem(STORAGE_KEY_MUTATIONS, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Gagal menyimpan mutasi stok:', error);
  }
}

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined || !isFinite(amount)) {
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
  const prefix = (categoryPrefix ? categoryPrefix.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X') : 'BRG') || 'BRG';
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

/**
 * Export data persediaan to CSV format with Excel UTF-8 BOM
 */
export function exportItemsToCSV(items: InventoryItem[]): void {
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

/**
 * Backup entire application data to JSON file
 * Named STOCKLITE_Backup_YYYY-MM-DD.json
 */
export function createBackupFile(items: InventoryItem[], mutations: StockMutation[]): void {
  const today = new Date().toISOString().split('T')[0];
  const backupData = {
    app: 'STOCKLITE',
    version: '1.1',
    exportedAt: new Date().toISOString(),
    totalItems: items.length,
    items: items.map((it, idx) => sanitizeItem(it, idx)),
    mutations: mutations.map((m, idx) => sanitizeMutation(m, idx))
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `STOCKLITE_Backup_${today}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface RestoreResult {
  success: boolean;
  items?: InventoryItem[];
  mutations?: StockMutation[];
  itemCount?: number;
  errorMessage?: string;
}

/**
 * Validates and parses backup JSON data safely before restoring
 */
export function validateAndParseBackup(jsonString: string): RestoreResult {
  try {
    if (!jsonString || typeof jsonString !== 'string' || !jsonString.trim()) {
      return { success: false, errorMessage: 'File backup kosong atau tidak dapat dibaca.' };
    }

    const parsed = JSON.parse(jsonString);

    if (typeof parsed !== 'object' || parsed === null) {
      return { success: false, errorMessage: 'Format file tidak valid. File harus berupa JSON yang valid.' };
    }

    // Support either structured backup { items: [...], mutations: [...] } or array of items directly
    let rawItems: unknown[] = [];
    let rawMutations: unknown[] = [];

    if (Array.isArray(parsed)) {
      rawItems = parsed;
    } else if (Array.isArray(parsed.items)) {
      rawItems = parsed.items;
      if (Array.isArray(parsed.mutations)) {
        rawMutations = parsed.mutations;
      }
    } else {
      return {
        success: false,
        errorMessage: 'Struktur data backup tidak dikenali. File harus memiliki daftar barang yang valid.'
      };
    }

    if (rawItems.length === 0) {
      return {
        success: false,
        errorMessage: 'File backup tidak memuat data barang apapun.'
      };
    }

    // Validate that at least one item has a recognizable name or SKU
    const validCount = rawItems.filter(
      (it) => typeof it === 'object' && it !== null && ('name' in it || 'sku' in it)
    ).length;

    if (validCount === 0) {
      return {
        success: false,
        errorMessage: 'Data barang di dalam file backup tidak valid atau rusak.'
      };
    }

    const sanitizedItems = rawItems.map((item, idx) => sanitizeItem(item, idx));
    const sanitizedMutations = rawMutations.map((m, idx) => sanitizeMutation(m, idx));

    return {
      success: true,
      items: sanitizedItems,
      mutations: sanitizedMutations,
      itemCount: sanitizedItems.length,
    };
  } catch (err) {
    console.error('Error parsing backup JSON:', err);
    return {
      success: false,
      errorMessage: 'Gagal memproses file. Pastikan file berformat JSON backup STOCKLITE yang valid.'
    };
  }
}
