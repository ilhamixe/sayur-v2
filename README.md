# SayurV2 — Sayuran Segar Langsung dari Petani Sukabumi

E-commerce sayuran segar full-stack dengan notifikasi WhatsApp otomatis, admin dashboard, multi-kurir, dan sistem klaim order.

## Fitur Utama

- **Katalog Produk** — 14+ produk sayuran, buah, bumbu, paket masak dengan pencarian & filter kategori
- **Keranjang & Checkout** — Checkout dengan pemilihan slot antar, metode pembayaran (QRIS/Transfer/COD), voucher diskon
- **Peta Delivery** — Pelanggan pilih lokasi di peta (Leaflet/OpenStreetMap), gambar area polygon, deteksi di luar area (+Rp10.000)
- **Voucher Diskon** — Admin kelola voucher (kode, diskon %, min belanja, aktif/nonaktif)
- **Multi-Kurir** — Daftar kurir dengan nama, nomor HP, lokasi base. Order di-broadcast ke semua kurir, siapa cepat dia dapat
- **Klaim via Chat** — Kurir kirim `#ORDER-ID Klaim` di WhatsApp → otomatis assign + kirim rute Google Maps
- **Admin Dashboard** — Pesanan, Produk, Supplier, Voucher, Pengaturan (termasuk upload QRIS, area polygon, daftar kurir)
- **Order Stats** — Grafik pendapatan, filter tanggal, export Excel
- **WhatsApp Notifikasi** — Pesan otomatis ke supplier (per item) + kurir (rute pengiriman)

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS 4 |
| Backend | Node.js, Express, SQLite (better-sqlite3) |
| WhatsApp | Baileys (whatsapp-web.js alternative) |
| Peta | Leaflet + OpenStreetMap |
| Realtime | Socket.IO (QR & status updates) |
| Deploy | PM2, Nginx reverse proxy, Cloudflare Tunnel |

## Persiapan

### 1. Clone & Install

```bash
# Clone kedua repo
git clone https://github.com/ilhamixe/wa-notify.git
git clone https://github.com/ilhamixe/sayur-v2.git

# Install wa-notify
cd wa-notify
npm install

# Install sayur-v2
cd ../sayur-v2
npm install
```

### 2. Setup wa-notify

```bash
cd wa-notify
cp .env.example .env
```

Edit `.env`:

```bash
# Port (bind ke localhost, akses publik lewat reverse proxy)
PORT=3201

# Token API (generate: openssl rand -hex 32)
API_TOKEN=isi_token_disini

# Origin frontend yang diizinkan
ALLOWED_ORIGINS=http://localhost:3000

# Database & session
DB_PATH=./data.db
SESSION_DIR=./sessions

# Aktifkan WhatsApp
WA_ENABLED=1

NODE_ENV=development
```

Jalankan:
```bash
node src/index.js
# Server jalan di http://127.0.0.1:3201
```

### 3. Setup sayur-v2

```bash
cd sayur-v2
cp .env.example .env.local
```

Edit `.env.local`:

```bash
# URL wa-notify
WA_NOTIFY_URL=http://127.0.0.1:3201

# Token (sama dengan API_TOKEN di wa-notify)
WA_NOTIFY_TOKEN=isi_token_disini

# Password admin dashboard
ADMIN_PASSWORD=sayur2026
```

Jalankan:
```bash
npm run dev
# Buka http://localhost:3000
```

### 4. Hubungkan WhatsApp

1. Buka admin dashboard: `http://localhost:3000/admin`
2. Login dengan password yang sudah diset
3. Tab **Pengaturan** → bagian **WhatsApp Connection**
4. Pilih metode koneksi:
   - **Pairing Code** — Masukkan nomor HP, dapat kode 8 digit, buka WhatsApp → Linked Device → Enter Code
   - **QR Code** — Scan QR dari WhatsApp → Linked Device
5. Tunggu status jadi **Connected** (hijau)

### 5. Konfigurasi Awal

Setelah WhatsApp terhubung, atur di tab **Pengaturan**:

