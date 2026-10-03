import React, { useState, useEffect, useMemo } from 'react';
import { Plus, PackageOpen, PlusCircle } from 'lucide-react';
import { InventoryItem, StockMutation, StockStatus, SortOption, MutationType } from './types/inventory';
import {
  loadItems,
  saveItems,
  loadMutations,
  saveMutations,
  INITIAL_ITEMS,
  getStockStatus,
  createBackupFile,
  sanitizeItem,
  sanitizeMutation
} from './utils/storage';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { SearchAndFilters } from './components/SearchAndFilters';
import { ItemCard } from './components/ItemCard';
import { ItemTable } from './components/ItemTable';
import { ItemFormModal } from './components/ItemFormModal';
import { StockAdjustModal } from './components/StockAdjustModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { StockHistoryModal } from './components/StockHistoryModal';
import { RestoreModal } from './components/RestoreModal';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  // Inventory state persisted in localStorage with safe sanitization
  const [items, setItems] = useState<InventoryItem[]>(() => loadItems());
  const [mutations, setMutations] = useState<StockMutation[]>(() => loadMutations());

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StockStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync items to localStorage whenever they change
  useEffect(() => {
    saveItems(items);
  }, [items]);

  // Sync mutations to localStorage whenever they change
  useEffect(() => {
    saveMutations(mutations);
  }, [mutations]);

  // Unique categories list
  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.category && it.category.trim()) set.add(it.category.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'id'));
  }, [items]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Search filter (name, SKU, category)
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase().trim();
          const matchName = item.name.toLowerCase().includes(query);
          const matchSku = item.sku.toLowerCase().includes(query);
          const matchCat = item.category.toLowerCase().includes(query);
          if (!matchName && !matchSku && !matchCat) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'all') {
          const itemStatus = getStockStatus(item.quantity, item.minStock);
          if (itemStatus !== selectedStatus) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name_asc':
            return a.name.localeCompare(b.name, 'id');
          case 'stock_desc':
            return b.quantity - a.quantity;
          case 'stock_asc':
            return a.quantity - b.quantity;
          case 'value_desc':
            return b.quantity * b.costPrice - a.quantity * a.costPrice;
          case 'updated_desc':
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          default:
            return 0;
        }
      });
  }, [items, searchTerm, selectedCategory, selectedStatus, sortBy]);

  // Handlers for Add / Edit Item
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (
    itemData: Omit<InventoryItem, 'id' | 'updatedAt'>,
    editId?: string
  ) => {
    const now = new Date().toISOString();

    if (editId) {
      // Edit existing item
      setItems((prev) =>
        prev.map((it) =>
          it.id === editId
            ? sanitizeItem({ ...it, ...itemData, updatedAt: now })
            : it
        )
      );
      addToast('success', `Barang "${itemData.name}" berhasil diperbarui`);
    } else {
      // Create new item
      const newItem: InventoryItem = sanitizeItem({
        ...itemData,
        id: 'item-' + Date.now().toString(),
        updatedAt: now,
      });

      setItems((prev) => [newItem, ...prev]);

      // Record initial stock creation log if quantity > 0
      if (newItem.quantity > 0) {
        const newLog: StockMutation = sanitizeMutation({
          id: 'mut-' + Date.now().toString(),
          itemId: newItem.id,
          itemName: newItem.name,
          type: 'in',
          amount: newItem.quantity,
          previousQuantity: 0,
          newQuantity: newItem.quantity,
          note: 'Pencatatan persediaan awal barang baru',
          timestamp: now,
        });
        setMutations((prev) => [newLog, ...prev]);
      }

      addToast('success', `Barang baru "${newItem.name}" berhasil ditambahkan`);
    }

    setIsItemModalOpen(false);
  };

  // Handlers for Delete Item
  const handleOpenDeleteModal = (item: InventoryItem) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (item: InventoryItem) => {
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    setIsDeleteModalOpen(false);
    addToast('info', `Barang "${item.name}" telah dihapus`);
  };

  // Handlers for Stock Adjustments (Modal)
  const handleOpenAdjustModal = (item: InventoryItem) => {
    setAdjustingItem(item);
    setIsAdjustModalOpen(true);
  };

  const handleConfirmAdjust = (
    item: InventoryItem,
    type: MutationType,
    amount: number,
    note: string
  ) => {
    const prevQty = item.quantity;
    let newQty = prevQty;

    if (type === 'in') {
      newQty = Math.min(999999999, prevQty + amount);
    } else if (type === 'out') {
      newQty = Math.max(0, prevQty - amount);
    } else if (type === 'adjustment') {
      newQty = Math.min(999999999, Math.max(0, amount));
    }

    const now = new Date().toISOString();

    // Update item
    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id
          ? sanitizeItem({ ...it, quantity: newQty, updatedAt: now })
          : it
      )
    );

    // Record mutation log
    const mutationRecord: StockMutation = sanitizeMutation({
      id: 'mut-' + Date.now().toString(),
      itemId: item.id,
      itemName: item.name,
      type,
      amount: type === 'adjustment' ? Math.abs(newQty - prevQty) : amount,
      previousQuantity: prevQty,
      newQuantity: newQty,
      note,
      timestamp: now,
    });
    setMutations((prev) => [mutationRecord, ...prev]);

    setIsAdjustModalOpen(false);
    addToast('success', `Stok "${item.name}" disesuaikan: ${prevQty} → ${newQty} ${item.unit}`);
  };

  // Quick single-unit adjustment (+1 or -1) directly from card/table
  const handleQuickAdjust = (item: InventoryItem, delta: number) => {
    const prevQty = item.quantity;
    const newQty = Math.min(999999999, Math.max(0, prevQty + delta));
    if (newQty === prevQty) return;

    const now = new Date().toISOString();
    const type: MutationType = delta > 0 ? 'in' : 'out';

    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id
          ? sanitizeItem({ ...it, quantity: newQty, updatedAt: now })
          : it
      )
    );

    const log: StockMutation = sanitizeMutation({
      id: 'mut-' + Date.now().toString(),
      itemId: item.id,
      itemName: item.name,
      type,
      amount: Math.abs(delta),
      previousQuantity: prevQty,
      newQuantity: newQty,
      note: delta > 0 ? 'Penambahan cepat (+1)' : 'Pengurangan cepat (-1)',
      timestamp: now,
    });
    setMutations((prev) => [log, ...prev]);

    addToast('success', `${item.name}: ${prevQty} → ${newQty} ${item.unit}`);
  };

  // Backup data to JSON file
  const handleBackupData = () => {
    try {
      createBackupFile(items, mutations);
      addToast('success', 'Backup berhasil diunduh (format JSON)');
    } catch {
      addToast('error', 'Gagal membuat file backup');
    }
  };

  // Restore data from backup file
  const handleConfirmRestore = (newItems: InventoryItem[], newMutations: StockMutation[]) => {
    try {
      setItems(newItems);
      setMutations(newMutations);
      addToast('success', `Data berhasil dipulihkan (${newItems.length} barang)`);
    } catch {
      addToast('error', 'Terjadi kesalahan saat memulihkan data');
    }
  };

  // Reset to default sample items
  const handleResetData = () => {
    if (window.confirm('Kembalikan data persediaan ke contoh bawaan awal? Data Anda saat ini akan diganti dengan data contoh.')) {
      setItems(INITIAL_ITEMS.map((it, idx) => sanitizeItem(it, idx)));
      setMutations([]);
      addToast('info', 'Data persediaan dikembalikan ke contoh awal');
    }
  };

  // Clear all items
  const handleClearAllData = () => {
    if (window.confirm('Kosongkan semua persediaan? Seluruh barang yang ada akan dihapus secara permanen.')) {
      setItems([]);
      setMutations([]);
      addToast('info', 'Semua data barang telah dikosongkan');
    }
  };

  // Clear history
  const handleClearHistory = () => {
    if (window.confirm('Hapus seluruh riwayat mutasi stok?')) {
      setMutations([]);
      addToast('info', 'Riwayat mutasi berhasil dibersihkan');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased pb-24 sm:pb-12">
      {/* Top Header */}
      <Header
        items={items}
        onOpenAddModal={handleOpenAddModal}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onBackupData={handleBackupData}
        onOpenRestoreModal={() => setIsRestoreModalOpen(true)}
        onResetData={handleResetData}
        onClearAllData={handleClearAllData}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 flex-1 w-full">
        {/* Dashboard Persediaan Metric Cards */}
        <DashboardStats
          items={items}
          activeStatusFilter={selectedStatus}
          onSelectStatusFilter={setSelectedStatus}
        />

        {/* Search, Filter & View Controls */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={existingCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={filteredItems.length}
          totalItemsCount={items.length}
        />

        {/* Inventory Items List / Table View */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-3">
              <PackageOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {items.length === 0
                ? 'Belum Ada Barang Persediaan'
                : 'Tidak Ada Barang yang Cocok'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
              {items.length === 0
                ? 'Mulai catat stok barang usaha Anda dengan menekan tombol Tambah Barang di bawah.'
                : 'Coba ubah kata kunci pencarian atau reset filter status dan kategori untuk melihat barang lainnya.'}
            </p>
            {items.length === 0 ? (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tambah Barang Pertama</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Reset Pencarian & Filter
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid Card View - Optimized for Android Mobile & Touch */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onAdjustStock={handleOpenAdjustModal}
                onQuickAdjust={handleQuickAdjust}
              />
            ))}
          </div>
        ) : (
          /* Table View - Clean High-Density View for Desktop */
          <ItemTable
            items={filteredItems}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
            onAdjustStock={handleOpenAdjustModal}
            onQuickAdjust={handleQuickAdjust}
          />
        )}
      </main>

      {/* Floating Bottom Quick Action for Android / Mobile Users */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 sm:hidden z-20 flex items-center gap-2">
        <button
          onClick={handleOpenAddModal}
          className="w-full h-12 bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Tambah barang baru"
        >
          <PlusCircle className="w-5 h-5 stroke-[2.5]" />
          <span>+ Tambah Barang Baru</span>
        </button>
      </div>

      {/* Modals */}
      <ItemFormModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        editItem={editingItem}
        allItems={items}
        existingCategories={existingCategories}
      />

      <StockAdjustModal
        isOpen={isAdjustModalOpen}
        item={adjustingItem}
        onClose={() => setIsAdjustModalOpen(false)}
        onConfirm={handleConfirmAdjust}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        item={deletingItem}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <StockHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        mutations={mutations}
        onClearHistory={handleClearHistory}
      />

      <RestoreModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirmRestore={handleConfirmRestore}
        currentItemsCount={items.length}
      />

      {/* Toast Feedback */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
