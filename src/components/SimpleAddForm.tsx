import React, { useState } from 'react';
import { Plus, Check, Calculator, Users, X } from 'lucide-react';
import { CarUnloadingRecord, PaymentStatus } from '../types';
import { formatRupiah } from '../utils/formatters';

interface SimpleAddFormProps {
  onAdd: (record: CarUnloadingRecord) => void;
  existingCodes: string[];
  existingWorkers: string[];
}

export const SimpleAddForm: React.FC<SimpleAddFormProps> = ({ 
  onAdd, 
  existingCodes,
  existingWorkers 
}) => {
  const [packagingCode, setPackagingCode] = useState('');
  const [packageCount, setPackageCount] = useState<string>('100');
  const [wagePerCar, setWagePerCar] = useState<string>('300000');
  const [workerTeam, setWorkerTeam] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('lunas');
  const [usePerPackageCalc, setUsePerPackageCalc] = useState(false);
  const [ratePerPackage, setRatePerPackage] = useState('2000');

  // List of worker names for this car
  const [workerNames, setWorkerNames] = useState<string[]>(['Slamet', 'Joko', 'Anto']);
  const [newWorkerInput, setNewWorkerInput] = useState('');

  // Default suggested worker names
  const defaultWorkerSuggestions = Array.from(
    new Set([...existingWorkers, 'Slamet', 'Joko', 'Anto', 'Budi', 'Udin', 'Herman', 'Asep'])
  );

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

    // Reset inputs for next entry, keep workers ready
    setPackagingCode('');
    setPackageCount('100');
  };

  // Preset example codes
  const quickCodeSuggestions = [
    'jeruk gina 01',
    'jeruk gina 02',
    'semangka 01',
    'mangga 01',
    'apel 01',
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs mb-6">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            <Plus className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Catat Pembongkaran Mobil & Upah
          </h2>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Cukup isi kode bungkaran, jumlah, upah mobil, & nama pembungkar
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
              <input
                id="input-wage-car"
                type="number"
                step="5000"
                min="0"
                required
                placeholder="Contoh: 300000"
                value={wagePerCar}
                onChange={e => setWagePerCar(e.target.value)}
                className="w-full px-3 py-2 text-sm font-black bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-emerald-800"
              />
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
            <div className="inline-flex items-center space-x-1">
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
                className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 w-44 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => handleAddWorker(newWorkerInput)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* Quick Click from available worker suggestions */}
          <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
            <span className="text-[11px] text-slate-500 font-medium mr-1">
              Pilih cepat pembungkar:
            </span>
            {defaultWorkerSuggestions.map(sug => {
              const isSelected = workerNames.includes(sug);
              return (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleToggleWorkerSuggestion(sug)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  {isSelected ? `✓ ${sug}` : `+ ${sug}`}
                </button>
              );
            })}
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
