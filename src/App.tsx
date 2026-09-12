/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CarUnloadingRecord, FruitOrder, OrderStatus, FruitType, StockMap } from './types';
import { initialRecords } from './data/initialData';
import { initialFruitOrders, initialFruitStock, getStockKey } from './data/fruitCatalog';
import { Navbar, MainTab } from './components/Navbar';
import { StatCards } from './components/StatCards';
import { SimpleAddForm } from './components/SimpleAddForm';
import { RecordList } from './components/RecordList';
import { EditModal } from './components/EditModal';
import { PrintSlipModal } from './components/PrintSlipModal';
import { WorkerSummaryModal } from './components/WorkerSummaryModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { FruitCatalogBanner } from './components/FruitCatalogBanner';
import { AddFruitOrderForm } from './components/AddFruitOrderForm';
import { FruitOrderList } from './components/FruitOrderList';
import { FruitOrderStatCards } from './components/FruitOrderStatCards';
import { PrintFruitOrderModal } from './components/PrintFruitOrderModal';
import { FruitStockModal } from './components/FruitStockModal';
import { EditFruitOrderModal } from './components/EditFruitOrderModal';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { 
  subscribeToRecords, 
  addRecordToCloud, 
  updateRecordInCloud, 
  deleteRecordFromCloud, 
  togglePaymentStatusInCloud 
} from './services/recordService';
import { 
  subscribeToFruitOrders,
  addFruitOrderToCloud,
  updateFruitOrderInCloud,
  deleteFruitOrderFromCloud,
  updateFruitOrderStatusInCloud,
} from './services/fruitOrderService';
import {
  subscribeToFruitStock,
  saveAllStocksToCloud,
} from './services/fruitStockService';
import { 
  AdminUser, 
  getSavedAdminSession, 
  subscribeToAuth, 
  logoutAdmin 
} from './services/authService';

const STORAGE_KEY = 'car_bungkaran_records_v5';
const ORDERS_STORAGE_KEY = 'fruit_orders_records_v2';
const STOCKS_STORAGE_KEY = 'fruit_stocks_inventory_v1';

