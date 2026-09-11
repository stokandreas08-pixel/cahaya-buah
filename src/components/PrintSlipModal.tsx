import React from 'react';
import { X, Printer, Users } from 'lucide-react';
import { CarUnloadingRecord } from '../types';
import { formatRupiah, formatNumber, formatDateIndo } from '../utils/formatters';

interface PrintSlipModalProps {
  record: CarUnloadingRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({
  record,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !record) return null;

  const workers = record.workerNames && record.workerNames.length > 0
    ? record.workerNames
    : ['Pembungkar Umum'];
  const count = workers.length;
  const wagePerPerson = record.wagePerWorker || Math.round(record.wagePerCar / count);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Pratinjau Slip Kwitansi Upah
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Slip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-receipt" className="p-6 text-slate-900 bg-white font-sans text-xs">
          <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
            <h1 className="text-base font-black uppercase tracking-wider">
              SLIP BUKTI BUNGKARAN & PEMBAGIAN UPAH
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Sistem Pembongkaran Buah Per Mobil
            </p>
          </div>

          <div className="space-y-2 pb-3 mb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tanggal & Jam:</span>
              <span className="font-bold">{formatDateIndo(record.date)}, {record.time} WIB</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Kode Bungkaran:</span>
              <span className="font-black text-sm text-emerald-800 uppercase px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                {record.packagingCode}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Jumlah Bungkaran:</span>
              <span className="font-bold text-sm">
                {formatNumber(record.packageCount)} Koli
              </span>
            </div>
          </div>

          {/* Rincian Total Mobil */}
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 mb-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Total Upah Mobil:</span>
              <span className="text-base font-black text-slate-900">{formatRupiah(record.wagePerCar)}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 font-medium block">Status:</span>
              <span className="text-xs font-black text-emerald-800 uppercase">
                {record.paymentStatus === 'lunas' ? 'LUNAS' : 'BELUM DIBAYAR'}
              </span>
            </div>
          </div>

          {/* TABEL PEMBAGIAN UPAH KE MASING-MASING PEMBUNGKAR */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-extrabold text-[11px] text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                <Users className="w-3 h-3 text-emerald-700" />
                <span>Rincian Upah Terbagi ({count} Orang):</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-800">
                {formatRupiah(wagePerPerson)} / orang
              </span>
            </div>

            <table className="w-full border border-slate-200 text-[11px]">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="py-1 px-2 text-center w-8 border-r border-slate-200">No</th>
                  <th className="py-1 px-2 border-r border-slate-200">Nama Pembungkar</th>
                  <th className="py-1 px-2 text-right border-r border-slate-200">Bagian Upah</th>
                  <th className="py-1 px-2 text-center w-24">Tanda Tangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workers.map((w, idx) => (
                  <tr key={w + idx}>
                    <td className="py-1.5 px-2 text-center text-slate-500 border-r border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-2 font-bold text-slate-800 border-r border-slate-200">
                      {w}
                    </td>
                    <td className="py-1.5 px-2 text-right font-black text-emerald-700 border-r border-slate-200">
                      {formatRupiah(wagePerPerson)}
                    </td>
                    <td className="py-1.5 px-2 text-center text-slate-300">
                      ( ............... )
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kolom Tanda Tangan Kasir & Sopir */}
          <div className="grid grid-cols-2 gap-4 text-center pt-2 text-[11px] border-t border-dashed border-slate-200">
            <div>
              <p className="text-slate-500 mb-8">Penerima / Mandor,</p>
              <p className="font-bold underline">( ......................... )</p>
            </div>
            <div>
              <p className="text-slate-500 mb-8">Kasir / Petugas Gudang,</p>
              <p className="font-bold underline">( ......................... )</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
