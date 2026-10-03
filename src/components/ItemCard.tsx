import React from 'react';
import { Plus, Minus, Edit2, Trash2, ArrowRightLeft } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { formatRupiah, getStockStatus } from '../utils/storage';

interface ItemCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem) => void;
  onQuickAdjust: (item: InventoryItem, delta: number) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onAdjustStock,
  onQuickAdjust,
}) => {
  const status = getStockStatus(item.quantity, item.minStock);
  const totalValue = item.quantity * item.costPrice;

  const statusConfig = {
    safe: {
      label: 'Stok Aman',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      dotClass: 'bg-emerald-500'
    },
    low: {
      label: 'Stok Menipis',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
      dotClass: 'bg-amber-500'
    },
    out: {
      label: 'Stok Habis',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
      dotClass: 'bg-rose-500'
    }
  }[status];

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-shadow p-4 flex flex-col justify-between shadow-xs">
      <div>
        {/* Top: SKU, Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <span className="font-mono font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
              {item.sku}
            </span>
            <span>·</span>
            <span className="truncate">{item.category}</span>
          </div>

          {/* Status Badge with dot */}
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${statusConfig.badgeClass} shrink-0`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
            <span>{statusConfig.label}</span>
          </div>
        </div>

        {/* Item Title */}
        <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2 mb-2">
          {item.name}
        </h3>

        {/* Notes if available */}
        {item.notes && (
          <p className="text-xs text-slate-500 line-clamp-1 italic mb-3">
            "{item.notes}"
          </p>
        )}

        {/* Stock & Touch Quick Adjuster for Mobile */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 my-2 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Jumlah Tersedia</div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-2xl font-bold tabular-nums ${
                status === 'out' ? 'text-rose-600' : status === 'low' ? 'text-amber-600' : 'text-slate-900'
              }`}>
                {item.quantity.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {item.unit}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Min. batas: {item.minStock} {item.unit}
            </div>
          </div>

          {/* Large touch targets for (+) and (-) on Android */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onQuickAdjust(item, -1)}
              disabled={item.quantity <= 0}
              className="w-11 h-11 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center font-bold text-lg active:scale-95 transition-all shadow-2xs"
              title="Kurangi stok 1 unit"
              aria-label="Kurangi stok"
            >
              <Minus className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={() => onQuickAdjust(item, 1)}
              className="w-11 h-11 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center font-bold text-lg active:scale-95 transition-all shadow-xs"
              title="Tambah stok 1 unit"
              aria-label="Tambah stok"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Price Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs py-1 text-slate-600">
          <div>
            <span className="text-[11px] text-slate-400 block">Harga Modal</span>
            <span className="font-medium tabular-nums text-slate-800">{formatRupiah(item.costPrice)}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Harga Jual</span>
            <span className="font-medium tabular-nums text-slate-800">{formatRupiah(item.sellingPrice)}</span>
          </div>
          <div className="col-span-2 pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Nilai Modal:</span>
            <span className="font-semibold text-emerald-700 tabular-nums">{formatRupiah(totalValue)}</span>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-1">
        {/* Detail mutation modal button */}
        <button
          onClick={() => onAdjustStock(item)}
          aria-label={`Mutasi stok untuk ${item.name}`}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[40px] flex-1 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          title="Catat stok masuk, keluar, atau opname fisik"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
          <span>Mutasi Stok</span>
        </button>

        {/* Edit Button */}
        <button
          onClick={() => onEdit(item)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          title="Edit data barang"
          aria-label="Edit barang"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(item)}
          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          title="Hapus barang dari persediaan"
          aria-label="Hapus barang"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
