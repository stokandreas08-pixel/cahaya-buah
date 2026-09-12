import React, { useState, useMemo } from 'react';
import { 
  Search, 
  RefreshCw, 
  MapPin, 
  Laptop, 
  Smartphone, 
  Clock, 
  User, 
  FileSpreadsheet, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ShieldCheck,
  Activity,
  Globe,
  Filter
} from 'lucide-react';
import { UserLog } from '../types';

interface UserLogsTableProps {
  logs: UserLog[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onClearLogs?: () => void;
}

const ITEMS_PER_PAGE = 20;

export const UserLogsTable: React.FC<UserLogsTableProps> = ({
  logs,
  isLoading = false,
  onRefresh,
  onClearLogs,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<'all' | 'bungkaran' | 'pesanan' | 'auth' | 'print'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmClear, setConfirmClear] = useState(false);

  // Filter logs based on search query (nama_pengguna, user_id, aktivitas, ip_address, lokasi)
  const filteredLogs = useMemo(() => {
    let list = logs;

    if (activityFilter !== 'all') {
      list = list.filter((log) => {
        const act = (log.aktivitas || '').toLowerCase();
        if (activityFilter === 'bungkaran') return act.includes('bungkar') || act.includes('mobil') || act.includes('koli');
        if (activityFilter === 'pesanan') return act.includes('pesan') || act.includes('peti') || act.includes('ord-');
        if (activityFilter === 'auth') return act.includes('login') || act.includes('admin') || act.includes('logout') || act.includes('sandi');
        if (activityFilter === 'print') return act.includes('cetak') || act.includes('slip') || act.includes('nota') || act.includes('surat jalan');
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((log) => {
        return (
          (log.nama_pengguna && log.nama_pengguna.toLowerCase().includes(q)) ||
          (log.user_id && log.user_id.toLowerCase().includes(q)) ||
          (log.aktivitas && log.aktivitas.toLowerCase().includes(q)) ||
          (log.ip_address && log.ip_address.toLowerCase().includes(q)) ||
          (log.lokasi && log.lokasi.toLowerCase().includes(q)) ||
          (log.perangkat && log.perangkat.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [logs, searchQuery, activityFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Format date helper
  const formatTimestamp = (tsStr: string): { date: string; time: string } => {
    try {
      const d = new Date(tsStr);
      if (isNaN(d.getTime())) return { date: tsStr, time: '' };
      return {
        date: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    } catch {
      return { date: tsStr, time: '' };
    }
  };

  // Activity Badge Styling
  const getActivityBadge = (actText: string) => {
    const text = actText || '';
    const lower = text.toLowerCase();

    if (lower.includes('login') || lower.includes('admin')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    }
    if (lower.includes('pesanan') || lower.includes('peti') || lower.includes('ord-')) {
      return {
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        dot: 'bg-blue-500',
      };
    }
    if (lower.includes('bungkar') || lower.includes('mobil')) {
      return {
        bg: 'bg-amber-50 text-amber-900 border-amber-200',
        dot: 'bg-amber-500',
      };
    }
    if (lower.includes('cetak') || lower.includes('slip') || lower.includes('nota')) {
      return {
        bg: 'bg-purple-50 text-purple-800 border-purple-200',
        dot: 'bg-purple-500',
      };
    }
    if (lower.includes('logout') || lower.includes('hapus')) {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-500',
      };
    }
    return {
      bg: 'bg-slate-100 text-slate-800 border-slate-200',
      dot: 'bg-slate-400',
    };
  };

  // Device icon helper
  const getDeviceIcon = (deviceStr: string) => {
    const d = (deviceStr || '').toLowerCase();
    if (d.includes('mobile') || d.includes('android') || d.includes('ios') || d.includes('iphone')) {
      return <Smartphone className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    }
    return <Laptop className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
  };

  // Export filtered logs to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['Timestamp', 'User ID', 'Nama Pengguna', 'Aktivitas', 'IP Address', 'Lokasi', 'Perangkat'];
    const rows = filteredLogs.map((log) => [
      `"${log.timestamp || ''}"`,
      `"${log.user_id || ''}"`,
      `"${(log.nama_pengguna || '').replace(/"/g, '""')}"`,
      `"${(log.aktivitas || '').replace(/"/g, '""')}"`,
      `"${log.ip_address || ''}"`,
      `"${(log.lokasi || '').replace(/"/g, '""')}"`,
      `"${(log.perangkat || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `log_aktivitas_pengguna_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {/* Overview Statistics Banner - Compact & Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2.5">
        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200 flex items-center space-x-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">Total Log</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{logs.length}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200 flex items-center space-x-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">Pengguna</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {new Set(logs.map(l => l.user_id)).size} Akun
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200 flex items-center space-x-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">IP Unik</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {new Set(logs.map(l => l.ip_address)).size} IP
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200 flex items-center space-x-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider truncate">Hari Ini</p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {logs.filter(l => (l.timestamp || '').slice(0, 10) === new Date().toISOString().slice(0, 10)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar: Search, Category Filters, and Utility Buttons */}
      <div className="flex flex-col gap-2">
        {/* Search input (Requirement: "Pencarian berdasarkan nama pengguna") */}
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-user-logs"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama, user ID, aktivitas, atau IP..."
            className="w-full pl-8 sm:pl-9 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills and Buttons - Wrapped and balanced for mobile screens */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          {/* Category Filter Pills */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-[10px] sm:text-[11px] font-semibold shrink-0">
            <button
              type="button"
              onClick={() => { setActivityFilter('all'); setCurrentPage(1); }}
              className={`px-1.5 sm:px-2 py-1 rounded-md transition-all cursor-pointer ${
                activityFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => { setActivityFilter('pesanan'); setCurrentPage(1); }}
              className={`px-1.5 sm:px-2 py-1 rounded-md transition-all cursor-pointer ${
                activityFilter === 'pesanan' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pesanan
            </button>
            <button
              type="button"
              onClick={() => { setActivityFilter('bungkaran'); setCurrentPage(1); }}
              className={`px-1.5 sm:px-2 py-1 rounded-md transition-all cursor-pointer ${
                activityFilter === 'bungkaran' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bungkaran
            </button>
            <button
              type="button"
              onClick={() => { setActivityFilter('auth'); setCurrentPage(1); }}
              className={`px-1.5 sm:px-2 py-1 rounded-md transition-all cursor-pointer ${
                activityFilter === 'auth' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sesi
            </button>
          </div>

          {/* Action Buttons: Export, Refresh, Clear */}
          <div className="flex items-center space-x-1 shrink-0 ml-auto">
            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className="px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
              title="Ekspor data log ke format Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Ekspor CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>

            {/* Refresh */}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Perbarui data log"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Clear Logs */}
            {onClearLogs && (
              confirmClear ? (
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-1.5 py-1 text-[10px] text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmClear(false);
                      onClearLogs();
                    }}
                    className="px-1.5 py-1 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="p-1 sm:p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  title="Hapus riwayat log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Logs Container: Mobile Cards (sm:hidden) + Desktop Table (hidden sm:block) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {/* MOBILE CARD VIEW (Optimized for phones: fits 100% width, no horizontal scroll) */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {currentLogs.length === 0 ? (
            <div className="py-10 text-center text-slate-400 px-4">
              <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-xs text-slate-600">Tidak ada log aktivitas</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {searchQuery ? 'Coba ubah kata kunci pencarian.' : 'Aktivitas pengguna akan otomatis tercatat di sini.'}
              </p>
            </div>
          ) : (
            currentLogs.map((log, idx) => {
              const badge = getActivityBadge(log.aktivitas);
              const timeObj = formatTimestamp(log.timestamp);
              const isAdminUser = (log.nama_pengguna || '').toLowerCase().includes('admin');

              return (
                <div key={log.id || idx} className="p-3 hover:bg-slate-50/70 transition-colors space-y-1.5">
                  {/* Top Line: User & Time */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      {isAdminUser ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className={`text-xs font-semibold truncate ${isAdminUser ? 'text-emerald-900 font-bold' : 'text-slate-800'}`}>
                        {log.nama_pengguna || 'Klien (Tamu)'}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-[10px] font-bold text-slate-700 block">
                        {timeObj.time || '-'}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-sans">
                        {timeObj.date}
                      </span>
                    </div>
                  </div>

                  {/* Middle Line: Activity Badge */}
                  <div>
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      <span>{log.aktivitas}</span>
                    </span>
                    {log.metadata?.notes && (
                      <p className="text-[10px] text-slate-500 mt-0.5 italic pl-1">
                        {log.metadata.notes}
                      </p>
                    )}
                  </div>

                  {/* Bottom Line: Location, IP, Device, and User ID */}
                  <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 pt-1 border-t border-slate-50">
                    <div className="flex items-center space-x-1 truncate max-w-[55%]">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="truncate">{log.lokasi || 'Indonesia'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className="font-mono text-[9px] text-slate-400">{log.ip_address || '127.0.0.1'}</span>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center space-x-0.5 text-slate-600" title={log.perangkat}>
                        {getDeviceIcon(log.perangkat)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DESKTOP TABLE VIEW (Shown on tablet and desktop screens >= sm) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 w-36">Waktu & Tanggal</th>
                <th className="py-2.5 px-3 min-w-[140px]">Nama Pengguna</th>
                <th className="py-2.5 px-3 min-w-[180px]">Aktivitas</th>
                <th className="py-2.5 px-3 min-w-[130px]">IP & Lokasi</th>
                <th className="py-2.5 px-3 min-w-[140px]">Perangkat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-sm text-slate-600">Tidak ada data log yang sesuai</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchQuery ? 'Coba ubah kata kunci pencarian nama pengguna.' : 'Aktivitas pengguna akan otomatis tercatat di sini.'}
                    </p>
                  </td>
                </tr>
              ) : (
                currentLogs.map((log, idx) => {
                  const badge = getActivityBadge(log.aktivitas);
                  const timeObj = formatTimestamp(log.timestamp);
                  const isEven = idx % 2 === 0;
                  const isAdminUser = (log.nama_pengguna || '').toLowerCase().includes('admin');

                  return (
                    <tr
                      key={log.id || idx}
                      className={`hover:bg-slate-50 transition-colors ${
                        isEven ? 'bg-white' : 'bg-slate-50/40'
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-2 px-3 align-top whitespace-nowrap">
                        <div className="font-mono text-[11px] font-semibold text-slate-800">
                          {timeObj.time || '-'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {timeObj.date}
                        </div>
                      </td>

                      {/* Nama Pengguna & User ID */}
                      <td className="py-2 px-3 align-top">
                        <div className="flex items-center space-x-1.5">
                          {isAdminUser ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className={`font-semibold truncate max-w-[130px] ${isAdminUser ? 'text-emerald-900 font-bold' : 'text-slate-800'}`}>
                            {log.nama_pengguna || 'Klien (Tamu)'}
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 pl-5">
                          ID: {log.user_id || '-'}
                        </div>
                      </td>

                      {/* Aktivitas */}
                      <td className="py-2 px-3 align-top">
                        <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          <span>{log.aktivitas}</span>
                        </span>
                        {log.metadata?.notes && (
                          <div className="text-[10px] text-slate-500 mt-0.5 italic pl-1">
                            {log.metadata.notes}
                          </div>
                        )}
                      </td>

                      {/* IP & Lokasi */}
                      <td className="py-2 px-3 align-top">
                        <div className="font-mono text-[11px] text-slate-700 font-medium">
                          {log.ip_address || '127.0.0.1'}
                        </div>
                        <div className="flex items-center space-x-1 text-[10px] text-slate-500 truncate max-w-[150px]" title={log.lokasi}>
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span className="truncate">{log.lokasi || 'Indonesia'}</span>
                        </div>
                      </td>

                      {/* Perangkat */}
                      <td className="py-2 px-3 align-top">
                        <div className="flex items-center space-x-1.5 text-slate-700 text-[11px]">
                          {getDeviceIcon(log.perangkat)}
                          <span className="truncate max-w-[160px]" title={log.perangkat}>
                            {log.perangkat || 'Peramban Web'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section (Requirement: "Paginasi (maksimal 20 baris per halaman agar tidak lemot)") */}
        <div className="py-2 px-3 sm:px-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-xs">
          <div className="text-slate-500 text-[10px] sm:text-[11px] text-center sm:text-left">
            Menampilkan <span className="font-bold text-slate-800">{filteredLogs.length > 0 ? startIndex + 1 : 0}</span> - <span className="font-bold text-slate-800">{Math.min(startIndex + ITEMS_PER_PAGE, filteredLogs.length)}</span> dari <span className="font-bold text-slate-800">{filteredLogs.length}</span> log
            {filteredLogs.length !== logs.length && ` (dari ${logs.length})`}
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-[10px] sm:text-[11px] text-slate-600 mr-1 sm:mr-2 font-medium">
              Hal. {safePage} / {totalPages}
            </span>

            {/* First Page */}
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(1)}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-700"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* Previous Page */}
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-1.5 sm:px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center space-x-1 text-slate-700 font-medium text-[11px]"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            {/* Next Page */}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-1.5 sm:px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center space-x-1 text-slate-700 font-medium text-[11px]"
              title="Halaman Berikutnya"
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-700"
              title="Halaman Terakhir"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
