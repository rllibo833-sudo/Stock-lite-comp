import React from 'react';
import { Search, X, Filter, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { StockStatus, SortOption } from '../types/inventory';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStatus: StockStatus | 'all';
  onStatusChange: (status: StockStatus | 'all') => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFilteredCount: number;
  totalItemsCount: number;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
  totalItemsCount,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 mb-4 shadow-xs space-y-3">
      {/* Row 1: Search bar and View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search input with large touch area */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama barang, kode SKU, atau kategori..."
            aria-label="Cari nama barang, kode SKU, atau kategori"
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all min-h-[44px]"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-r-lg"
              aria-label="Hapus teks pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View mode toggle (Table vs Card view) */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Kartu (Nyaman di HP)"
              aria-label="Tampilan Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-2 rounded-md transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Tabel (Detail data)"
              aria-label="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Status & Category & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Status filter tabs (Segmented control) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 max-w-full no-scrollbar">
          <button
            onClick={() => onStatusChange('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
              selectedStatus === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Status
          </button>
          <button
            onClick={() => onStatusChange('safe')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-[36px] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              selectedStatus === 'safe'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Aman
          </button>
          <button
            onClick={() => onStatusChange('low')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-[36px] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              selectedStatus === 'low'
                ? 'bg-amber-700 text-white font-semibold'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Menipis
          </button>
          <button
            onClick={() => onStatusChange('out')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-[36px] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
              selectedStatus === 'out'
                ? 'bg-rose-700 text-white font-semibold'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Habis
          </button>
        </div>

        {/* Dropdowns for Category & Sort */}
        <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
          {/* Category Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              aria-label="Filter berdasarkan kategori barang"
              className="w-full sm:w-auto pl-8 pr-8 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[38px] appearance-none cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label="Urutkan daftar barang"
              className="w-full sm:w-auto pl-8 pr-8 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[38px] appearance-none cursor-pointer"
            >
              <option value="name_asc">Nama (A - Z)</option>
              <option value="stock_asc">Stok Tersedikit</option>
              <option value="stock_desc">Stok Terbanyak</option>
              <option value="value_desc">Nilai Terbesar</option>
              <option value="updated_desc">Baru Diubah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Row 3: Filter info indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <div>
          Menampilkan <strong className="font-semibold text-slate-800">{totalFilteredCount}</strong> dari{' '}
          {totalItemsCount} total barang
        </div>
        {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
          <button
            onClick={() => {
              onSearchChange('');
              onCategoryChange('all');
              onStatusChange('all');
            }}
            className="text-emerald-700 hover:text-emerald-800 font-medium hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded"
          >
            Reset Filter
          </button>
        )}
      </div>
    </div>
  );
};
