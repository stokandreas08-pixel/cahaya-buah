import React, { useState } from 'react';
import { Plus, Check, Calculator, Users, X, Radio, Lock, ShieldCheck } from 'lucide-react';
import { CarUnloadingRecord, PaymentStatus } from '../types';
import { formatRupiah } from '../utils/formatters';

// 8 Daftar Pembungkar Tetap Sesuai Permintaan
export const DEFAULT_WORKER_NAMES = [
  'Aldo',
  'Gilang',
  'Eno',
  'Indra',
  'Hen',
  'Marwa',
  'Sudar',
  'Rian',
];

interface SimpleAddFormProps {
  onAdd: (record: CarUnloadingRecord) => void;
  existingCodes?: string[];
  existingWorkers?: string[];
  isAdmin: boolean;
  onPromptLogin: () => void;
}

export const SimpleAddForm: React.FC<SimpleAddFormProps> = ({ 
  onAdd, 
  existingCodes = [],
  existingWorkers = [],
  isAdmin,
  onPromptLogin,
}) => {
  const [packagingCode, setPackagingCode] = useState('');
  const [packageCount, setPackageCount] = useState<string>('100');
  // Default Upah Per Mobil Rp 600.000 sesuai permintaan user
  const [wagePerCar, setWagePerCar] = useState<string>('600000');
  const [workerTeam, setWorkerTeam] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('lunas');
  const [usePerPackageCalc, setUsePerPackageCalc] = useState(false);
  const [ratePerPackage, setRatePerPackage] = useState('2000');

  // List of worker names for this car - default 4 orang awal atau bisa pilih cepat
  const [workerNames, setWorkerNames] = useState<string[]>(['Aldo', 'Gilang', 'Eno', 'Indra']);
  const [newWorkerInput, setNewWorkerInput] = useState('');

  // Saran nama pembungkar: HANYA 8 NAMA SESUAI PERMINTAAN USER
  const defaultWorkerSuggestions = DEFAULT_WORKER_NAMES;

  // If calculating by rate x count
  const handleRateOrCountChange = (rateVal: string, countVal: string) => {
    const rate = parseFloat(rateVal) || 0;
    const count = parseInt(countVal) || 0;
    if (usePerPackageCalc) {
      setWagePerCar(String(rate * count));
    }
  };

  // Add a worker name
  const handleAddWorker = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (workerNames.some(w => w.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    setWorkerNames(prev => [...prev, trimmed]);
    setNewWorkerInput('');
  };

  // Remove worker name
  const handleRemoveWorker = (nameToRemove: string) => {
    setWorkerNames(prev => prev.filter(w => w !== nameToRemove));
  };

  // Toggle worker from quick suggestions
  const handleToggleWorkerSuggestion = (name: string) => {
    if (workerNames.includes(name)) {
      handleRemoveWorker(name);
    } else {
      handleAddWorker(name);
    }
  };

  // Calculate automatic wage split
  const totalWageNum = Math.max(0, parseFloat(wagePerCar) || 0);
  const workerCount = Math.max(1, workerNames.length);
  const wagePerWorker = Math.round(totalWageNum / workerCount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packagingCode.trim()) {
      alert('Mohon isi Kode Bungkaran (misal: jeruk gina 01)');
      return;
    }

    const finalWorkers = workerNames.length > 0 ? workerNames : ['Pembungkar Umum'];
    const finalWagePerWorker = Math.round(totalWageNum / finalWorkers.length);

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);

    const newRecord: CarUnloadingRecord = {
      id: `BKR-${Date.now().toString().slice(-4)}`,
      date,
      time,
      packagingCode: packagingCode.toLowerCase().trim(),
      packageCount: Math.max(1, parseInt(packageCount) || 1),
      wagePerCar: totalWageNum,
      wageMethod: usePerPackageCalc ? 'per_bungkaran' : 'langsung',
      ratePerPackage: usePerPackageCalc ? parseFloat(ratePerPackage) || 0 : undefined,
      workerNames: finalWorkers,
      wagePerWorker: finalWagePerWorker,
      workerTeam: workerTeam.trim() || undefined,
      paymentStatus,
      createdAt: now.toISOString(),
    };

    onAdd(newRecord);

    // Reset inputs for next entry, keep workers ready and default wage 600000
    setPackagingCode('');
    setPackageCount('100');
    setWagePerCar('600000');
  };

  // Preset example codes
  const quickCodeSuggestions = [
    'jeruk gina 01',
    'jeruk gina 02',
    'semangka 01',
    'mangga 01',
    'apel 01',
  ];

  if (!isAdmin) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 p-5 rounded-2xl border border-emerald-200/80 shadow-xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Mode Klien / Viewer (Live Real-Time Aktif)
              </h2>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Sinkron Otomatis</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
              Halaman ini akan <strong>otomatis ter-update sendiri</strong> setiap kali Admin menambahkan bungkaran baru, mengubah data, atau menghapus bungkaran tanpa perlu refresh halaman.
            </p>
          </div>
        </div>

        <button
          id="btn-prompt-login-form"
          type="button"
          onClick={onPromptLogin}
          className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Login Admin untuk Input</span>
        </button>
      </div>
    );
  }

  return (
    <div id="simple-add-form" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-6">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Catat Pembongkaran Mobil & Upah
              </h2>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>Admin Aktif</span>
              </span>
            </div>
          </div>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Data langsung tersimpan di Cloud & otomatis muncul di semua layar klien
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ROW 1: Kode Bungkaran, Jumlah, Upah Per Mobil, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Kode Bungkaran (misal jeruk gina 01) */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kode Bungkaran <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-packaging-code"
              type="text"
              required
              placeholder="Contoh: jeruk gina 01"
              value={packagingCode}
              onChange={e => setPackagingCode(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-emerald-900"
            />
          </div>

          {/* 2. Jumlah Bungkaran */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Jumlah Bungkaran (Koli)
            </label>
            <input
              id="input-package-count"
              type="number"
              min="1"
              required
              value={packageCount}
              onChange={e => {
                setPackageCount(e.target.value);
                handleRateOrCountChange(ratePerPackage, e.target.value);
              }}
              className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          {/* 3. Upah Per Mobil */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Upah Per Mobil (Rp) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const nextState = !usePerPackageCalc;
                  setUsePerPackageCalc(nextState);
                  if (nextState) {
                    const r = parseFloat(ratePerPackage) || 2000;
                    const c = parseInt(packageCount) || 100;
                    setWagePerCar(String(r * c));
                  }
                }}
                className="text-[10px] text-emerald-700 font-semibold hover:underline flex items-center space-x-0.5"
                title="Ganti cara input upah"
              >
                <Calculator className="w-2.5 h-2.5" />
                <span>{usePerPackageCalc ? 'Input Langsung' : 'Hitung Tarif'}</span>
              </button>
            </div>

            {usePerPackageCalc ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  placeholder="Tarif/koli"
                  value={ratePerPackage}
                  onChange={e => {
                    setRatePerPackage(e.target.value);
                    handleRateOrCountChange(e.target.value, packageCount);
                  }}
                  className="w-1/2 px-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
                <span className="text-xs font-bold text-slate-400">=</span>
                <span className="w-1/2 px-2 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 truncate">
                  {formatRupiah(parseFloat(wagePerCar) || 0)}
                </span>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                    Rp
                  </span>
                  <input
                    id="input-wage-car"
                    type="number"
                    step="10000"
                    min="0"
                    required
                    placeholder="600000"
                    value={wagePerCar}
                    onChange={e => setWagePerCar(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm font-black bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-emerald-800"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] font-bold text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <span className="text-emerald-700">Format Rupiah:</span>
                  <span className="font-black text-xs text-emerald-900">
                    {formatRupiah(parseFloat(wagePerCar) || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Status Upah */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Status Upah
            </label>
            <select
              id="select-wage-status"
              value={paymentStatus}
              onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
              className={`w-full px-3 py-2 text-xs font-bold rounded-xl border ${
                paymentStatus === 'lunas'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <option value="lunas">Lunas</option>
              <option value="belum_dibayar">Belum Dibayar</option>
            </select>
          </div>
        </div>

        {/* ROW 2: NAMA-NAMA PEMBUNGKAR & OTOMATIS TERBAGI */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-slate-50 rounded-xl border border-emerald-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5 pb-2 border-b border-emerald-100">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Nama-Nama Pembungkar Mobil Ini ({workerNames.length} Orang)
              </span>
            </div>

            {/* HASIL PEMBAGIAN UPAH OTOMATIS */}
            <div className="flex items-baseline space-x-1.5 bg-white px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-xs text-slate-500">Upah Terbagi:</span>
              <span className="text-sm font-black text-emerald-700">
                {formatRupiah(wagePerWorker)}
              </span>
              <span className="text-[11px] font-bold text-slate-600">/ orang</span>
            </div>
          </div>

          {/* Tag Chips for current workers on this car */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            {workerNames.map(name => (
              <span
                key={name}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900 shadow-2xs"
              >
                <span>{name}</span>
                <span className="text-[10px] text-emerald-600 font-normal">
                  ({formatRupiah(wagePerWorker)})
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveWorker(name)}
                  className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                  title="Hapus nama"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Input to type new worker name */}
            <div className="flex items-center space-x-1.5 w-full sm:w-auto mt-1 sm:mt-0">
              <input
                id="input-worker-name"
                type="text"
                placeholder="+ Ketik nama pembungkar..."
                value={newWorkerInput}
                onChange={e => setNewWorkerInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddWorker(newWorkerInput);
                  }
                }}
                className="flex-1 sm:w-48 px-3 py-2 sm:py-1.5 text-sm sm:text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => handleAddWorker(newWorkerInput)}
                className="px-3 py-2 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* Quick Click from available worker suggestions (8 nama pembungkar tetap) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-emerald-100/80">
            <span className="text-[11px] text-slate-700 font-bold mr-1">
              Pilih cepat pembungkar (8 nama):
            </span>
            {defaultWorkerSuggestions.map((sug, idx) => {
              const isSelected = workerNames.includes(sug);
              return (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleToggleWorkerSuggestion(sug)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-400 hover:bg-emerald-50'
                  }`}
                  title={`${isSelected ? 'Hapus' : 'Pilih'} ${sug}`}
                >
                  <span className="text-[10px] opacity-75 mr-0.5">{idx + 1}.</span>
                  <span>{isSelected ? `✓ ${sug}` : `+ ${sug}`}</span>
                </button>
              );
            })}

            <div className="flex items-center space-x-1.5 ml-auto mt-1 sm:mt-0">
              <button
                type="button"
                onClick={() => setWorkerNames([...defaultWorkerSuggestions])}
                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                title="Pilih semua 8 orang pembungkar"
              >
                Pilih Semua (8)
              </button>
              {workerNames.length > 0 && (
                <button
                  type="button"
                  onClick={() => setWorkerNames([])}
                  className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
                  title="Kosongkan pilihan pembungkar"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ROW 3: Saran Kode & Tombol Submit */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="text-[11px] font-semibold text-slate-400">Contoh kode bungkaran:</span>
            {quickCodeSuggestions.map(code => (
              <button
                key={code}
                type="button"
                onClick={() => setPackagingCode(code)}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-medium text-slate-600 transition-colors border border-slate-200"
              >
                {code}
              </button>
            ))}
          </div>

          <button
            id="btn-submit-car"
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-sm flex items-center space-x-1.5 transition-all ml-auto"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Simpan Pembongkaran Mobil</span>
          </button>
        </div>
      </form>
    </div>
  );
};
