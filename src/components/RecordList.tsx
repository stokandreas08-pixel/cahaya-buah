import React, { useState, useMemo } from 'react';
import { Search, Printer, Edit2, Trash2, X, Lock } from 'lucide-react';
import { CarUnloadingRecord, PaymentStatus } from '../types';
import { formatRupiah, formatNumber, formatDateIndo } from '../utils/formatters';

interface RecordListProps {
  records: CarUnloadingRecord[];
  onEdit: (record: CarUnloadingRecord) => void;
  onPrint: (record: CarUnloadingRecord) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  isAdmin: boolean;
  onPromptLogin: () => void;
}

export const RecordList: React.FC<RecordListProps> = ({
  records,
  onEdit,
  onPrint,
  onDelete,
  onToggleStatus,
  isAdmin,
  onPromptLogin,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [selectedCodeFilter, setSelectedCodeFilter] = useState<string>('all');
  const [selectedWorkerFilter, setSelectedWorkerFilter] = useState<string>('all');

  // Distinct codes for quick filter
  const distinctCodes = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.packagingCode) set.add(r.packagingCode);
    });
    return Array.from(set);
  }, [records]);

  // Distinct workers
  const distinctWorkers = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      (r.workerNames || []).forEach(w => set.add(w));
    });
    return Array.from(set);
  }, [records]);

  // Filter records
  const filtered = useMemo(() => {
    return records.filter(r => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCode = r.packagingCode.toLowerCase().includes(q);
        const matchWorkers = (r.workerNames || []).some(w => w.toLowerCase().includes(q));
        if (!matchCode && !matchWorkers) return false;
      }
      if (statusFilter !== 'all' && r.paymentStatus !== statusFilter) {
        return false;
      }
      if (selectedCodeFilter !== 'all' && r.packagingCode !== selectedCodeFilter) {
        return false;
      }
      if (selectedWorkerFilter !== 'all' && !(r.workerNames || []).includes(selectedWorkerFilter)) {
        return false;
      }
      return true;
    });
  }, [records, search, statusFilter, selectedCodeFilter, selectedWorkerFilter]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="input-search-records"
            type="text"
            placeholder="Cari kode (jeruk gina 01) atau nama..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center space-x-2 w-full sm:w-auto justify-end">
          {/* Filter Nama Pembungkar */}
          <select
            id="filter-worker"
            value={selectedWorkerFilter}
            onChange={e => setSelectedWorkerFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            <option value="all">Semua Pembungkar</option>
            {distinctWorkers.map(w => (
              <option key={w} value={w}>
                Pembungkar: {w}
              </option>
            ))}
          </select>

          {/* Filter Kode */}
          <select
            id="filter-code"
            value={selectedCodeFilter}
            onChange={e => setSelectedCodeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            <option value="all">Semua Kode Bungkaran</option>
            {distinctCodes.map(code => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>

          {/* Filter Status Bayar */}
          <select
            id="filter-status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            <option value="all">Semua Status Upah</option>
            <option value="lunas">Upah: Lunas</option>
            <option value="belum_dibayar">Upah: Belum Dibayar</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs">
          Tidak ada data bungkaran yang cocok dengan pencarian.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Waktu / Tanggal</th>
                <th className="py-3 px-4">Kode Bungkaran</th>
                <th className="py-3 px-4 text-center">Bungkaran</th>
                <th className="py-3 px-4">Nama-Nama Pembungkar</th>
                <th className="py-3 px-4 text-right">Upah Terbagi Per Orang</th>
                <th className="py-3 px-4 text-center">Status Upah</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => {
                const workers = item.workerNames && item.workerNames.length > 0
                  ? item.workerNames
                  : ['Umum'];
                const count = workers.length;
                const wagePerPerson = item.wagePerWorker || Math.round(item.wagePerCar / count);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Waktu */}
                    <td className="py-3 px-4 text-slate-500">
                      <span className="font-semibold text-slate-800 block text-xs">
                        {formatDateIndo(item.date)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {item.time} WIB
                      </span>
                    </td>

                    {/* Kode Bungkaran (misal jeruk gina 01) */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm">
                        {item.packagingCode}
                      </span>
                      {item.notes && (
                        <span className="text-[11px] text-slate-400 block mt-0.5 truncate max-w-xs">
                          {item.notes}
                        </span>
                      )}
                    </td>

                    {/* Jumlah Bungkaran */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {formatNumber(item.packageCount)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">koli</span>
                    </td>

                    {/* Nama-Nama Pembungkar */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1 items-center">
                          {workers.map(w => (
                            <span
                              key={w}
                              className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md text-[11px] font-semibold border border-slate-200"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Total {count} orang pembungkar
                        </span>
                      </div>
                    </td>

                    {/* Upah Terbagi Per Orang */}
                    <td className="py-3 px-4 text-right">
                      <div>
                        <span className="font-black text-emerald-700 text-sm sm:text-base block">
                          {formatRupiah(wagePerPerson)}
                          <span className="text-xs font-semibold text-slate-600"> / org</span>
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Total Mobil: <strong>{formatRupiah(item.wagePerCar)}</strong>
                        </span>
                      </div>
                    </td>

                    {/* Status Upah (Klik untuk toggle bila Admin) */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (isAdmin) {
                            onToggleStatus(item.id);
                          } else {
                            onPromptLogin();
                          }
                        }}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-2xs ${
                          isAdmin ? 'cursor-pointer' : 'cursor-pointer opacity-90'
                        } ${
                          item.paymentStatus === 'lunas'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title={
                          isAdmin
                            ? 'Klik untuk ubah status Lunas/Belum'
                            : 'Status upah bungkaran. Login admin untuk mengubah status.'
                        }
                      >
                        {item.paymentStatus === 'lunas' ? '✓ LUNAS' : 'BELUM DIBAYAR'}
                      </button>
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {/* Cetak Slip Kwitansi (Bisa diakses siapa saja baik Client maupun Admin) */}
                        <button
                          type="button"
                          onClick={() => onPrint(item)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Cetak Slip Kwitansi & Rincian Pembagi Upah"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Edit Data */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isAdmin) {
                              onEdit(item);
                            } else {
                              onPromptLogin();
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isAdmin
                              ? 'text-slate-500 hover:text-blue-700 hover:bg-blue-50'
                              : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                          }`}
                          title={isAdmin ? 'Edit Data & Nama Pembungkar' : 'Hanya Admin yang dapat mengedit (Klik untuk Login)'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Hapus Data */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isAdmin) {
                              if (confirm(`Hapus data bungkaran ${item.packagingCode}?`)) {
                                onDelete(item.id);
                              }
                            } else {
                              onPromptLogin();
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isAdmin
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                          }`}
                          title={isAdmin ? 'Hapus Data Bungkaran' : 'Hanya Admin yang dapat menghapus (Klik untuk Login)'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
