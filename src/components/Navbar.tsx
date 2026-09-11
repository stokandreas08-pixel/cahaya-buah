import React from 'react';
import { Truck, Plus, FileSpreadsheet, Users, ShieldCheck, LogIn, LogOut, Package, ShoppingBag } from 'lucide-react';
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Judul */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              {activeTab === 'bungkaran' ? (
                <Truck className="w-5 h-5" />
              ) : (
                <ShoppingBag className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {activeTab === 'bungkaran' ? 'Data Bungkaran & Upah' : 'Pesanan Buah Per Peti'}
                </h1>
                {/* Live Real-time badge */}
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isRealtimeConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                  title={isRealtimeConnected ? 'Terhubung langsung ke Firestore Cloud' : 'Menghubungkan...'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="hidden md:inline">{isRealtimeConnected ? 'Live Real-Time' : 'Offline Mode'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {activeTab === 'bungkaran'
                  ? 'Pencatatan kode bungkaran & otomatis upah terbagi per pembungkar'
                  : 'Hitung pesanan per peti: Jeruk Gina, Jeruk Faisal (AB, C, DTOP, DR, DK), Salak, & Naga (A, B)'}
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
                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Lihat rekap upah masing-masing pembungkar"
              >
                <Users className="w-4 h-4 text-emerald-700" />
                <span className="hidden md:inline">Rekap Upah</span>
              </button>
            )}

            <button
              id="btn-export-csv"
              type="button"
              onClick={handleExport}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Unduh data ke format Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span className="hidden md:inline">Ekspor</span>
            </button>

            {/* Admin vs Client Authentication Status */}
            {isAdmin ? (
              <div className="flex items-center space-x-1.5 pl-1">
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">Admin:</span>
                  <span className="truncate max-w-[100px]">{adminUser?.name || 'Admin'}</span>
                </span>
                <button
                  id="btn-admin-logout"
                  type="button"
                  onClick={handleLogoutAction}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center space-x-1 transition-colors cursor-pointer"
                  title="Keluar dari mode admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                id="btn-admin-login-open"
                type="button"
                onClick={handleLogin}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Masuk sebagai Administrator"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                <span>Login Admin</span>
              </button>
            )}

            {/* Action button based on active tab */}
            <button
              id="btn-add-record"
              type="button"
              onClick={() => onOpenNew?.()}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer ${
                activeTab === 'bungkaran'
                  ? isAdmin
                    ? 'text-white bg-emerald-600 hover:bg-emerald-700'
                    : 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                  : 'text-white bg-amber-600 hover:bg-amber-700'
              }`}
              title={
                activeTab === 'bungkaran'
                  ? isAdmin
                    ? 'Tambah data bungkaran baru'
                    : 'Hanya Admin yang dapat menginput bungkaran baru'
                  : 'Buat pesanan buah peti baru'
              }
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">
                {activeTab === 'bungkaran' ? '+ Catat Mobil' : '+ Pesan Peti'}
              </span>
              <span className="sm:hidden">
                {activeTab === 'bungkaran' ? '+ Catat' : '+ Pesan'}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex space-x-1 border-t border-slate-100 pt-1 pb-1">
          <button
            id="nav-tab-bungkaran"
            type="button"
            onClick={() => switchTab('bungkaran')}
            className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bungkaran'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Bongkar Mobil & Upah</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'bungkaran'
                  ? 'bg-emerald-700 text-emerald-100'
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
            className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pesanan_peti'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Pesanan Buah (Per Peti)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'pesanan_peti'
                  ? 'bg-amber-700 text-amber-100'
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

