import React from 'react';
import { X, ArrowDownRight, ArrowUpRight, RefreshCw, Clock } from 'lucide-react';
import { StockMutation } from '../types/inventory';
import { formatDate } from '../utils/storage';

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mutations: StockMutation[];
  onClearHistory: () => void;
}

export const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  isOpen,
  onClose,
  mutations,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-slate-200 my-auto flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Riwayat Mutasi Stok</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan pergerakan stok masuk, keluar, dan penyesuaian fisik
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Tutup riwayat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of mutations */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
          {mutations.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              Belum ada riwayat mutasi stok. Setiap perubahan stok yang Anda catat akan muncul di sini.
            </div>
          ) : (
            mutations.map((m) => {
              const isEntry = m.type === 'in';
              const isExit = m.type === 'out';

              return (
                <div key={m.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isEntry
                          ? 'bg-emerald-100 text-emerald-700'
                          : isExit
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isEntry ? (
                        <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                      ) : isExit ? (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 leading-snug">
                        {m.itemName}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {m.note || (isEntry ? 'Stok Masuk' : isExit ? 'Stok Keluar' : 'Penyesuaian Fisik')}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {formatDate(m.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-bold tabular-nums text-sm ${
                        isEntry
                          ? 'text-emerald-700'
                          : isExit
                          ? 'text-rose-700'
                          : 'text-slate-900'
                      }`}
                    >
                      {isEntry ? `+${m.amount}` : isExit ? `-${m.amount}` : `= ${m.newQuantity}`}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                      {m.previousQuantity} → {m.newQuantity}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500">
            Total {mutations.length} catatan
          </span>
          <div className="flex items-center gap-2">
            {mutations.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-3 py-1.5 text-slate-600 hover:text-rose-600 font-medium hover:underline"
              >
                Hapus Riwayat
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-semibold text-slate-800 rounded-lg min-h-[38px]"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
