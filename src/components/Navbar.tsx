import React from 'react';
import { Truck, Plus, FileSpreadsheet, Users, ShieldCheck, LogIn, LogOut, Package, ShoppingBag, Settings } from 'lucide-react';
import { AdminUser } from '../services/authService';

export type MainTab = 'bungkaran' | 'pesanan_peti';

export interface NavbarProps {
  activeTab: MainTab;
  onSelectTab?: (tab: MainTab) => void;
  onTabChange?: (tab: MainTab) => void;
  onOpenNew?: () => void;
  onOpenWorkerSummary?: () => void;
  onExportCSV?: () => void;
  onExport?: () => void;
  totalRecords: number;
  totalFruitOrders: number;
  isAdmin: boolean;
  adminUser: AdminUser | null;
  onOpenLogin?: () => void;
  onLoginClick?: () => void;
  onLogout?: () => void;
  onLogoutClick?: () => void;
  onOpenAdminSettings?: () => void;
  isRealtimeConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onTabChange,
  onOpenNew,
  onOpenWorkerSummary,
  onExportCSV,
  onExport,
  totalRecords,
  totalFruitOrders,
  isAdmin,
  adminUser,
  onOpenLogin,
  onLoginClick,
  onLogout,
  onLogoutClick,
  onOpenAdminSettings,
  isRealtimeConnected,
}) => {
  const switchTab = (tab: MainTab) => {
    if (onSelectTab) onSelectTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const handleExport = () => {
    if (onExportCSV) onExportCSV();
    else if (onExport) onExport();
  };

  const handleLogin = () => {
    if (onOpenLogin) onOpenLogin();
    else if (onLoginClick) onLoginClick();
  };

  const handleLogoutAction = () => {
    if (onLogout) onLogout();
    else if (onLogoutClick) onLogoutClick();
  };
  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Corporate Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shadow-sm shrink-0 border border-slate-800">
              <span className="text-amber-400 text-sm font-mono font-black tracking-tighter">CB</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black tracking-wider uppercase text-slate-900 font-mono">
                  CAHAYA BUAH
                </span>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <h1 className="text-xs sm:text-sm font-semibold text-slate-700 leading-tight">
                  Administrasi & Keuangan
                </h1>
                {/* Live Real-time badge */}
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                    isRealtimeConnected
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                  title={isRealtimeConnected ? 'Terhubung langsung ke Firestore Cloud' : 'Menghubungkan...'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="hidden md:inline">{isRealtimeConnected ? 'Cloud Aktif' : 'Offline'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {activeTab === 'bungkaran'
                  ? 'Buku Besar Bungkaran & Alokasi Upah Otomatis (Default Rp 600.000 / Mobil)'
                  : 'Buku Registrasi Pesanan Buah Distribusi Per Peti (Urutan No. Order Resmi)'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {activeTab === 'bungkaran' && (
              <button
                id="btn-worker-summary"
                type="button"
                onClick={onOpenWorkerSummary}
                className="hidden md:inline-flex px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg items-center space-x-1.5 transition-colors cursor-pointer"
                title="Lihat rekap upah masing-masing pembungkar"
              >
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span>Rekap Kasir</span>
              </button>
            )}

            <button
              id="btn-export-csv"
              type="button"
              onClick={handleExport}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Unduh data ke format Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Ekspor Excel</span>
            </button>

            {/* Admin vs Client Authentication Status (Desktop only, mobile uses bottom navigation) */}
            {isAdmin ? (
              <div className="hidden md:flex items-center space-x-1.5 pl-1">
                <button
                  id="btn-admin-profile-settings"
                  type="button"
                  onClick={onOpenAdminSettings}
                  className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-semibold border border-emerald-200 transition-all cursor-pointer shadow-2xs group"
                  title="Klik untuk Pengaturan Profil, Foto & Password Admin"
                >
                  {adminUser?.avatarUrl ? (
                    <img
                      src={adminUser.avatarUrl}
                      alt="Foto Admin"
                      className="w-5 h-5 rounded-full object-cover border border-emerald-400"
                    />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>Admin:</span>
                  <span className="truncate max-w-[110px] font-bold text-slate-800">
                    {adminUser?.name || 'Admin Keuangan'}
                  </span>
                  <Settings className="w-3 h-3 text-emerald-700 group-hover:rotate-45 transition-transform" />
                </button>
                <button
                  id="btn-admin-logout"
                  type="button"
                  onClick={handleLogoutAction}
                  className="p-1.5 sm:px-2.5 sm:py-1 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center space-x-1 transition-colors cursor-pointer"
                  title="Keluar dari mode admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <button
                id="btn-admin-login-open"
                type="button"
                onClick={handleLogin}
                className="hidden md:inline-flex px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Masuk sebagai Administrator Keuangan (cahayabuah@gmail.com)"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-600" />
                <span>Login Admin</span>
              </button>
            )}

            {/* Action button based on active tab (Desktop only, mobile uses bottom center (+) button) */}
            <button
              id="btn-add-record"
              type="button"
              onClick={() => onOpenNew?.()}
              className={`hidden md:inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg items-center space-x-1.5 shadow-2xs transition-all cursor-pointer ${
                isAdmin
                  ? 'text-white bg-slate-900 hover:bg-slate-800 border border-slate-900'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200'
              }`}
              title={
                isAdmin
                  ? activeTab === 'bungkaran'
                    ? 'Catat bungkaran mobil baru'
                    : 'Buat pesanan buah peti baru'
                  : 'Hanya Admin yang dapat menambah data (Klik untuk Login)'
              }
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>
                {activeTab === 'bungkaran' ? '+ Catat Mobil' : '+ Form Pesanan'}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar - Formal Office Ledger Style */}
        <div className="flex space-x-2 border-t border-slate-100 py-1.5">
          <button
            id="nav-tab-bungkaran"
            type="button"
            onClick={() => switchTab('bungkaran')}
            className={`flex items-center space-x-2 py-1.5 px-3.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'bungkaran'
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Buku Bongkar Mobil & Upah</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                activeTab === 'bungkaran'
                  ? 'bg-slate-800 text-amber-300'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {totalRecords}
            </span>
          </button>

          <button
            id="nav-tab-pesanan-peti"
            type="button"
            onClick={() => switchTab('pesanan_peti')}
            className={`flex items-center space-x-2 py-1.5 px-3.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'pesanan_peti'
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Buku Pesanan Buah (Per Peti)</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                activeTab === 'pesanan_peti'
                  ? 'bg-slate-800 text-amber-300'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {totalFruitOrders}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

