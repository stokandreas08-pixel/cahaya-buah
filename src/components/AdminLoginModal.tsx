import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';
import { loginAsAdmin, AdminUser } from '../services/authService';

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
  // Input default kosong bersih
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pastikan form selalu kosong saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setErrorMsg('');
      setIsLoading(false);
    }
  }, [isOpen]);

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Autentikasi Admin Keuangan</h2>
              <p className="text-[11px] text-slate-500">Kantor Administrasi & Gudang Cahaya Buah</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs" autoComplete="off">
          {/* Info Banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-700 leading-relaxed">
              <p>
                Masuk sebagai <strong>Admin Keuangan Cahaya Buah</strong> untuk hak akses pencatatan, pengubahan tarif, dan verifikasi status pembayaran.
              </p>
              <p className="text-[10px] text-slate-500 pt-0.5">
                Masukkan email dan kata sandi resmi administrator kantor.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-medium">{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Email Administrator
            </label>
            <input
              id="admin-email-input"
              name="admin_account_email"
              type="email"
              autoComplete="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email admin..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Kata Sandi (Password)
            </label>
            <input
              id="admin-password-input"
              name="admin_account_password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-200 text-slate-900"
            />
          </div>

          {/* Catatan verifikasi */}
          <div className="pt-0.5">
            <p className="text-[11px] text-slate-500 text-center bg-slate-50 py-1.5 px-2.5 rounded-xl border border-slate-200">
              Input harus sesuai dengan kredensial resmi kantor keuangan.
            </p>
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
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk sebagai Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
