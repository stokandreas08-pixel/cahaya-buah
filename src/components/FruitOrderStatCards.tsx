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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Volume Dipesan</span>
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {formatNumber(totalPetiDipesan)}
          </span>
          <span className="text-xs text-slate-500 font-medium">Peti</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Total {orders.length} berkas pesanan</p>
      </div>

      {/* 2. Total Stok Buah Tersedia (Gudang) */}
      <div
        onClick={onOpenStockManager}
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-400 transition-colors cursor-pointer group"
        title="Klik untuk kelola stok fisik buah gudang"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-900 transition-colors">
            {totalStokGudang < 0 ? 'Defisit Inventaris' : 'Inventaris Fisik'}
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
            totalStokGudang < 0
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <Boxes className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1.5">
          <span className={`text-xl sm:text-2xl font-black font-mono ${
            totalStokGudang < 0 ? 'text-rose-600' : 'text-slate-900'
          }`}>
            {formatNumber(totalStokGudang)}
          </span>
          <span className="text-xs text-slate-500 font-medium">Peti</span>
          {totalStokGudang < 0 && (
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              Minus
            </span>
          )}
        </div>
        <p className="text-[10px] font-medium text-slate-500 mt-1">
          {totalStokGudang < 0 ? 'Perlu penambahan buah (klik kelola)' : 'Klik kelola buku stok &rarr;'}
        </p>
      </div>

      {/* 3. Pesanan Dalam Proses */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Antrean / Proses</span>
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {pendingOrders}
          </span>
          <span className="text-xs text-slate-500 font-medium">Order</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Dalam pengerjaan kemasan</p>
      </div>

      {/* 4. Pesanan Selesai */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Realisasi Selesai</span>
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1.5">
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {completedOrders}
          </span>
          <span className="text-xs text-slate-500 font-medium">Order</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Telah diserahterimakan</p>
      </div>
    </div>
  );
};
