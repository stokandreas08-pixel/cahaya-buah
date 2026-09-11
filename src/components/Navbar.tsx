import React from 'react';
import { Truck, Plus, FileSpreadsheet, Users } from 'lucide-react';

interface NavbarProps {
  onOpenNew: () => void;
  onOpenWorkerSummary: () => void;
  onExportCSV: () => void;
  totalRecords: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNew,
  onOpenWorkerSummary,
  onExportCSV,
  totalRecords,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Judul */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Data Bungkaran & Upah Per Mobil
              </h1>
              <p className="text-xs text-slate-500">
                Pencatatan kode bungkaran & otomatis upah terbagi per pembungkar
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-worker-summary"
              type="button"
              onClick={onOpenWorkerSummary}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors"
              title="Lihat rekap upah masing-masing pembungkar"
            >
              <Users className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Rekap Upah Pembungkar</span>
            </button>

            <button
              id="btn-export-csv"
              type="button"
              onClick={onExportCSV}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors"
              title="Unduh data ke format Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Ekspor Excel</span>
            </button>

            <button
              id="btn-add-record"
              type="button"
              onClick={onOpenNew}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Catat Mobil</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
