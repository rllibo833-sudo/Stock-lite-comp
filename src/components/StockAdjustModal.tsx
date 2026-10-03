import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import { InventoryItem, MutationType } from '../types/inventory';
import { getStockStatus } from '../utils/storage';

interface StockAdjustModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onConfirm: (
    item: InventoryItem,
    type: MutationType,
    amount: number,
    note: string
  ) => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm,
}) => {
  const [type, setType] = useState<MutationType>('in');
  const [amount, setAmount] = useState<number | ''>(1);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const quickNotes = {
    in: ['Penerimaan barang dari supplier', 'Restock persediaan', 'Retur dari pembeli'],
    out: ['Penjualan toko', 'Barang rusak / bocor', 'Kedaluwarsa (expired)', 'Dipakai sendiri'],
    adjustment: ['Koreksi hasil stock opname', 'Penyesuaian selisih fisik']
  }[type];

  // Calculate new stock projection
  let calculatedNewStock = item.quantity;
  const numAmount = Number(amount) || 0;

  if (type === 'in') {
    calculatedNewStock = item.quantity + numAmount;
  } else if (type === 'out') {
    calculatedNewStock = Math.max(0, item.quantity - numAmount);
  } else if (type === 'adjustment') {
    calculatedNewStock = Math.max(0, numAmount);
  }

  const projectedStatus = getStockStatus(calculatedNewStock, item.minStock);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === '' || Number(amount) <= 0 && type !== 'adjustment') {
      setError('Masukkan jumlah yang valid (lebih dari 0)');
      return;
    }

    if (type === 'out' && Number(amount) > item.quantity) {
      setError(`Jumlah keluar melebihi stok yang ada (${item.quantity} ${item.unit})`);
      return;
    }

    const finalNote = note.trim() || (type === 'in' ? 'Stok Masuk' : type === 'out' ? 'Stok Keluar' : 'Penyesuaian Fisik');
    onConfirm(item, type, Number(amount), finalNote);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl border border-slate-200 my-auto">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pencatatan Mutasi Stok
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">
              {item.name} ({item.sku})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Tutup form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Mutation Type Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Jenis Perubahan Stok
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setType('in');
                  setError('');
                }}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all flex flex-col items-center gap-1 min-h-[44px] justify-center ${
                  type === 'in'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Stok Masuk</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('out');
                  setError('');
                }}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all flex flex-col items-center gap-1 min-h-[44px] justify-center ${
                  type === 'out'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Stok Keluar</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('adjustment');
                  setError('');
                }}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all flex flex-col items-center gap-1 min-h-[44px] justify-center ${
                  type === 'adjustment'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Opname Fisik</span>
                </div>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {type === 'adjustment' ? 'Jumlah Stok Fisik Sebenarnya' : 'Jumlah Perubahan Unit'} ({item.unit}) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={type === 'adjustment' ? 0 : 1}
                value={amount}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0);
                  setAmount(val);
                  setError('');
                }}
                autoFocus
                className="w-full px-3 py-2.5 text-xl font-bold tabular-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[48px]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                {item.unit}
              </span>
            </div>
            {error && <p className="text-rose-600 text-xs mt-1 font-medium">{error}</p>}
          </div>

          {/* Real-time Calculation Preview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span>Stok Saat Ini:</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {item.quantity} {item.unit}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Perubahan:</span>
              <span className={`font-semibold tabular-nums ${
                type === 'in' ? 'text-emerald-700' : type === 'out' ? 'text-rose-700' : 'text-slate-800'
              }`}>
                {type === 'in' ? `+${numAmount}` : type === 'out' ? `-${numAmount}` : `= ${numAmount}`} {item.unit}
              </span>
            </div>
            <div className="pt-1 border-t border-slate-200 flex items-center justify-between font-bold">
              <span className="text-slate-800">Perkiraan Stok Baru:</span>
              <span className={`text-sm tabular-nums ${
                projectedStatus === 'out' ? 'text-rose-600' : projectedStatus === 'low' ? 'text-amber-600' : 'text-emerald-700'
              }`}>
                {calculatedNewStock} {item.unit}
              </span>
            </div>
          </div>

          {/* Keterangan / Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alasan / Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Pembelian supplier Toko ABC"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
            {/* Quick chips for quick notes */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickNotes.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setNote(preset)}
                  className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-xs font-semibold text-white rounded-lg shadow-sm min-h-[44px] ${
                type === 'in'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : type === 'out'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              Simpan Mutasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
