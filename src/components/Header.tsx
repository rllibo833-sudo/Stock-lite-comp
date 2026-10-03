import React, { useState } from 'react';
import {
  Package,
  Download,
  Upload,
  History,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Database,
  Smartphone,
  MoreVertical
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { exportItemsToCSV } from '../utils/storage';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  items: InventoryItem[];
  onOpenAddModal: () => void;
  onOpenHistoryModal: () => void;
  onBackupData: () => void;
  onOpenRestoreModal: () => void;
  onResetData: () => void;
  onClearAllData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  items,
  onOpenAddModal,
  onOpenHistoryModal,
  onBackupData,
  onOpenRestoreModal,
  onResetData,
  onClearAllData
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleExport = () => {
    exportItemsToCSV(items);
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
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
            {/* PWA Install Button (shows when installable on Android / iOS and not yet installed) */}
            {!isInstalled && (isInstallable || isIOS) && (
              <button
                onClick={handleInstallClick}
                title="Pasang aplikasi STOCKLITE ke Layar Utama HP"
                aria-label="Pasang aplikasi ke HP"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline">Pasang di HP</span>
              </button>
            )}

            {/* Export CSV button */}
            <button
              onClick={handleExport}
              title="Unduh seluruh data persediaan dalam format CSV untuk Excel"
              aria-label="Export data persediaan ke CSV"
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
              aria-label="Lihat riwayat mutasi stok"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <History className="w-4 h-4 text-slate-600" />
              <span className="hidden lg:inline">Riwayat Stok</span>
            </button>

            {/* Backup & Data Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                aria-label="Menu cadangan dan pengaturan data"
                title="Cadangan & Opsi Data"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs divide-y divide-slate-100">
                    <div className="py-1">
                      {/* Backup Data */}
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onBackupData();
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium min-h-[40px]"
                      >
                        <Database className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-semibold text-slate-800">Backup Data (JSON)</div>
                          <div className="text-[10px] text-slate-400">Unduh cadangan data lengkap</div>
                        </div>
                      </button>

                      {/* Restore Data */}
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onOpenRestoreModal();
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium min-h-[40px]"
                      >
                        <Upload className="w-4 h-4 text-indigo-600" />
                        <div>
                          <div className="font-semibold text-slate-800">Restore Data</div>
                          <div className="text-[10px] text-slate-400">Pulihkan dari berkas cadangan</div>
                        </div>
                      </button>

                      {/* Install PWA Menu Option */}
                      {!isInstalled && (isInstallable || isIOS) && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            handleInstallClick();
                          }}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 flex items-center gap-2.5 text-emerald-800 font-medium min-h-[40px]"
                        >
                          <Smartphone className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div className="font-semibold text-emerald-900">Pasang di Layar HP (PWA)</div>
                            <div className="text-[10px] text-emerald-700">Gunakan seperti aplikasi Android</div>
                          </div>
                        </button>
                      )}
                    </div>

                    <div className="py-1">
                      {/* Reset ke Data Contoh */}
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onResetData();
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-600 font-medium min-h-[38px]"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reset ke Data Contoh</span>
                      </button>

                      {/* Kosongkan Semua Data */}
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onClearAllData();
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2.5 text-rose-600 font-medium min-h-[38px]"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Kosongkan Semua Data</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Zone 3: Primary CTA Tambah Barang */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Tambah barang baru"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="font-semibold">Tambah Barang</span>
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Pasang di iPhone / iPad</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              1. Buka halaman ini di Safari.<br />
              2. Tekan tombol <strong>Share</strong> (ikon kotak dengan panah atas di bawah).<br />
              3. Gulir ke bawah dan pilih <strong>Add to Home Screen</strong> (Tambah ke Layar Utama).
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 min-h-[44px]"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
