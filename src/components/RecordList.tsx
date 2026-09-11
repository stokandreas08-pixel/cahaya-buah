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
      <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-records"
            type="text"
            placeholder="Cari kode atau nama pembungkar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 sm:py-1.5 text-sm sm:text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {/* Filter Nama Pembungkar */}
          <select
            id="filter-worker"
            value={selectedWorkerFilter}
            onChange={e => setSelectedWorkerFilter(e.target.value)}
            className="flex-1 sm:flex-none px-2.5 py-2 sm:py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">Semua Pembungkar</option>
            {distinctWorkers.map(w => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          {/* Filter Kode */}
          <select
            id="filter-code"
            value={selectedCodeFilter}
            onChange={e => setSelectedCodeFilter(e.target.value)}
            className="flex-1 sm:flex-none px-2.5 py-2 sm:py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">Semua Kode</option>
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
            className="w-full sm:w-auto px-2.5 py-2 sm:py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">Semua Status Upah</option>
            <option value="lunas">Upah: Lunas</option>
            <option value="belum_dibayar">Upah: Belum Dibayar</option>
          </select>
        </div>
      </div>

      {/* Responsive View: Cards for Mobile, Table for Desktop */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs">
          Tidak ada data bungkaran yang cocok dengan pencarian.
        </div>
      ) : (
        <>
          {/* 1. Mobile Cards View (md:hidden) */}
          <div className="p-3 space-y-3 md:hidden bg-slate-50/50">
            {filtered.map(item => {
              const workers = item.workerNames && item.workerNames.length > 0
                ? item.workerNames
                : ['Umum'];
              const count = workers.length;
              const wagePerPerson = item.wagePerWorker || Math.round(item.wagePerCar / count);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3"
                >
                  {/* Card Header: Code, Date & Status */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-sm">
                        {item.packagingCode}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        {formatDateIndo(item.date)} • {item.time} WIB
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isAdmin) {
                          onToggleStatus(item.id);
                        } else {
                          onPromptLogin();
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${
                        item.paymentStatus === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                      title={isAdmin ? 'Ubah status upah' : 'Login admin untuk ubah status'}
                    >
                      {item.paymentStatus === 'lunas' ? '✓ LUNAS' : 'BELUM DIBAYAR'}
                    </button>
                  </div>

                  {/* Body: Package count & Upah */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/70">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Jumlah Bungkaran
                      </span>
                      <div className="flex items-baseline space-x-1 mt-0.5">
                        <span className="text-lg font-black text-slate-900">
                          {formatNumber(item.packageCount)}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">koli</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Upah Per Orang
                      </span>
                      <span className="text-base font-black text-emerald-700 block mt-0.5">
                        {formatRupiah(wagePerPerson)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Total: {formatRupiah(item.wagePerCar)}
                      </span>
                    </div>
                  </div>

                  {/* Workers List Chips */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Pembungkar ({count} Orang):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {workers.map(w => (
                        <span
                          key={w}
                          className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md text-xs font-semibold border border-slate-200"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-2">
                        &quot;{item.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Action Buttons (Min 42-44px touch targets) */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onPrint(item)}
                      className="min-h-[42px] px-2 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-slate-200"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      <span>Kwitansi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isAdmin) {
                          onEdit(item);
                        } else {
                          onPromptLogin();
                        }
                      }}
                      className="min-h-[42px] px-2 py-2 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-blue-200"
                    >
                      <Edit2 className="w-4 h-4 text-blue-700" />
                      <span>Edit</span>
                    </button>

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
                      className={`min-h-[42px] px-2 py-2 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border ${
                        isAdmin
                          ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border-rose-200'
                          : 'text-slate-400 bg-slate-50 border-slate-200'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Desktop Table View (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
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
                          {/* Cetak Slip Kwitansi */}
                          <button
                            type="button"
                            onClick={() => onPrint(item)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
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
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
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
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
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
        </>
      )}
    </div>
  );
};
