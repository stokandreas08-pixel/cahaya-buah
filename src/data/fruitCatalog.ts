import { FruitCatalogItem, FruitOrder, StockMap } from '../types';

export const FRUIT_CATALOG: FruitCatalogItem[] = [
  {
    id: 'jeruk_gina',
    name: 'Jeruk Gina',
    shortName: 'Gina',
    sizes: ['AB', 'C', 'DTOP', 'DR', 'DK'],
    description: 'Jeruk Gina pilihan manis segar dengan grading ukuran AB, C, DTOP, DR, dan DK.',
    colorBadge: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: '🍊',
  },
  {
    id: 'jeruk_faisal',
    name: 'Jeruk Faisal',
    shortName: 'Faisal',
    sizes: ['AB', 'C', 'DTOP', 'DR', 'DK'],
    description: 'Jeruk Faisal kualitas premium matang pohon dengan grading ukuran AB, C, DTOP, DR, dan DK.',
    colorBadge: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: '🍊',
  },
  {
    id: 'salak',
    name: 'Salak',
    shortName: 'Salak',
    sizes: ['Standar'],
    description: 'Salak manis dan padat, dihitung per peti standar.',
    colorBadge: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    icon: '🤎',
  },
  {
    id: 'naga',
    name: 'Buah Naga',
    shortName: 'Naga',
    sizes: ['A', 'B'],
    description: 'Buah naga merah segar dengan pilihan grade ukuran A (super) dan B.',
    colorBadge: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: '🐉',
  },
];

export const getStockKey = (fruitType: string, size: string): string => {
  return `${fruitType}__${size}`;
};

export const initialFruitStock: StockMap = {
  'jeruk_gina__AB': 50,
  'jeruk_gina__C': 35,
  'jeruk_gina__DTOP': 40,
  'jeruk_gina__DR': 25,
  'jeruk_gina__DK': 20,
  'jeruk_faisal__AB': 45,
  'jeruk_faisal__C': 40,
  'jeruk_faisal__DTOP': 30,
  'jeruk_faisal__DR': 20,
  'jeruk_faisal__DK': 15,
  'salak__Standar': 60,
  'naga__A': 30,
  'naga__B': 25,
};

export const initialFruitOrders: FruitOrder[] = [
  {
    id: 'order-sample-01',
    orderNumber: 'ORD-001',
    customerName: 'H. Syamsul (Pasar Induk)',
    customerPhone: '0812-3456-7890',
    date: new Date().toISOString().split('T')[0],
    time: '08:30',
    items: [
      {
        id: 'item-1',
        fruitType: 'jeruk_gina',
        fruitName: 'Jeruk Gina',
        size: 'AB',
        petiCount: 15,
      },
      {
        id: 'item-2',
        fruitType: 'jeruk_faisal',
        fruitName: 'Jeruk Faisal',
        size: 'DTOP',
        petiCount: 10,
      },
    ],
    totalPeti: 25,
    status: 'diproses',
    notes: 'Kirim pagi via pickup, peti bersih & jangan ditumpuk lebih dari 4 lapis',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'order-sample-02',
    orderNumber: 'ORD-002',
    customerName: 'Toko Buah Berkah Mandiri',
    customerPhone: '0857-1122-3344',
    date: new Date().toISOString().split('T')[0],
    time: '10:15',
    items: [
      {
        id: 'item-3',
        fruitType: 'salak',
        fruitName: 'Salak',
        size: 'Standar',
        petiCount: 20,
      },
      {
        id: 'item-4',
        fruitType: 'naga',
        fruitName: 'Buah Naga',
        size: 'A',
        petiCount: 12,
      },
    ],
    totalPeti: 32,
    status: 'menunggu',
    notes: 'Mohon dicek kualitas buah naga ukuran A',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

