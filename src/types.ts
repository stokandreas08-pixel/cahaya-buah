export type PaymentStatus = 'lunas' | 'belum_dibayar';
export type MainTab = 'bungkaran' | 'pesanan_peti';

export interface CarUnloadingRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  packagingCode: string; // Kode Bungkaran, misalnya "jeruk gina 01"
  packageCount: number; // Jumlah bungkaran (koli / keranjang)
  wagePerCar: number; // Upah bungkaran per mobil (Rp)
  wageMethod?: 'langsung' | 'per_bungkaran';
  ratePerPackage?: number;
  workerNames: string[]; // Daftar nama-nama pembungkar (e.g. ["Slamet", "Joko", "Anto"])
  wagePerWorker: number; // Upah otomatis per pembungkar (wagePerCar / workerNames.length)
  workerTeam?: string; // Mandor / Nama Regu (opsional)
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export type FruitType = 'jeruk_gina' | 'jeruk_faisal' | 'salak' | 'naga';

export type OrderStatus = 'menunggu' | 'diproses' | 'selesai' | 'dibatalkan';

export interface OrderItem {
  id: string;
  fruitType: FruitType;
  fruitName: string; // "Jeruk Gina", "Jeruk Faisal", "Salak", "Buah Naga"
  size: string; // "AB", "C", "DTOP", "DR", "DK", "A", "B", "Standar"
  petiCount: number; // Jumlah Peti
}

export interface FruitOrder {
  id: string;
  orderNumber: string; // e.g. "ORD-001"
  customerName: string; // Nama Pemesan / Pembeli
  customerPhone?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  items: OrderItem[];
  totalPeti: number; // Total peti dari semua item
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export interface FruitCatalogItem {
  id: FruitType;
  name: string;
  shortName: string;
  sizes: string[];
  description: string;
  colorBadge: string;
  icon: string;
}

export type StockMap = Record<string, number>; // e.g. "jeruk_gina__AB": 50
