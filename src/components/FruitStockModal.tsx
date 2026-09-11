import React, { useState, useEffect } from 'react';
import { X, Package, Save, Check, RotateCcw } from 'lucide-react';
import { FRUIT_CATALOG, getStockKey, initialFruitStock } from '../data/fruitCatalog';
import { StockMap } from '../types';

interface FruitStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: StockMap;
  onSaveStocks: (newStocks: StockMap) => void;
  isAdmin: boolean;
  onPromptLogin: () => void;
}

export const FruitStockModal: React.FC<FruitStockModalProps> = ({
  isOpen,
  onClose,
  stocks,
  onSaveStocks,
  isAdmin,
  onPromptLogin,
}) => {
  const [localStocks, setLocalStocks] = useState<StockMap>(stocks);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setLocalStocks(stocks);
  }, [stocks, isOpen]);

  if (!isOpen) return null;

  const handleStockChange = (fruitId: string, size: string, value: number) => {
    const key = getStockKey(fruitId, size);
    setLocalStocks((prev) => ({
      ...prev,
      [key]: isNaN(Number(value)) ? 0 : Math.floor(Number(value)),
    }));
  };

  const handleAdjust = (fruitId: string, size: string, delta: number) => {
    const key = getStockKey(fruitId, size);
    const current = localStocks[key] ?? 0;
    handleStockChange(fruitId, size, current + delta);
  };

  const handleSave = () => {
    if (!isAdmin) {
      onPromptLogin();
      return;
    }

    onSaveStocks(localStocks);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan semua stok ke nilai default awal?')) {
      setLocalStocks({ ...initialFruitStock });
    }
  };

  const totalAllStock = (Object.values(localStocks) as number[]).reduce((sum: number, val: number) => sum + (val || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Kelola Stok Peti Buah
              </h3>
              <p className="text-xs text-slate-500">
                Atur ketersediaan peti untuk setiap jenis buah & ukuran grade
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[72vh] overflow-y-auto space-y-5">
          {/* Total Stock Banner */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold text-amber-950">
                Total Seluruh Stok Buah Tersedia:
              </span>
            </div>
            <span className="text-lg font-black text-amber-900">
              {totalAllStock} Peti
            </span>
          </div>

          {/* Fruit Categories List */}
          <div className="space-y-4">
            {FRUIT_CATALOG.map((cat) => {
              const catTotal = cat.sizes.reduce((sum, sz) => {
                const key = getStockKey(cat.id, sz);
                return sum + (localStocks[key] ?? 0);
              }, 0);

              return (
                <div
                  key={cat.id}
                  className="bg-slate-50/70 border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-bold text-sm text-slate-900">{cat.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.colorBadge}`}>
                        {cat.sizes.length} Grade Ukuran
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      Subtotal: <strong className="text-amber-800">{catTotal} Peti</strong>
                    </span>
                  </div>

                  {/* Size Stock Grids */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {cat.sizes.map((sz) => {
                      const key = getStockKey(cat.id, sz);
                      const currentVal = localStocks[key] ?? 0;

                      return (
                        <div
                          key={sz}
                          className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-black text-xs text-amber-900">
                              Uk. {sz}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Peti
                            </span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleAdjust(cat.id, sz, -5)}
                              className="w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded text-xs font-black cursor-pointer shrink-0"
                              title="-5 Peti"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={currentVal}
                              onChange={(e) =>
                                handleStockChange(cat.id, sz, Number(e.target.value))
                              }
                              className={`w-full text-center font-black text-xs py-1.5 sm:py-1 border rounded focus:ring-1 focus:ring-amber-500 ${
                                currentVal < 0
                                  ? 'border-rose-400 bg-rose-50 text-rose-700'
                                  : 'border-slate-300'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleAdjust(cat.id, sz, 5)}
                              className="w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-900 rounded text-xs font-black cursor-pointer shrink-0"
                              title="+5 Peti"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Awal</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={savedSuccess}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Stok Gudang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
