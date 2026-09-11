import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingBag, Check, AlertCircle, AlertTriangle, Package, X, UserCheck } from 'lucide-react';
import { FruitOrder, OrderItem, FruitType, StockMap } from '../types';
import { FRUIT_CATALOG, getStockKey } from '../data/fruitCatalog';

interface AddFruitOrderFormProps {
  onAddOrder: (order: FruitOrder) => void;
  isAdmin: boolean;
  onPromptLogin: () => void;
  stocks: StockMap;
  existingOrders?: FruitOrder[];
  prefillFruit?: { fruitId: FruitType; size?: string } | null;
  onClearPrefill?: () => void;
}

export const AddFruitOrderForm: React.FC<AddFruitOrderFormProps> = ({
  onAddOrder,
  isAdmin,
  onPromptLogin,
  stocks,
  existingOrders = [],
  prefillFruit,
  onClearPrefill,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<FruitOrder | null>(null);

  // Items in current order
  const [items, setItems] = useState<
    Array<{
      id: string;
      fruitType: FruitType;
      size: string;
      petiCount: number;
    }>
  >([
    {
      id: 'item-1',
      fruitType: 'jeruk_gina',
      size: 'AB',
      petiCount: 10,
    },
  ]);

  // Handle prefill from catalog banner click
  useEffect(() => {
    if (prefillFruit) {
      const catalog = FRUIT_CATALOG.find((c) => c.id === prefillFruit.fruitId);
      if (catalog) {
        const sizeToSet = prefillFruit.size && catalog.sizes.includes(prefillFruit.size)
          ? prefillFruit.size
          : catalog.sizes[0];

        setItems([
          {
            id: 'prefill-' + Date.now(),
            fruitType: catalog.id,
            size: sizeToSet,
            petiCount: 10,
          },
        ]);
      }
      onClearPrefill?.();
    }
  }, [prefillFruit, onClearPrefill]);

  // Add new item row
  const handleAddItemRow = () => {
    const defaultCatalog = FRUIT_CATALOG[0];
    setItems((prev) => [
      ...prev,
      {
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        fruitType: defaultCatalog.id,
        size: defaultCatalog.sizes[0],
        petiCount: 5,
      },
    ]);
  };

  // Remove item row
  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Update item field
  const handleItemChange = (
    index: number,
    field: 'fruitType' | 'size' | 'petiCount',
    value: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index] };

      if (field === 'fruitType') {
        const newCatalog = FRUIT_CATALOG.find((c) => c.id === value);
        target.fruitType = value;
        target.size = newCatalog ? newCatalog.sizes[0] : 'Standar';
      } else if (field === 'size') {
        target.size = value;
      } else if (field === 'petiCount') {
        target.petiCount = Math.max(1, Number(value) || 1);
      }

      updated[index] = target;
      return updated;
    });
  };

  // Unique customer names for datalist suggestion
  const existingCustomerNames = Array.from(
    new Set(
      (existingOrders || [])
        .map((o) => o.customerName?.trim())
        .filter(Boolean) as string[]
    )
  );

  // Duplicate check (case-insensitive)
  const normalizedInput = customerName.trim().toLowerCase();
  const duplicateOrders = (existingOrders || []).filter(
    (o) => o.customerName && o.customerName.trim().toLowerCase() === normalizedInput
  );
  const hasDuplicate = normalizedInput.length >= 2 && duplicateOrders.length > 0;

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setItems([
      {
        id: 'item-1',
        fruitType: 'jeruk_gina',
        size: 'AB',
        petiCount: 10,
      },
    ]);
  };

  const executeAddOrder = (orderToSave: FruitOrder) => {
    onAddOrder(orderToSave);
    resetForm();
    setShowDuplicateModal(false);
    setPendingOrder(null);
  };

  // Total peti calculation
  const totalPeti = items.reduce((sum, it) => sum + (Number(it.petiCount) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('Mohon masukkan nama pemesan / pelanggan');
      return;
    }

    if (totalPeti <= 0) {
      alert('Jumlah peti minimal 1');
      return;
    }

    const orderNumber = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 5);

    const formattedItems: OrderItem[] = items.map((it) => {
      const cat = FRUIT_CATALOG.find((c) => c.id === it.fruitType);
      const fruitName = cat ? cat.name : it.fruitType;
      return {
        id: it.id,
        fruitType: it.fruitType,
        fruitName,
        size: it.size,
        petiCount: it.petiCount,
      };
    });

    const newOrder: FruitOrder = {
      id: 'order-' + Date.now(),
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      date: dateStr,
      time: timeStr,
      items: formattedItems,
      totalPeti,
      status: 'menunggu',
      notes: notes.trim() || undefined,
      createdAt: now.toISOString(),
    };

    // If customer name already exists, show confirmation modal first
    if (hasDuplicate) {
      setPendingOrder(newOrder);
      setShowDuplicateModal(true);
      return;
    }

    executeAddOrder(newOrder);
  };

  return (
    <div id="add-fruit-order-form" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-6">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Buat Pesanan Buah (Jumlah Peti)
            </h2>
            <p className="text-[11px] text-slate-500">
              Pilihan Jeruk Gina, Jeruk Faisal (AB, C, DTOP, DR, DK), Salak, & Buah Naga (A, B)
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center space-x-1">
          <Package className="w-3.5 h-3.5 text-amber-700" />
          <span>Fokus Jumlah Peti</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Customer Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700">
                Nama Pemesan / Pelanggan <span className="text-rose-500">*</span>
              </label>
              {hasDuplicate && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center space-x-1 border border-amber-300">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>Nama Sudah Ada ({duplicateOrders.length}x)</span>
                </span>
              )}
            </div>

            <input
              id="input-customer-name"
              type="text"
              required
              list="existing-customers-list"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Toko Berkah / Pak Bambang"
              className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 transition-colors ${
                hasDuplicate
                  ? 'border-amber-400 focus:ring-amber-500 bg-amber-50/40 text-slate-900 font-semibold'
                  : 'border-slate-200 focus:ring-amber-500'
              }`}
            />

            {/* Datalist for existing customers suggestions */}
            <datalist id="existing-customers-list">
              {existingCustomerNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>

            {/* Inline Duplicate Reminder Banner */}
            {hasDuplicate && (
              <div className="mt-2.5 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 shadow-2xs animate-fade-in">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <p className="font-bold text-amber-950">
                        Pengingat: Nama &quot;{customerName.trim()}&quot; sudah pernah tercatat!
                      </p>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">
                        {duplicateOrders.length} Pesanan Sebelumnya
                      </span>
                    </div>

                    <p className="text-[11px] text-amber-800 mt-1">
                      Pastikan apakah ini pesanan tambahan baru untuk pelanggan yang sama, atau ada pelanggan berbeda dengan nama yang sama.
                    </p>

                    {/* Ringkasan Pesanan yang Sudah Ada */}
                    <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {duplicateOrders.map((prevOrder) => {
                        const statusBadge =
                          prevOrder.status === 'selesai'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : prevOrder.status === 'diproses'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : prevOrder.status === 'batal'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300';

                        return (
                          <div
                            key={prevOrder.id}
                            className="p-2 bg-white rounded-lg border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-2xs"
                          >
                            <div className="flex items-center space-x-2 text-[11px]">
                              <span className="font-mono font-bold text-slate-900">{prevOrder.orderNumber}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600">{prevOrder.date}</span>
                              <span className="text-slate-400">•</span>
                              <span className="font-bold text-amber-900">{prevOrder.totalPeti} Peti</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border capitalize ${statusBadge}`}>
                                {prevOrder.status}
                              </span>
                              {prevOrder.customerPhone && !customerPhone && (
                                <button
                                  type="button"
                                  onClick={() => setCustomerPhone(prevOrder.customerPhone || '')}
                                  className="text-[10px] text-amber-800 hover:text-amber-950 underline font-semibold cursor-pointer"
                                  title="Gunakan no. telepon dari pesanan ini"
                                >
                                  Gunakan No. HP ({prevOrder.customerPhone})
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              No. HP / WhatsApp Pemesan (Opsional)
            </label>
            <input
              id="input-customer-phone"
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Contoh: 0812-3456-7890"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Dynamic Items Table (Dihitung Per Peti) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-bold text-slate-700 flex items-center space-x-1.5">
              <span>Daftar Buah & Jumlah Peti Dipesan:</span>
            </label>
            <button
              type="button"
              onClick={handleAddItemRow}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Buah Lain</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {items.map((item, idx) => {
              const currentCat = FRUIT_CATALOG.find((c) => c.id === item.fruitType);
              const availableSizes = currentCat ? currentCat.sizes : ['Standar'];
              const stockKey = getStockKey(item.fruitType, item.size);
              const availableStock = stocks[stockKey] ?? 0;
              const isExceedStock = item.petiCount > availableStock;

              return (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                >
                  {/* 1. Pilih Buah (Gina, Faisal, Salak, Naga) */}
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Pilihan Buah:
                    </label>
                    <select
                      value={item.fruitType}
                      onChange={(e) =>
                        handleItemChange(idx, 'fruitType', e.target.value as FruitType)
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="jeruk_gina">🍊 1. Jeruk Gina</option>
                      <option value="jeruk_faisal">🍊 2. Jeruk Faisal</option>
                      <option value="salak">🤎 3. Salak</option>
                      <option value="naga">🐉 4. Buah Naga</option>
                    </select>
                  </div>

                  {/* 2. Pilih Ukuran / Grade */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Ukuran / Grade:
                    </label>
                    <select
                      value={item.size}
                      onChange={(e) => handleItemChange(idx, 'size', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-amber-900"
                    >
                      {availableSizes.map((sz) => (
                        <option key={sz} value={sz}>
                          Ukuran {sz}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Jumlah Peti */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Jumlah Peti Dipesan:
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        min={1}
                        value={item.petiCount}
                        onChange={(e) => handleItemChange(idx, 'petiCount', e.target.value)}
                        className={`w-full px-2.5 py-1.5 text-xs font-black bg-white border rounded-lg text-center ${
                          isExceedStock ? 'border-amber-400 text-amber-900 bg-amber-50' : 'border-slate-300'
                        }`}
                      />
                      <span className="text-[11px] font-bold text-slate-500">Peti</span>
                    </div>
                  </div>

                  {/* 4. Aksi Hapus */}
                  <div className="sm:col-span-1 flex items-center justify-end sm:justify-center pt-2 sm:pt-4">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus baris buah"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Baris Informasi Stok Tersedia & Warning */}
                  <div className="sm:col-span-12 text-[11px] pt-1 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <span className="text-[10px] font-bold text-slate-400">Status Gudang:</span>
                      <span>
                        Stok {currentCat?.name} (Uk. {item.size}):{' '}
                        <strong
                          className={`font-black ${
                            availableStock > 0 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {availableStock} Peti {availableStock < 0 ? '(Minus)' : 'Tersedia'}
                        </strong>
                      </span>
                    </div>

                    {isExceedStock && (
                      <span className="text-[10px] font-bold text-rose-700 flex items-center space-x-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>
                          Pesanan ({item.petiCount} peti) melebihi stok gudang ({availableStock} peti) &rarr; Stok akan diupdate jadi: <strong>{availableStock - item.petiCount} Peti (-)</strong>
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Catatan Khusus */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Catatan Khusus / Petunjuk Pengiriman (Opsional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Peti minta dilapisi koran, kirim jam 2 siang via pickup"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Submit Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center space-x-2 text-slate-700">
            <span className="text-xs font-medium">Total Pesanan:</span>
            <span className="text-base font-black text-amber-900 bg-amber-100 px-3 py-0.5 rounded-lg border border-amber-200">
              {totalPeti} Peti
            </span>
          </div>

          <button
            id="btn-submit-fruit-order"
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Simpan Pesanan ({totalPeti} Peti)</span>
          </button>
        </div>
      </form>

      {/* Duplicate Customer Name Confirmation Modal */}
      {showDuplicateModal && pendingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Konfirmasi: Nama Pemesan Sudah Ada
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Peringatan nama pemesan yang sama di sistem
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 text-xs text-slate-700 space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="font-semibold text-amber-950">
                  Nama pemesan <strong className="font-black underline">&quot;{pendingOrder.customerName}&quot;</strong> sudah tercatat sebelumnya sebanyak {duplicateOrders.length} kali.
                </p>
                <p className="text-[11px] text-amber-800 mt-1">
                  Total pesanan baru ini: <strong>{pendingOrder.totalPeti} Peti</strong>.
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-1.5 text-[11px] uppercase tracking-wider">
                  Riwayat Pesanan Sebelumnya untuk Nama Ini:
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {duplicateOrders.map((o) => (
                    <div
                      key={o.id}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
                        <span className="mx-1 text-slate-400">•</span>
                        <span className="text-slate-600">{o.date}</span>
                        <span className="mx-1 text-slate-400">•</span>
                        <span className="font-bold text-slate-800">{o.totalPeti} Peti</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 capitalize">
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda ingin <strong>tetap menyimpan</strong> pesanan baru ini untuk nama pelanggan yang sama?
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowDuplicateModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal / Periksa Kembali
              </button>
              <button
                type="button"
                onClick={() => executeAddOrder(pendingOrder)}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Ya, Tetap Simpan Pesanan Baru</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
