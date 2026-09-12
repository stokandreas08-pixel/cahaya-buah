import React from 'react';
import { Truck, ShoppingBag, Plus, Users, Boxes, ShieldCheck, LogIn } from 'lucide-react';
import { MainTab } from '../types';
import { AdminUser } from '../services/authService';

interface MobileBottomNavProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  onOpenNew: () => void;
  onOpenWorkerSummary: () => void;
  onOpenStockManager: () => void;
  isAdmin: boolean;
  adminUser?: AdminUser | null;
  onOpenLogin: () => void;
  onOpenAdminSettings?: () => void;
  totalRecords: number;
  totalFruitOrders: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenNew,
  onOpenWorkerSummary,
  onOpenStockManager,
  isAdmin,
  adminUser,
  onOpenLogin,
  onOpenAdminSettings,
  totalRecords,
  totalFruitOrders,
}) => {
  return (
    <nav
      id="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden shadow-lg pb-safe"
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto">
        {/* Tab 1: Bongkar Mobil */}
        <button
          id="mobile-nav-bungkaran"
          type="button"
          onClick={() => onSelectTab('bungkaran')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'bungkaran'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Truck className={`w-5 h-5 ${activeTab === 'bungkaran' ? 'stroke-[2.5]' : ''}`} />
            {totalRecords > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                {totalRecords}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Bongkar</span>
        </button>

        {/* Tab 2: Pesanan Buah */}
        <button
          id="mobile-nav-pesanan"
          type="button"
          onClick={() => onSelectTab('pesanan_peti')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'pesanan_peti'
              ? 'text-amber-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${activeTab === 'pesanan_peti' ? 'stroke-[2.5]' : ''}`} />
            {totalFruitOrders > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                {totalFruitOrders}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Pesanan</span>
        </button>

        {/* Center Quick Action: + Tambah */}
        <div className="px-1 flex items-center justify-center">
          <button
            id="mobile-nav-add-btn"
            type="button"
            onClick={onOpenNew}
            className={`w-11 h-11 rounded-full text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer ${
              activeTab === 'bungkaran'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
            title={activeTab === 'bungkaran' ? 'Catat Mobil Baru' : 'Buat Pesanan Peti Baru'}
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Contextual Action: Rekap Upah (if bungkaran) OR Stok Gudang (if pesanan) */}
        {activeTab === 'bungkaran' ? (
          <button
            id="mobile-nav-worker-summary"
            type="button"
            onClick={onOpenWorkerSummary}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Lihat rekap upah pembungkar"
          >
            <Users className="w-5 h-5 text-emerald-700" />
            <span className="text-[10px] mt-1 tracking-tight">Rekap Upah</span>
          </button>
        ) : (
          <button
            id="mobile-nav-stock-manager"
            type="button"
            onClick={onOpenStockManager}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Kelola stok peti gudang"
          >
            <Boxes className="w-5 h-5 text-amber-700" />
            <span className="text-[10px] mt-1 tracking-tight">Stok Peti</span>
          </button>
        )}

        {/* Profile / Admin Login / Settings */}
        <button
          id="mobile-nav-admin-btn"
          type="button"
          onClick={isAdmin && onOpenAdminSettings ? onOpenAdminSettings : onOpenLogin}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors cursor-pointer ${
            isAdmin ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          title={isAdmin ? 'Buka Pengaturan Akun Admin (Password & Foto)' : 'Login Admin'}
        >
          {isAdmin ? (
            adminUser?.avatarUrl ? (
              <img
                src={adminUser.avatarUrl}
                alt="Admin Avatar"
                className="w-5 h-5 rounded-full object-cover border border-emerald-400"
              />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            )
          ) : (
            <LogIn className="w-5 h-5 text-slate-500" />
          )}
          <span className="text-[10px] mt-1 tracking-tight">
            {isAdmin ? (adminUser?.name?.split(' ')[0] || 'Admin') : 'Login'}
          </span>
        </button>
      </div>
    </nav>
  );
};
