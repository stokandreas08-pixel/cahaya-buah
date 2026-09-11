import React from 'react';
import { X, Users } from 'lucide-react';
import { CarUnloadingRecord } from '../types';
import { formatRupiah } from '../utils/formatters';

interface WorkerSummaryModalProps {
  records: CarUnloadingRecord[];
  isOpen: boolean;
  onClose: () => void;
}

interface WorkerStat {
  name: string;
  totalCars: number;
  totalWageEarned: number;
  paidWageEarned: number;
  unpaidWageEarned: number;
  codeList: string[];
}

export const WorkerSummaryModal: React.FC<WorkerSummaryModalProps> = ({
  records,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  // Aggregate stats per worker
  const workerMap = new Map<string, WorkerStat>();

  records.forEach(record => {
    const workers = record.workerNames && record.workerNames.length > 0
      ? record.workerNames
      : ['Umum'];
    const splitWage = record.wagePerWorker || Math.round(record.wagePerCar / workers.length);
    const isPaid = record.paymentStatus === 'lunas';

    workers.forEach(w => {
      const existing = workerMap.get(w) || {
        name: w,
        totalCars: 0,
        totalWageEarned: 0,
        paidWageEarned: 0,
        unpaidWageEarned: 0,
        codeList: [],
      };

      existing.totalCars += 1;
      existing.totalWageEarned += splitWage;
      if (isPaid) {
        existing.paidWageEarned += splitWage;
      } else {
        existing.unpaidWageEarned += splitWage;
      }
      if (!existing.codeList.includes(record.packagingCode)) {
        existing.codeList.push(record.packagingCode);
      }

      workerMap.set(w, existing);
    });
  });

  const workerStats = Array.from(workerMap.values()).sort(
    (a, b) => b.totalWageEarned - a.totalWageEarned
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Rekap Total Upah Masing-Masing Pembungkar
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[75vh] overflow-y-auto">
          <p className="text-xs text-slate-500 mb-4">
            Total akumulasi bagian upah yang diterima oleh setiap orang pembungkar dari seluruh mobil:
          </p>

          <div className="space-y-3">
            {workerStats.map((stat, idx) => (
              <div
                key={stat.name}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{stat.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Membongkar <strong>{stat.totalCars} mobil</strong> ({stat.codeList.join(', ')})
                    </p>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                  <span className="text-xs text-slate-400 font-semibold block">Total Upah:</span>
                  <span className="text-base font-black text-emerald-700 block">
                    {formatRupiah(stat.totalWageEarned)}
                  </span>
                  <div className="text-[10px] space-x-1.5 mt-0.5">
                    <span className="text-emerald-700 font-bold">
                      Lunas: {formatRupiah(stat.paidWageEarned)}
                    </span>
                    {stat.unpaidWageEarned > 0 && (
                      <span className="text-amber-700 font-bold">
                        Pending: {formatRupiah(stat.unpaidWageEarned)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
