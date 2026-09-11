import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Edit3, Package, AlertTriangle } from 'lucide-react';
import { FruitOrder, OrderItem, FruitType, StockMap, OrderStatus } from '../types';
import { FRUIT_CATALOG, getStockKey } from '../data/fruitCatalog';

interface EditFruitOrderModalProps {
  isOpen: boolean;
  order: FruitOrder | null;
  stocks: StockMap;
  onClose: () => void;
  onSave: (updatedOrder: FruitOrder) => void;
  isAdmin: boolean;
  onPromptLogin: () => void;
}

export const EditFruitOrderModal: React.FC<EditFruitOrderModalProps> = ({
  isOpen,
  order,
  stocks,
  onClose,
  onSave,
  isAdmin,
  onPromptLogin,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<OrderStatus>('menunggu');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<
    Array<{
      id: string;
      fruitType: FruitType;
      size: string;
      petiCount: number;
    }>
  >([]);

  // Keep track of original order items to calculate live projected stock changes
  const [originalItems, setOriginalItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (order) {
      setCustomerName(order.customerName || '');
      setCustomerPhone(order.customerPhone || '');
      setDate(order.date || new Date().toISOString().split('T')[0]);
      setTime(order.time || new Date().toTimeString().substring(0, 5));
      setStatus(order.status || 'menunggu');
      setNotes(order.notes || '');
      setOriginalItems(order.items || []);

      if (order.items && order.items.length > 0) {
        setItems(
          order.items.map((it, idx) => ({
            id: it.id || `edit-item-${idx}`,
            fruitType: it.fruitType,
            size: it.size,
            petiCount: it.petiCount,
          }))
        );
      } else {
        setItems([
          {
            id: 'edit-item-1',
            fruitType: 'jeruk_gina',
            size: 'AB',
            petiCount: 10,
          },
        ]);
      }
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        fruitType: 'jeruk_faisal',
        size: 'AB',
        petiCount: 10,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: 'fruitType' | 'size' | 'petiCount',
    value: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index] };

      if (field === 'fruitType') {
        target.fruitType = value as FruitType;
        const catalog = FRUIT_CATALOG.find((c) => c.id === value);
        if (catalog && catalog.sizes.length > 0) {
          target.size = catalog.sizes[0];
        }
      } else if (field === 'size') {
        target.size = value;
      } else if (field === 'petiCount') {
        target.petiCount = Math.max(1, Number(value) || 1);
      }

      updated[index] = target;
      return updated;
    });
  };

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

    const updatedOrder: FruitOrder = {
      ...order,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      date,
      time,
      status,
      items: formattedItems,
      totalPeti,
      notes: notes.trim() || undefined,
    };

    onSave(updatedOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-amber-500 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base">Edit Pesanan Buah</h3>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md font-mono font-bold">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-xs text-amber-100">
                Ubah rincian pemesan, buah, ukuran peti, dan status pesanan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
          {/* Baris 1: Nama & No HP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Pemesan / Pelanggan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Toko Berkah / Pak Bambang"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                No. HP / WhatsApp Pemesan
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 0812-3456-7890"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Baris 2: Tanggal, Waktu & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Pesanan</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Waktu</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Pesanan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-bold capitalize"
              >
                <option value="menunggu">⏳ Menunggu</option>
                <option value="diproses">🔄 Diproses</option>
                <option value="selesai">✓ Selesai</option>
                <option value="dibatalkan">✕ Batal</option>
              </select>
            </div>
          </div>

          {/* Baris 3: Daftar Buah & Peti */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-700 flex items-center space-x-1.5">
                <Package className="w-4 h-4 text-amber-600" />
                <span>Rincian Buah & Jumlah Peti:</span>
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
                const stockKey = getStockKey(item.fruitType, item.size);
                const availableStock = stocks[stockKey] ?? 0;

                // Find original peti count for this specific fruit & size in original order
                const originalItem = originalItems.find(
                  (orig) => orig.fruitType === item.fruitType && orig.size === item.size
                );
                const originalPeti = originalItem ? originalItem.petiCount : 0;

                // Projected stock = availableStock + originalPeti (if restored) - current item.petiCount
                const projectedStock = availableStock + originalPeti - item.petiCount;
                const willBeNegative = projectedStock < 0;

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      {/* Jenis Buah */}
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          Jenis Buah
                        </label>
                        <select
                          value={item.fruitType}
                          onChange={(e) => handleItemChange(idx, 'fruitType', e.target.value)}
                          className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-bold text-slate-800"
                        >
                          {FRUIT_CATALOG.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Ukuran Grade */}
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          Ukuran / Grade
                        </label>
                        <select
                          value={item.size}
                          onChange={(e) => handleItemChange(idx, 'size', e.target.value)}
                          className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-bold text-amber-900"
                        >
                          {currentCat?.sizes.map((sz) => (
                            <option key={sz} value={sz}>
                              Uk. {sz}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Jumlah Peti */}
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          Jumlah Peti
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            value={item.petiCount}
                            onChange={(e) => handleItemChange(idx, 'petiCount', e.target.value)}
                            className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-black text-slate-900"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            Peti
                          </span>
                        </div>
                      </div>

                      {/* Tombol Hapus Baris */}
                      <div className="sm:col-span-1 flex items-center justify-end sm:justify-center pt-2 sm:pt-4">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus baris buah ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Stock Status & Negative Stock Preview */}
                    <div className="pt-1.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-[11px] gap-1">
                      <span className="text-slate-600">
                        Stok Gudang Saat Ini: <strong className={availableStock < 0 ? 'text-rose-600 font-black' : 'font-bold'}>{availableStock} Peti</strong>
                      </span>

                      {willBeNegative ? (
                        <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>Melebihi stok! Stok gudang akan diupdate jadi: <strong>{projectedStock} Peti (-)</strong></span>
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Stok setelah edit: <strong>{projectedStock} Peti</strong>
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
              placeholder="Contoh: Peti dilapisi koran, kirim via pickup"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-slate-700">
              <span className="text-xs font-medium">Total Pesanan:</span>
              <span className="text-base font-black text-amber-900 bg-amber-100 px-3 py-0.5 rounded-lg border border-amber-200">
                {totalPeti} Peti
              </span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
