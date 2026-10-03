import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { generateNextSku } from '../utils/storage';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<InventoryItem, 'id' | 'updatedAt'>, id?: string) => void;
  editItem: InventoryItem | null;
  allItems: InventoryItem[];
  existingCategories: string[];
}

const COMMON_UNITS = [
  'pcs',
  'kg',
  'pouch',
  'dus',
  'pack',
  'botol',
  'kaleng',
  'bungkus',
  'karung',
  'butir',
  'liter',
  'renceng',
  'box'
];

const DEFAULT_CATEGORIES = [
  'Sembako',
  'Makanan',
  'Minuman',
  'Kebersihan',
  'Bumbu Dapur',
  'Alat Tulis',
  'Obat & Kesehatan',
  'Lainnya'
];

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  allItems,
  existingCategories,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Sembako');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [quantity, setQuantity] = useState<number | ''>(0);
  const [minStock, setMinStock] = useState<number | ''>(5);
  const [unit, setUnit] = useState('pcs');
  const [customUnit, setCustomUnit] = useState('');
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [costPrice, setCostPrice] = useState<number | ''>(0);
  const [sellingPrice, setSellingPrice] = useState<number | ''>(0);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Combine unique categories
  const categoriesList = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories]));

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setSku(editItem.sku);
        setName(editItem.name);
        
        if (categoriesList.includes(editItem.category)) {
          setCategory(editItem.category);
          setIsCustomCategory(false);
        } else {
          setCategory('custom');
          setCustomCategory(editItem.category);
          setIsCustomCategory(true);
        }

        if (COMMON_UNITS.includes(editItem.unit)) {
          setUnit(editItem.unit);
          setIsCustomUnit(false);
        } else {
          setUnit('custom');
          setCustomUnit(editItem.unit);
          setIsCustomUnit(true);
        }

        setQuantity(editItem.quantity);
        setMinStock(editItem.minStock);
        setCostPrice(editItem.costPrice);
        setSellingPrice(editItem.sellingPrice);
        setNotes(editItem.notes || '');
      } else {
        // Generate new SKU for fresh item
        const newSku = generateNextSku(allItems);
        setSku(newSku);
        setName('');
        setCategory('Sembako');
        setIsCustomCategory(false);
        setCustomCategory('');
        setQuantity(0);
        setMinStock(5);
        setUnit('pcs');
        setIsCustomUnit(false);
        setCustomUnit('');
        setCostPrice(0);
        setSellingPrice(0);
        setNotes('');
      }
      setErrors({});
    }
  }, [isOpen, editItem]);

  if (!isOpen) return null;

  const handleAutoSku = () => {
    const activeCategory = isCustomCategory ? customCategory : category;
    const generated = generateNextSku(allItems, activeCategory);
    setSku(generated);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    const trimmedSku = sku.trim();
    if (!trimmedSku) {
      errs.sku = 'Kode SKU wajib diisi';
    } else {
      // Check duplicate SKU if new item or changed SKU
      const isDuplicate = allItems.some(
        (it) => it.sku.toLowerCase() === trimmedSku.toLowerCase() && it.id !== editItem?.id
      );
      if (isDuplicate) {
        errs.sku = 'Kode SKU sudah digunakan oleh barang lain';
      }
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      errs.name = 'Nama barang wajib diisi';
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      errs.category = 'Kategori wajib diisi';
    }

    const finalUnit = isCustomUnit ? customUnit.trim() : unit;
    if (!finalUnit) {
      errs.unit = 'Satuan barang wajib diisi';
    }

    if (quantity === '' || isNaN(Number(quantity)) || Number(quantity) < 0) {
      errs.quantity = 'Jumlah stok harus berupa angka valid (minimal 0)';
    }

    if (minStock === '' || isNaN(Number(minStock)) || Number(minStock) < 0) {
      errs.minStock = 'Batas minimum harus berupa angka valid (minimal 0)';
    }

    if (costPrice !== '' && (isNaN(Number(costPrice)) || Number(costPrice) < 0)) {
      errs.costPrice = 'Harga modal harus berupa angka valid (minimal 0)';
    }

    if (sellingPrice !== '' && (isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0)) {
      errs.sellingPrice = 'Harga jual harus berupa angka valid (minimal 0)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    const finalUnit = isCustomUnit ? customUnit.trim() : unit;

    const parsedQty = Math.min(999999999, Math.max(0, Number(quantity) || 0));
    const parsedMin = Math.min(999999999, Math.max(0, Number(minStock) || 0));
    const parsedCost = Math.min(999999999999, Math.max(0, Number(costPrice) || 0));
    const parsedSell = Math.min(999999999999, Math.max(0, Number(sellingPrice) || 0));

    onSave(
      {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category: finalCategory,
        quantity: parsedQty,
        minStock: parsedMin,
        unit: finalUnit,
        costPrice: parsedCost,
        sellingPrice: parsedSell,
        notes: notes.trim() || undefined,
      },
      editItem?.id
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-slate-200 my-auto">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 id="item-modal-title" className="text-base font-bold text-slate-900">
              {editItem ? 'Edit Data Barang' : 'Tambah Barang Baru'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {editItem ? 'Perbarui informasi dan stok barang' : 'Isi data persediaan barang toko Anda'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Tutup form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row: SKU & Auto Button */}
          <div>
            <label htmlFor="sku-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Kode / SKU Barang <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="sku-input"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="Contoh: SEM-001"
                className={`flex-1 px-3 py-2 text-sm uppercase font-mono bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px] ${
                  errors.sku ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              <button
                type="button"
                onClick={handleAutoSku}
                className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center gap-1.5 min-h-[44px]"
                title="Buat kode SKU otomatis"
                aria-label="Buat kode SKU otomatis"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Otomatis</span>
              </button>
            </div>
            {errors.sku && <p className="text-rose-600 text-xs mt-1">{errors.sku}</p>}
          </div>

          {/* Nama Barang */}
          <div>
            <label htmlFor="name-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Barang <span className="text-rose-500">*</span>
            </label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Beras Ramos 5kg / Kopi Bubuk 100g"
              autoFocus
              className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px] ${
                errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Row: Kategori & Satuan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Kategori */}
            <div>
              <label htmlFor="category-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori <span className="text-rose-500">*</span>
              </label>
              {!isCustomCategory ? (
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomCategory(true);
                      setCustomCategory('');
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="custom">+ Kategori Lainnya...</option>
                </select>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Ketik kategori baru"
                    className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(false);
                      setCategory('Sembako');
                    }}
                    className="px-2.5 py-2 text-xs text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 min-h-[44px]"
                  >
                    Batal
                  </button>
                </div>
              )}
              {errors.category && <p className="text-rose-600 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* Satuan */}
            <div>
              <label htmlFor="unit-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Satuan <span className="text-rose-500">*</span>
              </label>
              {!isCustomUnit ? (
                <select
                  id="unit-select"
                  value={unit}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomUnit(true);
                      setCustomUnit('');
                    } else {
                      setUnit(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                  <option value="custom">+ Satuan Lain...</option>
                </select>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    placeholder="Contoh: pack"
                    className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomUnit(false);
                      setUnit('pcs');
                    }}
                    className="px-2.5 py-2 text-xs text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 min-h-[44px]"
                  >
                    Batal
                  </button>
                </div>
              )}
              {errors.unit && <p className="text-rose-600 text-xs mt-1">{errors.unit}</p>}
            </div>
          </div>

          {/* Row: Jumlah Stok & Batas Minimum */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <label htmlFor="qty-input" className="block text-xs font-semibold text-slate-800 mb-1">
                Jumlah Stok Saat Ini <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="qty-input"
                  type="number"
                  min="0"
                  max="999999999"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                  className={`w-full px-3 py-2 text-base font-bold tabular-nums bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px] ${
                    errors.quantity ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.quantity && <p className="text-rose-600 text-[11px] mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label htmlFor="min-stock-input" className="block text-xs font-semibold text-slate-800 mb-1">
                Batas Minimum Stok <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="min-stock-input"
                  type="number"
                  min="0"
                  max="999999999"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                  className={`w-full px-3 py-2 text-base font-bold tabular-nums bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px] ${
                    errors.minStock ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Peringatan jika stok ≤ batas ini</p>
              {errors.minStock && <p className="text-rose-600 text-[11px] mt-1">{errors.minStock}</p>}
            </div>
          </div>

          {/* Row: Harga Modal & Harga Jual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="cost-price-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Modal / Beli (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">Rp</span>
                <input
                  id="cost-price-input"
                  type="number"
                  min="0"
                  max="999999999999"
                  step="500"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-9 pr-3 py-2 text-sm tabular-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>
              {errors.costPrice && <p className="text-rose-600 text-xs mt-1">{errors.costPrice}</p>}
            </div>

            <div>
              <label htmlFor="selling-price-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Jual (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">Rp</span>
                <input
                  id="selling-price-input"
                  type="number"
                  min="0"
                  max="999999999999"
                  step="500"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-9 pr-3 py-2 text-sm tabular-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>
              {errors.sellingPrice && <p className="text-rose-600 text-xs mt-1">{errors.sellingPrice}</p>}
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label htmlFor="notes-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Lokasi Rak / Keterangan (Opsional)
            </label>
            <input
              id="notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Rak A-3, supplier Toko Maju Jaya"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs min-h-[44px]"
            >
              {editItem ? 'Simpan Perubahan' : 'Tambah ke Persediaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
