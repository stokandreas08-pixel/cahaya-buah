# 🍎 Pencatatan Bongkar Buah & Upah Pembungkar

Aplikasi web modern dan praktis untuk mencatat aktivitas pembongkaran buah (bungkaran) per mobil, menghitung pembagian upah bersih secara otomatis per nama pembungkar, mencetak slip tanda terima/kwitansi upah, serta merekap total pendapatan pekerja.

---

## ✨ Fitur Utama

- **📦 Pencatatan Cepat Data Bungkaran**:
  - Input kode bungkaran (contoh: `jeruk gina 01`, `semangka 02`, `apel malang 01`).
  - Input jumlah bungkaran (koli/keranjang).
  - Pilihan metode upah: Langsung per mobil atau hitung otomatis berdasarkan tarif per koli.

- **👥 Pembagian Upah Otomatis Terbagi Rata**:
  - Masukkan nama-nama pembungkar yang membongkar mobil tersebut.
  - Upah total mobil langsung dibagi rata ke seluruh nama pembungkar secara *real-time* (`Total Upah Mobil ÷ Jumlah Pembungkar`).
  - Tombol pilih cepat nama pembungkar (1 klik untuk menambah atau membatalkan nama).

- **💵 Manajemen Status Pembayaran**:
  - Status upah: **Lunas** atau **Belum Dibayar**.
  - Toggle 1 klik langsung di tabel daftar bungkaran.

- **🧾 Cetak Slip Kwitansi & Tanda Tangan**:
  - Cetak bukti tanda terima bungkaran siap print (format slip rapi).
  - Dilengkapi rincian jatah upah per orang serta kolom tanda tangan penerima upah dan kasir/petugas gudang.

- **📊 Rekap Penghasilan per Pembungkar**:
  - Modal rekapitulasi khusus untuk melihat akumulasi total penghasilan setiap pekerja dari seluruh mobil yang mereka bongkar.
  - Menampilkan jumlah mobil yang dibongkar, total upah yang didapat, status lunas, dan upah pending.

- **📥 Ekspor Data ke CSV / Excel**:
  - Ekspor seluruh riwayat pembongkaran, nama-nama pembungkar, dan pembagian upah ke format CSV yang kompatibel dengan Microsoft Excel / Google Sheets.

- **💾 Penyimpanan Otomatis (Local Storage)**:
  - Data tersimpan aman di peramban (browser) pengguna tanpa perlu konfigurasi database manual yang rumit.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: Plus Jakarta Sans & JetBrains Mono

---

## 🚀 Panduan Menjalankan Project

### 1. Prasyarat
Pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (versi 18.x atau yang lebih baru)
- npm, yarn, atau pnpm

### 2. Kloning Repository
```bash
git clone https://github.com/<username-anda>/<nama-repo>.git
cd <nama-repo>
```

### 3. Instal Dependensi
```bash
npm install
```

### 4. Jalankan Server Pengembangan (Development)
```bash
npm run dev
```
Buka peramban di `http://localhost:3000` (atau port yang tertera pada terminal).

### 5. Build untuk Produksi
```bash
npm run build
```
File hasil kompilasi yang siap di-deploy akan berada di folder `dist/`.

---

## 📁 Struktur Direktori

```text
├── public/                 # Aset statis & ikon
├── src/
│   ├── components/         # Komponen UI modular
│   │   ├── EditModal.tsx           # Dialog edit data & nama pembungkar
│   │   ├── Navbar.tsx              # Navigasi & aksi ekspor/rekap
│   │   ├── PrintSlipModal.tsx      # Modal pratinjau & cetak kwitansi
│   │   ├── RecordList.tsx          # Tabel data & filter pencarian
│   │   ├── SimpleAddForm.tsx       # Formulir input bungkaran & pembagian upah
│   │   ├── StatCards.tsx           # Kartu statistik ringkasan utama
│   │   └── WorkerSummaryModal.tsx  # Modal rekap pendapatan per pembungkar
│   ├── data/
│   │   └── initialData.ts  # Data awal / dummy bungkaran
│   ├── utils/
│   │   └── formatters.ts   # Pemformatan mata uang Rupiah & tanggal
│   ├── App.tsx             # Komponen utama & pengelolaan state
│   ├── types.ts            # Tipe TypeScript data bungkaran & pekerja
│   ├── main.tsx            # Entry point React
│   └── index.css           # Konfigurasi Tailwind CSS
├── index.html              # Entry point HTML & meta tags
├── metadata.json           # Metadata aplikasi
├── package.json            # Daftar dependensi & script build
└── README.md               # Dokumentasi proyek (file ini)
```

---

## 📝 Lisensi
Didistribusikan di bawah lisensi Apache-2.0. Silakan gunakan dan sesuaikan untuk kebutuhan operasional gudang dan pembongkaran bungkaran buah Anda.