| Pengaturan | Deskripsi |
|-----------|-----------|
| **Nama Toko** | Nama yang muncul di pesan WhatsApp |
| **Daftar Kurir** | Tambah kurir: nama, nomor HP, lat/lng base |
| **Area Pengiriman** | Gambar polygon di peta atau set center+radius |
| **Metode Pembayaran** | Aktifkan/nonaktifkan QRIS, Transfer, COD |
| **QRIS** | Upload foto QRIS stiker |

## Struktur Project

```
sayur-v2/
├── app/
│   ├── admin/              # Dashboard admin
│   │   ├── AdminDashboard.tsx
│   │   └── tabs/
│   │       ├── OrdersTab.tsx
│   │       └── SettingsTab.tsx
│   ├── api/                # API routes (proxy ke wa-notify)
│   │   ├── orders/
│   │   ├── products/
│   │   ├── settings/
│   │   ├── upload/
│   │   ├── vouchers/
│   │   └── wa/
│   ├── components/         # React components
│   │   ├── CartDrawer.tsx
│   │   ├── CheckoutModal.tsx
│   │   ├── DeliveryZoneEditor.tsx
│   │   ├── Hero.tsx
│   │   ├── MapPicker.tsx
│   │   ├── ProductManager.tsx
│   │   └── VoucherManager.tsx
│   ├── data/
│   │   └── products.ts     # fetchProducts(), fetchVouchers(), kategori
│   ├── lib/
│   │   └── waNotify.ts     # Server-side client ke wa-notify
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   └── page.tsx            # Halaman utama customer

wa-notify/
├── src/
│   ├── db.js               # SQLite schema, queries, seed data
│   ├── index.js            # Express server, route registration
│   ├── IncomingChat.js     # Parser chat WhatsApp (status update + klaim)
│   ├── dispatch.js         # Group items by supplier, broadcast ke kurir
│   ├── templates.js        # Template pesan WhatsApp
│   ├── WaSession.js        # Baileys WhatsApp session
│   ├── outbox.js           # Outbox worker (kirim pesan antrean)
│   ├── validate.js         # Validator order, supplier
│   └── routes/
│       ├── notify.js       # POST checkout, PUT status
│       ├── products.js     # CRUD produk
│       ├── suppliers.js    # CRUD supplier + multi-mapping
│       ├── vouchers.js     # CRUD voucher
│       ├── settings.js     # GET/PUT settings
│       ├── upload.js       # Image upload
│       └── wa.js           # WA control (status, QR, pair)
```

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/notify` | Checkout → kirim notifikasi ke supplier + kurir |
| `GET` | `/api/orders` | List orders + stats |
| `PUT` | `/api/orders` | Update status order |
| `GET` | `/api/orders/revenue` | Statistik pendapatan |
| `GET/POST` | `/api/products` | List/Create produk |
| `PUT/DELETE` | `/api/products/:id` | Update/Hapus produk |
| `GET/POST` | `/api/vouchers` | List/Create voucher |
| `PUT/DELETE` | `/api/vouchers/:id` | Update/Hapus voucher |
| `GET/POST` | `/api/suppliers` | List/Create supplier |
| `PUT/DELETE` | `/api/suppliers/:id` | Update/Hapus supplier |
| `GET/PUT` | `/api/settings` | Baca/Update pengaturan |
| `POST` | `/api/upload` | Upload gambar |
| `GET` | `/api/wa/status` | Status koneksi WA |
| `GET` | `/api/health` | Health check |

## Alur Order

```
Customer Checkout
       ↓
POST /api/notify
       ↓
Item dipetakan ke supplier (per produk, fallback per kategori)
       ↓
Pesan masuk ke tabel outbox
       ↓
Outbox worker kirim ke supplier via WhatsApp
       ↓
Order di-broadcast ke semua kurir (dengan jarak)
       ↓
Kurir kirim "#ORDER-ID Klaim" di WhatsApp
       ↓
Order diassign ke kurir pertama yang klaim
       ↓
Kurir dapat rute Google Maps ke pelanggan
       ↓
Kurir lain dapat notifikasi "sudah diklaim"
```

## License

MIT
