import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  KeyRound, 
  Camera, 
  User, 
  LogOut, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Upload, 
  RefreshCw,
  Sparkles,
  Activity,
  History
} from 'lucide-react';
import { 
  AdminUser, 
  updateAdminPassword, 
  updateAdminProfile, 
  getAdminPassword, 
  DEFAULT_ADMIN_EMAIL 
} from '../services/authService';
import { 
  subscribeToUserLogs, 
  clearAllUserLogs, 
  getCachedUserLogs 
} from '../services/activityLogService';
import { UserLog } from '../types';
import { UserLogsTable } from './UserLogsTable';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser?: AdminUser | null;
  currentUser?: AdminUser | null;
  onProfileUpdated: (updated: AdminUser) => void;
  onLogout: () => void;
  onPasswordChanged?: () => void;
}

// Preset photo options if user wants quick recognizable icons
const AVATAR_PRESETS = [
  {
    id: 'preset-cahaya',
    name: 'Jeruk Cahaya',
    url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-finance',
    name: 'Administrasi',
    url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-manager',
    name: 'Manajer Kantor',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-warehouse',
    name: 'Gudang Buah',
    url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=150&auto=format&fit=crop&q=80',
  },
];

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  adminUser,
  currentUser,
  onProfileUpdated,
  onLogout,
  onPasswordChanged,
}) => {
  const activeUser = adminUser || currentUser || null;
  const [activeTab, setActiveTab] = useState<'profil' | 'password' | 'logs'>('profil');

  // Logs state
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Profile Form state
  const [name, setName] = useState(activeUser?.name || 'Admin Keuangan');
  const [roleTitle, setRoleTitle] = useState(activeUser?.roleTitle || 'Administrator Keuangan & Gudang');
  const [avatarUrl, setAvatarUrl] = useState(activeUser?.avatarUrl || '');
  
  // Password Form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time subscription to user logs when modal is open
  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingLogs(true);
    const unsubscribe = subscribeToUserLogs((newLogs) => {
      setLogs(newLogs);
      setIsLoadingLogs(false);
    });
    return () => unsubscribe();
  }, [isOpen]);

  const handleRefreshLogs = () => {
    setIsLoadingLogs(true);
    const cached = getCachedUserLogs();
    setLogs(cached);
    setTimeout(() => setIsLoadingLogs(false), 250);
  };

  const handleClearLogs = async () => {
    await clearAllUserLogs();
    setLogs([]);
    setSuccessMsg('Semua data log aktivitas berhasil dibersihkan');
  };

  // Synchronize state whenever modal opens or activeUser changes
  useEffect(() => {
    if (isOpen) {
      if (activeUser) {
        setName(activeUser.name || 'Admin Keuangan');
        setRoleTitle(activeUser.roleTitle || 'Administrator Keuangan & Gudang');
        setAvatarUrl(activeUser.avatarUrl || '');
      }
      setShowConfirmLogout(false);
      setErrorMsg('');
      setSuccessMsg('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, activeUser]);

  if (!isOpen) return null;

  // Handle Photo File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (JPG, PNG, atau WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran gambar maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setErrorMsg('');
        setSuccessMsg('Foto profil berhasil dimuat. Klik "Simpan Profil" untuk menerapkan.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSaving(true);

    try {
      const updated = updateAdminProfile({
        name: name.trim() || 'Admin Keuangan',
        roleTitle: roleTitle.trim() || 'Administrator',
        avatarUrl: avatarUrl.trim(),
      });
      onProfileUpdated(updated);
      setSuccessMsg('Profil dan foto admin berhasil disimpan!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui profil');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!oldPassword.trim()) {
      setErrorMsg('Mohon masukkan kata sandi lama');
      return;
    }

    if (newPassword.trim().length < 4) {
      setErrorMsg('Kata sandi baru minimal 4 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    setIsSaving(true);
    try {
      updateAdminPassword(oldPassword, newPassword);
      setSuccessMsg('Kata sandi admin berhasil diubah! Gunakan sandi baru untuk login berikutnya.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onPasswordChanged) onPasswordChanged();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah kata sandi');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div
        className={`bg-white rounded-2xl w-full max-w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] transition-all duration-200 ${
          activeTab === 'logs' ? 'sm:max-w-4xl lg:max-w-5xl' : 'sm:max-w-md'
        }`}
      >
        {/* Header */}
        <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold truncate">
                <span className="sm:hidden">Pengaturan Admin</span>
                <span className="hidden sm:inline">Pengaturan Akun & Log Admin</span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">Cahaya Buah • {DEFAULT_ADMIN_EMAIL}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0 ml-1.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation - Perfectly balanced 3-column grid for mobile & desktop */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-[11px] sm:text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profil');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2.5 sm:py-3 px-1 sm:px-3 text-center border-b-2 flex items-center justify-center space-x-1 sm:space-x-1.5 transition-colors cursor-pointer min-w-0 ${
              activeTab === 'profil'
                ? 'border-slate-900 text-slate-900 bg-white shadow-2xs font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Foto & </span>Profil
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2.5 sm:py-3 px-1 sm:px-3 text-center border-b-2 flex items-center justify-center space-x-1 sm:space-x-1.5 transition-colors cursor-pointer min-w-0 ${
              activeTab === 'password'
                ? 'border-slate-900 text-slate-900 bg-white shadow-2xs font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Ganti </span>Sandi
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('logs');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2.5 sm:py-3 px-1 sm:px-3 text-center border-b-2 flex items-center justify-center space-x-1 sm:space-x-1.5 transition-colors cursor-pointer min-w-0 ${
              activeTab === 'logs'
                ? 'border-slate-900 text-slate-900 bg-white shadow-2xs font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">
              Log<span className="hidden sm:inline"> Aktivitas</span>
            </span>
            {logs.length > 0 && (
              <span className="ml-0.5 sm:ml-1 px-1 sm:px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[9px] sm:text-[10px] font-bold rounded-full shrink-0">
                {logs.length > 99 ? '99+' : logs.length}
              </span>
            )}
          </button>
        </div>

        {/* Alerts */}
        <div className="px-3 sm:px-5 pt-2 sm:pt-3">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Body content */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-3.5 text-xs">
          {activeTab === 'logs' ? (
            <UserLogsTable
              logs={logs}
              isLoading={isLoadingLogs}
              onRefresh={handleRefreshLogs}
              onClearLogs={handleClearLogs}
            />
          ) : activeTab === 'profil' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Section */}
              <div className="flex flex-col items-center justify-center pb-2">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full border-2 border-slate-300 overflow-hidden bg-slate-100 flex items-center justify-center shadow-xs">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Foto Profil Admin"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ShieldCheck className="w-10 h-10 text-emerald-600" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 shadow-md transition-transform active:scale-95 cursor-pointer"
                    title="Unggah Foto Profil Baru"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center space-x-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1 transition-colors cursor-pointer border border-slate-200"
                  >
                    <Upload className="w-3 h-3 text-slate-500" />
                    <span>Pilih Foto</span>
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>

                {/* Preset Avatars */}
                <div className="w-full mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 text-center">
                    Atau Pilih Foto Cepat:
                  </span>
                  <div className="flex items-center justify-center space-x-2">
                    {AVATAR_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(p.url);
                          setSuccessMsg(`Memilih foto ${p.name}`);
                        }}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                          avatarUrl === p.url ? 'border-amber-500 scale-110 shadow-xs' : 'border-slate-200 hover:border-slate-400'
                        }`}
                        title={p.name}
                      >
                        <img
                          src={p.url}
                          alt={p.name}
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile Inputs */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Akun Admin
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={DEFAULT_ADMIN_EMAIL}
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Tampilan Admin
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Admin Keuangan / Kasir"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jabatan / Posisi Kantor
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Administrator Keuangan & Gudang"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 text-slate-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                Ganti kata sandi untuk melindungi akses pencatatan buku besar dan pengubahan status pembayaran bungkaran/pesanan.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi Saat Ini (Lama)
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan sandi saat ini"
                    className="w-full px-3 py-2 pr-10 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full px-3 py-2 pr-10 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 text-slate-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>{isSaving ? 'Memproses...' : 'Perbarui Kata Sandi Admin'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Sesi & Logout Section */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
              <span className="truncate">Sesi Admin Aktif</span>
            </div>

            {showConfirmLogout ? (
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  id="btn-cancel-logout"
                  onClick={() => setShowConfirmLogout(false)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  id="btn-confirm-logout"
                  onClick={() => {
                    setShowConfirmLogout(false);
                    onLogout();
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl flex items-center space-x-1 transition-colors cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Ya, Keluar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-logout-session"
                onClick={() => setShowConfirmLogout(true)}
                className="px-3 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                title="Keluar dari sesi administrator"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Sesi</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
