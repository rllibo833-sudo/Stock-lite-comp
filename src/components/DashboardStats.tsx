import React from 'react';
import { Layers, Boxes, Wallet, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { InventoryItem, StockStatus } from '../types/inventory';
import { formatRupiah, getStockStatus } from '../utils/storage';

interface DashboardStatsProps {
  items: InventoryItem[];
  activeStatusFilter: StockStatus | 'all';
  onSelectStatusFilter: (status: StockStatus | 'all') => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  items,
  activeStatusFilter,
  onSelectStatusFilter,
}) => {
  const totalItemTypes = items.length;
  const totalUnits = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalAssetValue = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.costPrice) || 0),
    0
  );

  let safeCount = 0;
  let lowCount = 0;
  let outCount = 0;

  items.forEach(item => {
    const status = getStockStatus(item.quantity, item.minStock);
    if (status === 'out') outCount++;
    else if (status === 'low') lowCount++;
    else safeCount++;
  });

  return (
    <section className="mb-6 space-y-3">
      {/* Restock Warning Banner if items need attention */}
      {(outCount > 0 || lowCount > 0) && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold">Peringatan Persediaan: </span>
              {outCount > 0 && (
                <span>
                  <strong className="font-bold text-rose-700">{outCount} barang habis</strong>
                  {lowCount > 0 ? ' dan ' : '. '}
                </span>
              )}
              {lowCount > 0 && (
                <span>
                  <strong className="font-bold text-amber-800">{lowCount} barang menipis</strong> di bawah batas minimum.
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {outCount > 0 && (
              <button
                onClick={() => onSelectStatusFilter('out')}
                className="px-2.5 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors whitespace-nowrap"
              >
                Lihat Barang Habis
              </button>
            )}
            {lowCount > 0 && (
              <button
                onClick={() => onSelectStatusFilter('low')}
                className="px-2.5 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
              >
                Lihat Barang Menipis
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Jenis Barang */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Jenis Barang</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {totalItemTypes}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Total produk terdaftar
          </p>
        </div>

        {/* Metric 2: Total Unit Fisik */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Fisik Unit</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {totalUnits.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Kuantitas barang di gudang/rak
          </p>
        </div>

        {/* Metric 3: Nilai Modal Persediaan */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Nilai Modal Stok</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-700 tabular-nums truncate">
            {formatRupiah(totalAssetValue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Aset modal persediaan saat ini
          </p>
        </div>

        {/* Metric 4: Ringkasan Status Stok Cepat */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Status Persediaan</span>
            <span className="text-[10px] text-slate-400">Klik untuk filter</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            <button
              onClick={() => onSelectStatusFilter(activeStatusFilter === 'safe' ? 'all' : 'safe')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all text-center min-h-[44px] ${
                activeStatusFilter === 'safe'
                  ? 'bg-emerald-100/70 border-emerald-500 text-emerald-950 font-bold'
                  : 'bg-emerald-50/60 border-emerald-200/60 hover:bg-emerald-100/50 text-emerald-800'
              }`}
              title="Barang dengan stok di atas batas minimum"
            >
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-medium">Aman</span>
              </div>
              <span className="text-base font-bold tabular-nums leading-tight">{safeCount}</span>
            </button>

            <button
              onClick={() => onSelectStatusFilter(activeStatusFilter === 'low' ? 'all' : 'low')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all text-center min-h-[44px] ${
                activeStatusFilter === 'low'
                  ? 'bg-amber-100/80 border-amber-500 text-amber-950 font-bold'
                  : 'bg-amber-50/60 border-amber-200/60 hover:bg-amber-100/50 text-amber-800'
              }`}
              title="Barang dengan stok mendekati batas minimum"
            >
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span className="text-[10px] font-medium">Menipis</span>
              </div>
              <span className="text-base font-bold tabular-nums leading-tight">{lowCount}</span>
            </button>

            <button
              onClick={() => onSelectStatusFilter(activeStatusFilter === 'out' ? 'all' : 'out')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all text-center min-h-[44px] ${
                activeStatusFilter === 'out'
                  ? 'bg-rose-100/80 border-rose-500 text-rose-950 font-bold'
                  : 'bg-rose-50/60 border-rose-200/60 hover:bg-rose-100/50 text-rose-800'
              }`}
              title="Barang yang stoknya 0 (kosong)"
            >
              <div className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-rose-600" />
                <span className="text-[10px] font-medium">Habis</span>
              </div>
              <span className="text-base font-bold tabular-nums leading-tight">{outCount}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
