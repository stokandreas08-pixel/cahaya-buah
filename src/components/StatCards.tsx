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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
      {/* 1. Total Mobil */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Total Mobil
          </span>
          <div className="flex items-baseline space-x-1.5 sm:space-x-2">
            <span className="text-xl sm:text-3xl font-black text-slate-900">
              {formatNumber(totalCars)}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Mobil</span>
          </div>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
          <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      {/* 2. Total Bungkaran */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Total Bungkaran
          </span>
          <div className="flex items-baseline space-x-1.5 sm:space-x-2">
            <span className="text-xl sm:text-3xl font-black text-slate-900">
              {formatNumber(totalPackages)}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Koli</span>
          </div>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
          <Package className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      {/* 3. Total Upah Per Mobil */}
      <div className="col-span-2 sm:col-span-1 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5 sm:mb-1">
            Total Upah Mobil
          </span>
          <div className="text-lg sm:text-2xl font-black text-emerald-700">
            {formatRupiah(totalWage)}
          </div>
          <div className="flex items-center space-x-2 mt-0.5 sm:mt-1 text-[10px] sm:text-[11px]">
            <span className="text-emerald-700 font-bold">
              Lunas: {formatRupiah(paidWage)}
            </span>
            {unpaidWage > 0 && (
              <span className="text-amber-700 font-bold bg-amber-50 px-1 rounded">
                Pending: {formatRupiah(unpaidWage)}
              </span>
            )}
          </div>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
          <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
};
