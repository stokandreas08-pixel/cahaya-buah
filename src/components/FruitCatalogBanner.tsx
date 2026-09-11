import React from 'react';
import { Sparkles, Package, ArrowRight, Settings } from 'lucide-react';
import { FRUIT_CATALOG, getStockKey } from '../data/fruitCatalog';
import { FruitType, StockMap } from '../types';

interface FruitCatalogBannerProps {
  stocks: StockMap;
  onSelectFruitToOrder?: (fruitId: FruitType, size?: string) => void;
  onOpenStockManager?: () => void;
}

export const FruitCatalogBanner: React.FC<FruitCatalogBannerProps> = ({
  stocks,
  onSelectFruitToOrder,
  onOpenStockManager,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Pilihan Buah & Jumlah Stok (Per Peti)
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Pilihan Jeruk Gina, Jeruk Faisal (AB, C, DTOP, DR, DK), Salak, & Naga (A, B)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenStockManager}
          className="self-start sm:self-auto px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          title="Atur jumlah stok peti yang tersedia di gudang"
        >
          <Settings className="w-3.5 h-3.5 text-amber-800" />
          <span>Kelola Stok Peti</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {FRUIT_CATALOG.map((item) => {
          const totalCategoryStock = item.sizes.reduce((sum, sz) => {
            const key = getStockKey(item.id, sz);
            return sum + (stocks[key] ?? 0);
          }, 0);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xl">{item.icon}</span>
                    <h3 className="text-sm font-black text-slate-900">{item.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                    {totalCategoryStock} Peti
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>

              {/* Sizes with Live Stock Badges */}
              <div className="pt-2.5 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Pilih Ukuran & Stok:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.sizes.map((sz) => {
                    const key = getStockKey(item.id, sz);
                    const stockQty = stocks[key] ?? 0;

                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => onSelectFruitToOrder?.(item.id, sz)}
                        className={`px-2 py-1 text-xs rounded-lg font-bold border flex items-center space-x-1 transition-all cursor-pointer ${
                          stockQty > 0
                            ? 'bg-slate-50 hover:bg-amber-600 hover:text-white hover:border-amber-600 text-slate-800 border-slate-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200 opacity-80'
                        }`}
                        title={`Pilih ${item.name} Ukuran ${sz} (Stok: ${stockQty} Peti)`}
                      >
                        <span>{sz}</span>
                        <span
                          className={`text-[10px] px-1 rounded ${
                            stockQty > 0
                              ? 'bg-slate-200/80 text-slate-700 group-hover:bg-amber-700 group-hover:text-white'
                              : 'bg-rose-200 text-rose-900'
                          }`}
                        >
                          {stockQty}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