export default function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<MainTab>('bungkaran');

  // Local records cache / fallback
  const [records, setRecords] = useState<CarUnloadingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading local records', e);
    }
    return initialRecords;
  });

  // Fruit orders state
  const [fruitOrders, setFruitOrders] = useState<FruitOrder[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading local fruit orders', e);
    }
    return initialFruitOrders;
  });

  // Fruit stock state
  const [stocks, setStocks] = useState<StockMap>(() => {
    try {
      const saved = localStorage.getItem(STOCKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading local stock', e);
    }
    return initialFruitStock;
  });

  // Real-time connection status
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  // Admin authentication state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => getSavedAdminSession());
  const isAdmin = !!adminUser?.isAdmin;

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CarUnloadingRecord | null>(null);
  const [printingRecord, setPrintingRecord] = useState<CarUnloadingRecord | null>(null);
  const [printingFruitOrder, setPrintingFruitOrder] = useState<FruitOrder | null>(null);
  const [editingFruitOrder, setEditingFruitOrder] = useState<FruitOrder | null>(null);
  const [isWorkerSummaryOpen, setIsWorkerSummaryOpen] = useState(false);
  const [prefillFruit, setPrefillFruit] = useState<{ fruitId: FruitType; size?: string } | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Auth listener
  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setAdminUser(user);
    });
    return () => unsub();
  }, []);

  // 1. Subscribe to real-time bungkaran records (propagates immediately to Viewer & Admin)
  useEffect(() => {
    const unsubscribe = subscribeToRecords(
      (cloudRecords) => {
        setRecords(cloudRecords);
        setIsRealtimeConnected(true);
      },
      (err) => {
        console.warn('Realtime bungkaran subscription offline/failed:', err);
        setIsRealtimeConnected(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Subscribe to real-time fruit orders (propagates immediately to Viewer & Admin)
  useEffect(() => {
    const unsubscribe = subscribeToFruitOrders(
      (cloudOrders) => {
        setFruitOrders(cloudOrders);
        setIsRealtimeConnected(true);
      },
      (err) => {
        console.warn('Realtime fruit orders subscription offline/failed:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // 3. Subscribe to real-time fruit stock inventory (propagates immediately to Viewer & Admin)
  useEffect(() => {
    const unsubscribe = subscribeToFruitStock(
      (cloudStocks) => {
        if (cloudStocks && typeof cloudStocks === 'object') {
          setStocks(cloudStocks);
        }
      },
      (err) => {
        console.warn('Realtime fruit stock subscription offline/failed:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Save records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving records to localStorage', e);
    }
  }, [records]);

  // Save fruit orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(fruitOrders));
    } catch (e) {
      console.error('Error saving fruit orders to localStorage', e);
    }
  }, [fruitOrders]);

  // Save stocks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STOCKS_STORAGE_KEY, JSON.stringify(stocks));
    } catch (e) {
      console.error('Error saving fruit stocks to localStorage', e);
    }
  }, [stocks]);

  // ---------------- BUNGKARAN ACTIONS ----------------
  const handleAddRecord = async (newRecord: CarUnloadingRecord) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    setRecords(prev => [newRecord, ...prev]);
    showToast(`Bungkaran ${newRecord.packagingCode} berhasil ditambahkan!`);

    try {
      await addRecordToCloud(newRecord);
    } catch (err) {
      console.error('Failed to sync new record to cloud:', err);
    }
  };

  const handleSaveEdit = async (updated: CarUnloadingRecord) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    setRecords(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    setEditingRecord(null);
    showToast(`Bungkaran ${updated.packagingCode} berhasil diperbarui!`);

    try {
      await updateRecordInCloud(updated);
    } catch (err) {
      console.error('Failed to sync update to cloud:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    setRecords(prev => prev.filter(r => r.id !== id));
    showToast('Data bungkaran berhasil dihapus!');

    try {
      await deleteRecordFromCloud(id);
    } catch (err) {
      console.error('Failed to sync delete to cloud:', err);
    }
  };

  const handleToggleStatus = async (id: string) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    const target = records.find(r => r.id === id);
    if (!target) return;

    const newStatus = target.paymentStatus === 'lunas' ? 'belum_dibayar' : 'lunas';

    setRecords(prev =>
      prev.map(r => (r.id === id ? { ...r, paymentStatus: newStatus } : r))
    );

    try {
      await togglePaymentStatusInCloud(id, target.paymentStatus);
    } catch (err) {
      console.error('Failed to sync status toggle to cloud:', err);
    }
  };

  // ---------------- FRUIT ORDERS ACTIONS (PER PETI) ----------------
  const handleAddFruitOrder = async (order: FruitOrder) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    setFruitOrders(prev => [order, ...prev]);

    // Automatically update local & cloud stock for ordered items (allowing negative stock when order exceeds stock)
    const updatedStocks = { ...stocks };
    order.items.forEach((it) => {
      const key = getStockKey(it.fruitType, it.size);
      const currentVal = updatedStocks[key] ?? 0;
      updatedStocks[key] = currentVal - it.petiCount;
    });
    setStocks(updatedStocks);

    showToast(`Pesanan ${order.orderNumber} (${order.totalPeti} Peti) berhasil disimpan!`);

    try {
      await addFruitOrderToCloud(order);
      await saveAllStocksToCloud(updatedStocks);
    } catch (err) {
      console.error('Failed to sync fruit order or stock to cloud:', err);
    }
  };

  const handleEditFruitOrder = async (updatedOrder: FruitOrder) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    const oldOrder = fruitOrders.find((o) => o.id === updatedOrder.id);
    if (!oldOrder) return;

    // Adjust stocks: restore old order items, then deduct new order items (allowing negative stock)
    const updatedStocks = { ...stocks };

    // 1. Restore old items to stock
    oldOrder.items.forEach((it) => {
      const key = getStockKey(it.fruitType, it.size);
      const current = updatedStocks[key] ?? 0;
      updatedStocks[key] = current + it.petiCount;
    });

    // 2. Deduct new items from stock (can become negative if order exceeds stock)
    updatedOrder.items.forEach((it) => {
      const key = getStockKey(it.fruitType, it.size);
      const current = updatedStocks[key] ?? 0;
      updatedStocks[key] = current - it.petiCount;
    });

    setFruitOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
    setStocks(updatedStocks);
    showToast(`Pesanan ${updatedOrder.orderNumber} berhasil diperbarui!`);

    try {
      await updateFruitOrderInCloud(updatedOrder);
      await saveAllStocksToCloud(updatedStocks);
    } catch (err) {
      console.error('Failed to sync updated fruit order or stocks to cloud:', err);
    }
  };

  const handleDeleteFruitOrder = async (id: string) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    setFruitOrders(prev => prev.filter(o => o.id !== id));
    showToast('Pesanan buah berhasil dihapus!');

    try {
      await deleteFruitOrderFromCloud(id);
    } catch (err) {
      console.error('Failed to sync fruit order delete:', err);
    }
  };

  const handleUpdateFruitOrderStatus = async (id: string, status: OrderStatus) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    setFruitOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status } : o))
    );
    showToast(`Status pesanan diubah ke: ${status.toUpperCase()}`);

    try {
      await updateFruitOrderStatusInCloud(id, status);
    } catch (err) {
      console.error('Failed to update fruit order status:', err);
    }
  };

  // ---------------- STOCK ACTIONS ----------------
  const handleSaveStocks = async (newStocks: StockMap) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    setStocks(newStocks);
    showToast('Stok peti buah di gudang berhasil diperbarui!');

    try {
      await saveAllStocksToCloud(newStocks);
    } catch (err) {
      console.error('Failed to sync stocks to cloud:', err);
    }
  };

  // Admin Logout
  const handleLogout = async () => {
    await logoutAdmin();
    setAdminUser(null);
    showToast('Anda telah keluar dari mode Admin.');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (activeTab === 'pesanan_peti') {
      // Export fruit orders without price
      const headers = [
        'No_Order',
        'Tanggal',
        'Jam',
        'Nama_Pemesan',
        'Kontak',
        'Rincian_Buah_Dan_Ukuran',
        'Total_Peti',
        'Status_Pesanan',
        'Catatan',
      ];

      const rows = fruitOrders.map(o => {
        const itemSummary = o.items
          .map(it => `${it.fruitName} (Uk. ${it.size}): ${it.petiCount} Peti`)
          .join('; ');
        return [
          `"${o.orderNumber}"`,
          `"${o.date}"`,
          `"${o.time}"`,
          `"${o.customerName}"`,
          `"${o.customerPhone || '-'}"`,
          `"${itemSummary}"`,
          `${o.totalPeti}`,
          `"${o.status}"`,
          `"${(o.notes || '').replace(/"/g, '""')}"`,
        ];
      });

      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `pesanan_buah_peti_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Data pesanan peti berhasil diunduh ke CSV!');
    } else {
      // Export bungkaran records
      const headers = [
        'Tanggal',
        'Waktu',
        'Kode_Bungkaran',
        'Jumlah_Bungkaran_Koli',
        'Upah_Per_Mobil_Rp',
        'Jumlah_Pembungkar',
        'Upah_Per_Orang_Rp',
        'Nama_Pembungkar',
        'Status_Bayar',
        'Catatan',
      ];

      const rows = records.map(r => {
        const workers = (r.workerNames && Array.isArray(r.workerNames) && r.workerNames.length > 0)
          ? r.workerNames
          : ((r as any).workers && Array.isArray((r as any).workers))
          ? (r as any).workers
          : [];
        const wage = r.wagePerCar ?? (r as any).unloadingFee ?? 0;
        const count = workers.length || 1;
        const wagePerWorker = r.wagePerWorker ?? Math.round(wage / count);

        return [
          `"${r.date || ''}"`,
          `"${r.time || ''}"`,
          `"${r.packagingCode || ''}"`,
          r.packageCount ?? 0,
          wage,
          workers.length,
          wagePerWorker,
          `"${workers.join(', ')}"`,
          `"${r.paymentStatus || ''}"`,
          `"${(r.notes || '').replace(/"/g, '""')}"`,
        ];
      });

      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `rekap_bungkaran_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Data bungkaran berhasil diunduh ke CSV!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 animate-fade-in flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenNew={() => {
          if (activeTab === 'bungkaran') {
            if (!isAdmin) {
              setIsLoginModalOpen(true);
            } else {
              const formEl = document.getElementById('simple-add-form');
              if (formEl) {
                formEl.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }
            }
          } else {
            const formEl = document.getElementById('add-fruit-order-form');
            if (formEl) {
              formEl.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }
          }
        }}
        totalRecords={records.length}
        totalFruitOrders={fruitOrders.length}
        onExportCSV={handleExportCSV}
        onExport={handleExportCSV}
        onOpenWorkerSummary={() => setIsWorkerSummaryOpen(true)}
        isAdmin={isAdmin}
        adminUser={adminUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onLogoutClick={handleLogout}
        onOpenAdminSettings={() => setIsAdminSettingsOpen(true)}
        isRealtimeConnected={isRealtimeConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 md:pb-8">
        {activeTab === 'bungkaran' ? (
          /* TAB 1: DATA BUNGKARAN & UPAH MOBIL */
          <div>
            {/* Stat Cards Bungkaran */}
            <StatCards records={records} />

            {/* Simple Add Form */}
            <SimpleAddForm
              onAdd={handleAddRecord}
              isAdmin={isAdmin}
              onPromptLogin={() => setIsLoginModalOpen(true)}
              existingWorkers={Array.from(
                new Set(
                  records.flatMap(r =>
                    Array.isArray(r.workerNames)
                      ? r.workerNames
                      : Array.isArray((r as any).workers)
                      ? (r as any).workers
                      : []
                  )
                )
              )}
              existingCodes={Array.from(
                new Set(records.map(r => r.packagingCode).filter(Boolean))
              )}
            />

            {/* Records List Table */}
            <RecordList
              records={records}
              onEdit={record => setEditingRecord(record)}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onPrint={record => setPrintingRecord(record)}
              isAdmin={isAdmin}
              onPromptLogin={() => setIsLoginModalOpen(true)}
            />
          </div>
        ) : (
          /* TAB 2: PESANAN BUAH (PER PETI) */
          <div>
            {/* Stat Cards Pesanan Peti */}
            <FruitOrderStatCards
              orders={fruitOrders}
              stocks={stocks}
              onOpenStockManager={() => setIsStockModalOpen(true)}
            />

            {/* Showcase Katalog Buah & Grade Ukuran (Jeruk Gina, Jeruk Faisal, Salak, Naga) */}
            <FruitCatalogBanner
              stocks={stocks}
              onSelectFruitToOrder={(fruitId, size) => {
                setPrefillFruit({ fruitId, size });
                window.scrollTo({ top: 120, behavior: 'smooth' });
                showToast(`Memilih ${fruitId} ukuran ${size || 'standar'} untuk pesanan`);
              }}
              onOpenStockManager={() => {
                if (!isAdmin) {
                  setIsLoginModalOpen(true);
                  return;
                }
                setIsStockModalOpen(true);
              }}
            />

            {/* Form Buat Pesanan Peti */}
            <AddFruitOrderForm
              onAddOrder={handleAddFruitOrder}
              isAdmin={isAdmin}
              onPromptLogin={() => setIsLoginModalOpen(true)}
              stocks={stocks}
              existingOrders={fruitOrders}
              prefillFruit={prefillFruit}
              onClearPrefill={() => setPrefillFruit(null)}
            />

            {/* Tabel Daftar Pesanan Peti */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Daftar Pesanan Buah Per Peti ({fruitOrders.length})
                </h2>
                <span className="text-xs text-slate-500">
                  Dihitung per peti • Terhubung Real-Time Firestore
                </span>
              </div>

              <FruitOrderList
                orders={fruitOrders}
                onPrint={order => setPrintingFruitOrder(order)}
                onEdit={order => setEditingFruitOrder(order)}
                onDelete={handleDeleteFruitOrder}
                onUpdateStatus={handleUpdateFruitOrderStatus}
                isAdmin={isAdmin}
                onPromptLogin={() => setIsLoginModalOpen(true)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-400">
        Data Bungkaran & Pesanan Buah Per Peti • Jeruk Gina • Jeruk Faisal • Salak • Buah Naga • Real-time Cloud Sync
      </footer>

      {/* Modals */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setAdminUser(user);
          showToast(`Berhasil masuk sebagai Admin (${user.name || user.email})!`);
        }}
      />

      <FruitStockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        stocks={stocks}
        onSaveStocks={handleSaveStocks}
        isAdmin={isAdmin}
        onPromptLogin={() => setIsLoginModalOpen(true)}
      />

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

      <PrintFruitOrderModal
        order={printingFruitOrder}
        isOpen={!!printingFruitOrder}
        onClose={() => setPrintingFruitOrder(null)}
      />

      <EditFruitOrderModal
        isOpen={!!editingFruitOrder}
        order={editingFruitOrder}
        stocks={stocks}
        onClose={() => setEditingFruitOrder(null)}
        onSave={handleEditFruitOrder}
        isAdmin={isAdmin}
        onPromptLogin={() => setIsLoginModalOpen(true)}
      />

      <WorkerSummaryModal
        records={records}
        isOpen={isWorkerSummaryOpen}
        onClose={() => setIsWorkerSummaryOpen(false)}
      />

      {/* Admin Settings Modal (Password, Profil, Foto) */}
      <AdminSettingsModal
        isOpen={isAdminSettingsOpen}
        onClose={() => setIsAdminSettingsOpen(false)}
        adminUser={adminUser}
        currentUser={adminUser}
        onProfileUpdated={(updatedUser) => {
          setAdminUser(updatedUser);
          showToast('Profil admin berhasil diperbarui!');
        }}
        onPasswordChanged={() => {
          showToast('Password admin berhasil diubah!');
        }}
        onLogout={() => {
          setIsAdminSettingsOpen(false);
          handleLogout();
        }}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNew={() => {
          if (!isAdmin) {
            setIsLoginModalOpen(true);
            return;
          }
          if (activeTab === 'bungkaran') {
            const el = document.getElementById('simple-add-form');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else window.scrollTo({ top: 120, behavior: 'smooth' });
          } else {
            const el = document.getElementById('add-fruit-order-form');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else window.scrollTo({ top: 120, behavior: 'smooth' });
          }
        }}
        onOpenWorkerSummary={() => setIsWorkerSummaryOpen(true)}
        onOpenStockManager={() => {
          if (!isAdmin) {
            setIsLoginModalOpen(true);
            return;
          }
          setIsStockModalOpen(true);
        }}
        isAdmin={isAdmin}
        adminUser={adminUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenAdminSettings={() => setIsAdminSettingsOpen(true)}
        totalRecords={records.length}
        totalFruitOrders={fruitOrders.length}
      />
    </div>
  );
}
