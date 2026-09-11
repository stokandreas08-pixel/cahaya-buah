import React, { useState, useEffect } from 'react';
import { X, Check, Users } from 'lucide-react';
import { CarUnloadingRecord, PaymentStatus } from '../types';
import { formatRupiah } from '../utils/formatters';

interface EditModalProps {
  record: CarUnloadingRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: CarUnloadingRecord) => void;
}

export const EditModal: React.FC<EditModalProps> = ({
  record,
  isOpen,
  onClose,
  onSave,
}) => {
  const [packagingCode, setPackagingCode] = useState('');
  const [packageCount, setPackageCount] = useState<number>(0);
  const [wagePerCar, setWagePerCar] = useState<number>(0);
  const [workerNames, setWorkerNames] = useState<string[]>([]);
  const [newWorkerInput, setNewWorkerInput] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('lunas');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (record) {
      setPackagingCode(record.packagingCode);
      setPackageCount(record.packageCount);
      setWagePerCar(record.wagePerCar);
      setWorkerNames(record.workerNames || []);
      setPaymentStatus(record.paymentStatus);
      setDate(record.date);
      setTime(record.time);
      setNotes(record.notes || '');
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const handleAddWorker = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (workerNames.some(w => w.toLowerCase() === trimmed.toLowerCase())) return;
    setWorkerNames(prev => [...prev, trimmed]);
    setNewWorkerInput('');
  };

  const handleRemoveWorker = (name: string) => {
    setWorkerNames(prev => prev.filter(w => w !== name));
  };

  const workerCount = Math.max(1, workerNames.length);
  const calculatedWagePerWorker = Math.round((wagePerCar || 0) / workerCount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWorkers = workerNames.length > 0 ? workerNames : ['Umum'];
    const updated: CarUnloadingRecord = {
      ...record,
      packagingCode: packagingCode.toLowerCase().trim(),
      packageCount: Math.max(1, Number(packageCount) || 1),
      wagePerCar: Math.max(0, Number(wagePerCar) || 0),
      workerNames: finalWorkers,
      wagePerWorker: Math.round((Number(wagePerCar) || 0) / finalWorkers.length),
      paymentStatus,
      date,
      time,
      notes: notes.trim() || undefined,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Edit Data Pembongkaran & Nama Pembungkar
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Kode Bungkaran (misal: jeruk gina 01)
            </label>
            <input
              type="text"
              required
              value={packagingCode}
              onChange={e => setPackagingCode(e.target.value)}
              className="w-full px-3 py-2 text-sm font-bold text-emerald-800 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jumlah Bungkaran (Koli)
              </label>
              <input
                type="number"
                min="1"
                required
                value={packageCount}
                onChange={e => setPackageCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Total Upah Per Mobil (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                required
                value={wagePerCar}
                onChange={e => setWagePerCar(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-black text-emerald-800 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* EDIT NAMA-NAMA PEMBUNGKAR & PREVIEW TERBAGI */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Nama-Nama Pembungkar ({workerNames.length} orang)</span>
              </span>
              <span className="text-xs font-black text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                Terbagi: {formatRupiah(calculatedWagePerWorker)} / orang
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {workerNames.map(name => (
                <span
                  key={name}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900"
                >
                  <span>{name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWorker(name)}
                    className="text-slate-400 hover:text-rose-600 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-1">
              <input
                type="text"
                placeholder="+ Tambah nama..."
                value={newWorkerInput}
                onChange={e => setNewWorkerInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddWorker(newWorkerInput);
                  }
                }}
                className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleAddWorker(newWorkerInput)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
              >
                Tambah
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Status Pembayaran Upah
              </label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
                className={`w-full px-3 py-2 text-xs font-bold rounded-xl border ${
                  paymentStatus === 'lunas'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                <option value="lunas">LUNAS</option>
                <option value="belum_dibayar">BELUM DIBAYAR</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">
                Catatan (opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Catatan..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
