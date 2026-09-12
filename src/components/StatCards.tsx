import React from 'react';
import { Truck, Package, Banknote, CheckCircle2, Clock } from 'lucide-react';
import { CarUnloadingRecord } from '../types';
import { formatRupiah, formatNumber } from '../utils/formatters';

interface StatCardsProps {
  records: CarUnloadingRecord[];
}

export const StatCards: React.FC<StatCardsProps> = ({ records }) => {
  const totalCars = records.length;
  const totalPackages = records.reduce((sum, r) => sum + (Number(r.packageCount) || 0), 0);
  const totalWage = records.reduce((sum, r) => sum + (Number(r.wagePerCar) || 0), 0);
  const paidWage = records
    .filter(r => r.paymentStatus === 'lunas')
    .reduce((sum, r) => sum + (Number(r.wagePerCar) || 0), 0);
  const unpaidWage = records
    .filter(r => r.paymentStatus === 'belum_dibayar')
    .reduce((sum, r) => sum + (Number(r.wagePerCar) || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
      {/* 1. Total Mobil */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Armada Mobil Masuk
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {formatNumber(totalCars)}
            </span>
            <span className="text-xs font-semibold text-slate-500">Unit</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Tercatat di pembukuan</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Total Bungkaran */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Bungkaran
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {formatNumber(totalPackages)}
            </span>
            <span className="text-xs font-semibold text-slate-500">Koli</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Volume muatan fisik</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Total Upah Per Mobil */}
      <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Kas Upah Bungkaran
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
            {formatRupiah(totalWage)}
          </div>
          <div className="flex items-center space-x-2 mt-1.5 text-[11px]">
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Lunas: {formatRupiah(paidWage)}
            </span>
            {unpaidWage > 0 && (
              <span className="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Tertunda: {formatRupiah(unpaidWage)}
              </span>
            )}
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 ml-3">
          <Banknote className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
