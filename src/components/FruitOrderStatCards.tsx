import React from 'react';
import { Package, Clock, CheckCircle2, Boxes } from 'lucide-react';
import { FruitOrder, StockMap } from '../types';
import { formatNumber } from '../utils/formatters';

interface FruitOrderStatCardsProps {
  orders: FruitOrder[];
  stocks: StockMap;
  onOpenStockManager?: () => void;
}

export const FruitOrderStatCards: React.FC<FruitOrderStatCardsProps> = ({
  orders,
  stocks,
  onOpenStockManager,
}) => {
  const totalPetiDipesan = orders.reduce((sum, ord) => sum + ord.totalPeti, 0);
  const totalStokGudang = (Object.values(stocks) as number[]).reduce((sum: number, qty: number) => sum + (qty || 0), 0);
  const pendingOrders = orders.filter(
    (ord) => ord.status === 'menunggu' || ord.status === 'diproses'
  ).length;
  const completedOrders = orders.filter((ord) => ord.status === 'selesai').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Total Peti Dipesan */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Peti Dipesan</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-black text-slate-900">
            {formatNumber(totalPetiDipesan)}
          </span>
          <span className="text-xs text-slate-500 font-medium">Peti</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Dari {orders.length} transaksi pesanan</p>
      </div>

      {/* 2. Total Stok Buah Tersedia (Gudang) */}
      <div
        onClick={onOpenStockManager}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-colors cursor-pointer group"
        title="Klik untuk kelola stok buah di gudang"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 group-hover:text-amber-700 transition-colors">
            {totalStokGudang < 0 ? 'Defisit Stok Gudang' : 'Stok Gudang Tersedia'}
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            totalStokGudang < 0
              ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'
              : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
          }`}>
            <Boxes className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1.5">
          <span className={`text-xl sm:text-2xl font-black ${
            totalStokGudang < 0 ? 'text-rose-600' : 'text-emerald-800'
          }`}>
            {formatNumber(totalStokGudang)}
          </span>
          <span className="text-xs text-slate-500 font-medium">Peti</span>
          {totalStokGudang < 0 && (
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              Minus
            </span>
          )}
        </div>
        <p className={`text-[11px] font-semibold mt-1 ${
          totalStokGudang < 0 ? 'text-rose-600' : 'text-emerald-600'
        }`}>
          {totalStokGudang < 0 ? 'Perlu penambahan buah (klik kelola)' : 'Klik untuk kelola stok &rarr;'}
        </p>
      </div>

      {/* 3. Pesanan Dalam Proses */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Sedang Diproses</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-black text-blue-700">
            {pendingOrders}
          </span>
          <span className="text-xs text-slate-500 font-medium">Pesanan</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Menunggu & proses pengemasan</p>
      </div>

      {/* 4. Pesanan Selesai */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Pesanan Selesai</span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-black text-teal-700">
            {completedOrders}
          </span>
          <span className="text-xs text-slate-500 font-medium">Pesanan</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Telah dikirim atau diterima</p>
      </div>
    </div>
  );
};
