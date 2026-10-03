import React from 'react';
import { Plus, Minus, Edit2, Trash2, ArrowRightLeft } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { formatRupiah, getStockStatus } from '../utils/storage';

interface ItemTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem) => void;
  onQuickAdjust: (item: InventoryItem, delta: number) => void;
}

export const ItemTable: React.FC<ItemTableProps> = ({
  items,
  onEdit,
  onDelete,
  onAdjustStock,
  onQuickAdjust,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Barang & SKU</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Jumlah Stok</th>
              <th className="py-3 px-4 text-right">Harga Modal</th>
              <th className="py-3 px-4 text-right">Harga Jual</th>
              <th className="py-3 px-4 text-right">Total Nilai</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const status = getStockStatus(item.quantity, item.minStock);
              const totalValue = item.quantity * item.costPrice;

              const statusBadge = {
                safe: {
                  label: 'Aman',
                  classes: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
                  dot: 'bg-emerald-500'
                },
                low: {
                  label: 'Menipis',
                  classes: 'bg-amber-50 text-amber-800 border-amber-200/80',
                  dot: 'bg-amber-500'
                },
                out: {
                  label: 'Habis',
                  classes: 'bg-rose-50 text-rose-800 border-rose-200/80',
                  dot: 'bg-rose-500'
                }
              }[status];

              return (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Barang & SKU */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-[11px] text-slate-700">
                        {item.sku}
                      </span>
                      {item.notes && <span className="italic truncate max-w-xs">{item.notes}</span>}
                    </div>
                  </td>

                  {/* Kategori */}
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    {item.category}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge.classes}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                      <span>{statusBadge.label}</span>
                    </span>
                  </td>

                  {/* Quick Adjust & Quantity */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onQuickAdjust(item, -1)}
                        disabled={item.quantity <= 0}
                        className="w-7 h-7 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-xs font-bold active:scale-95 transition-all"
                        title="Kurang 1"
                        aria-label="Kurangi stok 1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <div className="min-w-[60px] text-center">
                        <span className={`font-bold tabular-nums text-base ${
                          status === 'out' ? 'text-rose-600' : status === 'low' ? 'text-amber-600' : 'text-slate-900'
                        }`}>
                          {item.quantity.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">{item.unit}</span>
                      </div>

                      <button
                        onClick={() => onQuickAdjust(item, 1)}
                        className="w-7 h-7 rounded bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center text-xs font-bold active:scale-95 transition-all shadow-xs"
                        title="Tambah 1"
                        aria-label="Tambah stok 1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-center text-[10px] text-slate-400 mt-0.5">
                      Min: {item.minStock} {item.unit}
                    </div>
                  </td>

                  {/* Harga Modal */}
                  <td className="py-3.5 px-4 text-right font-medium tabular-nums text-slate-700 text-xs">
                    {formatRupiah(item.costPrice)}
                  </td>

                  {/* Harga Jual */}
                  <td className="py-3.5 px-4 text-right font-medium tabular-nums text-slate-700 text-xs">
                    {formatRupiah(item.sellingPrice)}
                  </td>

                  {/* Total Nilai Modal */}
                  <td className="py-3.5 px-4 text-right font-bold tabular-nums text-emerald-800 text-xs">
                    {formatRupiah(totalValue)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onAdjustStock(item)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                        title="Mutasi Stok (Catat Masuk / Keluar / Opname)"
                        aria-label={`Mutasi stok ${item.name}`}
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                        title="Edit data barang"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
                        title="Hapus barang"
                        aria-label={`Hapus ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
