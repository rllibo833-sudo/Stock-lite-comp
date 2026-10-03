import React from 'react';
import { AlertCircle } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onConfirm: (item: InventoryItem) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-xl border border-slate-200 my-auto p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <AlertCircle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              Hapus Barang Ini?
            </h3>
            <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 my-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">{item.name}</p>
          <div className="flex items-center gap-2 text-slate-500 mt-1">
            <span>SKU: {item.sku}</span>
            <span>·</span>
            <span>Stok tersisa: {item.quantity} {item.unit}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[44px] flex-1"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(item)}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm min-h-[44px] flex-1"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};
