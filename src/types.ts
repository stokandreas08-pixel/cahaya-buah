export type PaymentStatus = 'lunas' | 'belum_dibayar';

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
