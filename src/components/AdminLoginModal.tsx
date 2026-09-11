import React, { useState } from 'react';
import { X, Lock, ShieldCheck, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import { loginAsAdmin, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, AdminUser } from '../services/authService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const user = await loginAsAdmin(email, password);
      setIsLoading(false);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Gagal login sebagai admin. Periksa kembali email dan password.');
    }
  };

  const handleFillDefault = () => {
    setEmail(DEFAULT_ADMIN_EMAIL);
    setPassword(DEFAULT_ADMIN_PASSWORD);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Lock className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Login Administrator</h2>
              <p className="text-[11px] text-slate-500">Kelola bungkaran buah & hak akses penuh</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Info Banner */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-950 leading-relaxed">
              Sebagai <strong>Admin</strong>, setiap penambahan, perubahan, atau penghapusan bungkaran akan <strong>langsung ter-update otomatis secara real-time</strong> di layar semua klien & pekerja tanpa perlu refresh.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-medium">{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Email Admin
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gudang.com"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Kata Sandi (Password)
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Quick preset button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleFillDefault}
              className="w-full py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-slate-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Gunakan Akun Default (admin@gudang.com / admin123456)</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-xs"
            >
              Batal
            </button>
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk sebagai Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
