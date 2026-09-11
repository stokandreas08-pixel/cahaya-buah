/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CarUnloadingRecord } from './types';
import { initialRecords } from './data/initialData';
import { Navbar } from './components/Navbar';
import { StatCards } from './components/StatCards';
import { SimpleAddForm } from './components/SimpleAddForm';
import { RecordList } from './components/RecordList';
import { EditModal } from './components/EditModal';
import { PrintSlipModal } from './components/PrintSlipModal';
import { WorkerSummaryModal } from './components/WorkerSummaryModal';

const STORAGE_KEY = 'car_bungkaran_records_v5';

export default function App() {
  const [records, setRecords] = useState<CarUnloadingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading records', e);
    }
    return initialRecords;
  });

  // Modals
  const [editingRecord, setEditingRecord] = useState<CarUnloadingRecord | null>(null);
  const [printingRecord, setPrintingRecord] = useState<CarUnloadingRecord | null>(null);
  const [isWorkerSummaryOpen, setIsWorkerSummaryOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving records', e);
    }
  }, [records]);

  // Add new
  const handleAddRecord = (newRecord: CarUnloadingRecord) => {
    setRecords(prev => [newRecord, ...prev]);
  };

  // Edit save
  const handleSaveEdit = (updated: CarUnloadingRecord) => {
    setRecords(prev => prev.map(r => (r.id === updated.id ? updated : r)));
  };

  // Delete
  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  // Quick toggle status (Lunas <-> Belum Dibayar)
  const handleToggleStatus = (id: string) => {
    setRecords(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            paymentStatus: r.paymentStatus === 'lunas' ? 'belum_dibayar' : 'lunas',
          };
        }
        return r;
      })
    );
  };

  // Export to CSV with worker names & split wage
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Tanggal',
      'Jam',
      'Kode_Bungkaran',
      'Jumlah_Bungkaran',
      'Total_Upah_Mobil',
      'Jumlah_Pembungkar',
      'Nama_Nama_Pembungkar',
      'Upah_Per_Orang',
      'Status_Upah',
      'Catatan',
    ];

    const rows = records.map(r => {
      const workers = r.workerNames && r.workerNames.length > 0 ? r.workerNames : ['Umum'];
      const split = r.wagePerWorker || Math.round(r.wagePerCar / workers.length);
      return [
        `"${r.id}"`,
        `"${r.date}"`,
        `"${r.time}"`,
        `"${r.packagingCode}"`,
        `${r.packageCount}`,
        `${r.wagePerCar}`,
        `${workers.length}`,
        `"${workers.join(', ')}"`,
        `${split}`,
        `"${r.paymentStatus}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `data_bungkaran_upah_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const existingCodes = Array.from(new Set(records.map(r => r.packagingCode)));
  const existingWorkers = Array.from(
    new Set(records.flatMap(r => r.workerNames || []))
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        onOpenNew={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          const el = document.getElementById('input-packaging-code');
          if (el) el.focus();
        }}
        onOpenWorkerSummary={() => setIsWorkerSummaryOpen(false || true)}
        onExportCSV={handleExportCSV}
        totalRecords={records.length}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Ringkasan Angka Utama */}
        <StatCards records={records} />

        {/* Form Input Cepat (Kode Bungkaran, Jumlah, Upah Per Mobil, Nama-Nama Pembungkar) */}
        <SimpleAddForm
          onAdd={handleAddRecord}
          existingCodes={existingCodes}
          existingWorkers={existingWorkers}
        />

        {/* Tabel Data Bungkaran & Upah Terbagi Per Mobil */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Daftar Bungkaran & Upah Per Mobil ({records.length})
            </h2>
            <span className="text-xs text-slate-500">
              Upah otomatis terbagi rata per nama pembungkar
            </span>
          </div>

          <RecordList
            records={records}
            onEdit={item => setEditingRecord(item)}
            onPrint={item => setPrintingRecord(item)}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-400">
        Data Bungkaran & Upah Bongkar • Otomatis Terbagi Rata Per Pembungkar
      </footer>

      {/* Modals */}
      <EditModal
        record={editingRecord}
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveEdit}
      />

      <PrintSlipModal
        record={printingRecord}
        isOpen={!!printingRecord}
        onClose={() => setPrintingRecord(null)}
      />

      <WorkerSummaryModal
        records={records}
        isOpen={isWorkerSummaryOpen}
        onClose={() => setIsWorkerSummaryOpen(false)}
      />
    </div>
  );
}
