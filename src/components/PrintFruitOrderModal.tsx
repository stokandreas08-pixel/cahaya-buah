import React from 'react';
import { X, Printer, Package } from 'lucide-react';
import { FruitOrder } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface PrintFruitOrderModalProps {
  order: FruitOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintFruitOrderModal: React.FC<PrintFruitOrderModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        {/* Header Modal (Hidden on Print) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200 print:hidden">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Cetak Surat Jalan & Nota Peti Buah
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Area Nota (Visible on Print) */}
        <div id="printable-fruit-order" className="p-6 sm:p-8 bg-white text-slate-800 text-xs sm:text-sm">
          {/* Header Kop */}
          <div className="border-b-2 border-slate-800 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  GUDANG BUAH SEGAR
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Distributor Buah: Jeruk Gina • Jeruk Faisal • Salak • Buah Naga
                </p>
                <p className="text-[11px] text-slate-400">
                  Pencatatan & Pengiriman Dihitung Per Peti
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-md text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                  SURAT JALAN & NOTA PETI
                </span>
                <p className="text-xs font-bold text-slate-700 mt-1">
                  No: {order.orderNumber}
                </p>
                <p className="text-[11px] text-slate-500">
                  {formatDateIndo(order.date)} • {order.time} WIB
                </p>
              </div>
            </div>
          </div>

          {/* Info Pemesan & Status */}
          <div className="grid grid-cols-2 gap-4 mb-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                Ditujukan Kepada:
              </span>
              <p className="text-sm font-black text-slate-900">{order.customerName}</p>
              {order.customerPhone && (
                <p className="text-xs text-slate-600 mt-0.5">Kontak: {order.customerPhone}</p>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                Status Pesanan:
              </span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black capitalize bg-amber-100 text-amber-900 border border-amber-300">
                {order.status}
              </span>
            </div>
          </div>

          {/* Tabel Rincian Peti */}
          <div className="mb-5 overflow-hidden border border-slate-300 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-xs">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Jenis Buah</th>
                  <th className="py-2.5 px-3 text-center">Grade / Ukuran</th>
                  <th className="py-2.5 px-3 text-center">Jumlah Peti Dipesan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {order.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {item.fruitName}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-800 font-black rounded-md border border-slate-200">
                        Ukuran {item.size}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-slate-900 text-sm">
                      {item.petiCount} Peti
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-amber-50/80 font-black border-t-2 border-slate-300 text-xs sm:text-sm">
                  <td colSpan={3} className="py-3 px-3 text-slate-800 text-right uppercase">
                    Total Keseluruhan Peti:
                  </td>
                  <td className="py-3 px-3 text-center text-amber-900 font-black text-base">
                    {order.totalPeti} Peti
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Catatan jika ada */}
          {order.notes && (
            <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">Catatan Khusus: </span>
              <span className="text-slate-600">{order.notes}</span>
            </div>
          )}

          {/* Kolom Tanda Tangan */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-center text-xs">
            <div>
              <p className="text-slate-500 mb-12">Penerima / Pemesan,</p>
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-[140px]">
                ( {order.customerName} )
              </p>
            </div>

            <div>
              <p className="text-slate-500 mb-12">Petugas Gudang / Pengirim,</p>
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-[140px]">
                ( .................................... )
              </p>
            </div>
          </div>
        </div>

        {/* Footer info modal (Hidden on Print) */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
