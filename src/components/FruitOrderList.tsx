import React, { useState, useMemo } from 'react';
import { Search, Printer, Trash2, X, Package, Phone, Edit3 } from 'lucide-react';
import { FruitOrder, OrderStatus } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface FruitOrderListProps {
  orders: FruitOrder[];
  onPrint: (order: FruitOrder) => void;
  onEdit: (order: FruitOrder) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  isAdmin: boolean;
  onPromptLogin: () => void;
}

export const FruitOrderList: React.FC<FruitOrderListProps> = ({
  orders,
  onPrint,
  onEdit,
  onDelete,
  onUpdateStatus,
  isAdmin,
  onPromptLogin,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        (order.notes && order.notes.toLowerCase().includes(search.toLowerCase())) ||
        order.items.some(
          (it) =>
            it.fruitName.toLowerCase().includes(search.toLowerCase()) ||
            it.size.toLowerCase().includes(search.toLowerCase())
        );

      const matchStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'selesai':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'diproses':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'dibatalkan':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'menunggu':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const totalFilteredPeti = filteredOrders.reduce((sum, o) => sum + o.totalPeti, 0);

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-orders"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pemesan, no. order, jenis buah/ukuran..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Semua ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('menunggu')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                statusFilter === 'menunggu' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Menunggu
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('diproses')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                statusFilter === 'diproses' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Diproses
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('selesai')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                statusFilter === 'selesai' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Selesai
            </button>
          </div>

          <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            Total: {totalFilteredPeti} Peti
          </span>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">Tidak ada pesanan buah ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">
            Gunakan form di atas untuk mencatat pesanan Jeruk Gina, Jeruk Faisal, Salak, atau Buah Naga
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">No. Order & Tanggal</th>
                  <th className="py-3 px-4">Nama Pemesan</th>
                  <th className="py-3 px-4">Rincian Buah & Ukuran</th>
                  <th className="py-3 px-4 text-center">Jumlah Peti</th>
                  <th className="py-3 px-4 text-center">Status Pesanan</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* 1. No Order & Tanggal */}
                    <td className="py-3 px-4">
                      <span className="font-black text-amber-900 block">{order.orderNumber}</span>
                      <span className="text-[11px] text-slate-400">
                        {formatDateIndo(order.date)} • {order.time}
                      </span>
                    </td>

                    {/* 2. Nama Pemesan */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{order.customerName}</span>
                      {order.customerPhone && (
                        <span className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{order.customerPhone}</span>
                        </span>
                      )}
                    </td>

                    {/* 3. Rincian Buah & Ukuran */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {order.items.map((it, idx) => (
                          <div key={it.id || idx} className="flex items-center space-x-1.5">
                            <span className="text-slate-800 font-medium">{it.fruitName}</span>
                            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 font-bold rounded text-[10px]">
                              Uk. {it.size}
                            </span>
                            <span className="text-slate-700 font-black">
                              : {it.petiCount} Peti
                            </span>
                          </div>
                        ))}
                      </div>
                      {order.notes && (
                        <p className="text-[10px] text-slate-400 italic mt-1 max-w-xs truncate">
                          "{order.notes}"
                        </p>
                      )}
                    </td>

                    {/* 4. Total Peti */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-amber-50 text-amber-900 font-black text-sm border border-amber-200">
                        {order.totalPeti} Peti
                      </span>
                    </td>

                    {/* 5. Status Pesanan */}
                    <td className="py-3 px-4 text-center">
                      {isAdmin ? (
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer focus:ring-2 focus:ring-amber-500 ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          <option value="menunggu">⏳ Menunggu</option>
                          <option value="diproses">🔄 Diproses</option>
                          <option value="selesai">✓ Selesai</option>
                          <option value="dibatalkan">✕ Batal</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      )}
                    </td>

                    {/* 6. Aksi (Edit, Print Nota & Hapus) */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(order)}
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                          title="Edit Pesanan Buah"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onPrint(order)}
                          className="p-1.5 text-slate-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                          title="Cetak Surat Jalan / Nota Pesanan Peti"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!isAdmin) {
                              onPromptLogin();
                              return;
                            }
                            if (confirm(`Yakin ingin menghapus pesanan ${order.orderNumber}?`)) {
                              onDelete(order.id);
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors border cursor-pointer ${
                            isAdmin
                              ? 'text-rose-500 hover:text-rose-700 hover:bg-rose-50 border-rose-100'
                              : 'text-slate-300 border-slate-100 hover:bg-slate-100'
                          }`}
                          title={isAdmin ? 'Hapus Pesanan' : 'Hanya Admin yang dapat menghapus pesanan'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
