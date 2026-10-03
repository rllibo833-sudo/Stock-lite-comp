import React, { useState } from 'react';
import { Package, Download, History, RotateCcw, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { exportItemsToCSV } from '../utils/storage';

interface HeaderProps {
  items: InventoryItem[];
  onOpenAddModal: () => void;
  onOpenHistoryModal: () => void;
  onResetData: () => void;
  onClearAllData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  items,
  onOpenAddModal,
  onOpenHistoryModal,
  onResetData,
  onClearAllData
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const handleExport = () => {
    exportItemsToCSV(items);
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Package className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  STOCKLITE
                </span>
                <span className="hidden sm:inline-block text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 rounded px-1.5 py-0.5">
                  UMKM
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none hidden sm:block">
                Pencatatan Persediaan Usaha Kecil
              </p>
            </div>
          </div>

          {/* Zone 2: Fast Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Export CSV button */}
            <button
              onClick={handleExport}
              title="Unduh seluruh data persediaan dalam format CSV untuk Excel"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              {showExportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-700 font-medium">Terekspor!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Export CSV</span>
                </>
              )}
            </button>

            {/* Riwayat Mutasi */}
            <button
              onClick={onOpenHistoryModal}
              title="Lihat riwayat pergerakan stok barang"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <History className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">Riwayat Stok</span>
            </button>

            {/* Menu Options (Reset / Clear) */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Pengaturan data"
                title="Opsi data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onResetData();
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      Reset ke Data Contoh
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onClearAllData();
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      Kosongkan Semua Data
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Zone 3: Primary CTA Tambah Barang */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="font-semibold">Tambah Barang</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
