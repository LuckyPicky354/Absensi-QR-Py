
# Absensi QR LAN

Aplikasi **Absensi QR** adalah sistem absensi peserta berbasis QR code yang berjalan di jaringan LAN, menggunakan backend Python FastAPI + SQLite dan frontend HTML/JS. Peserta melakukan scan QR via browser (HP/laptop), data absensi otomatis tervalidasi waktu & sesi, serta tersedia dashboard admin untuk manajemen peserta, sesi, dan laporan.

## 🚀 Teknologi yang Digunakan

### Backend
- **FastAPI** - Framework web modern untuk Python
- **SQLAlchemy** - ORM untuk database operations
- **SQLite** - Database lokal (tidak perlu setup server terpisah)
- **Pydantic** - Data validation dan serialization
- **Uvicorn** - ASGI server untuk menjalankan FastAPI
- **QRCode[PIL]** - Generator QR code dengan dukungan gambar
- **Python-multipart** - File upload support
- **Python-dotenv** - Environment variables management

### Frontend
- **HTML5** - Struktur halaman web
- **CSS3** - Styling dan responsive design
- **Vanilla JavaScript** - Interaksi dan API calls
- **WebRTC API** - Akses kamera untuk scan QR
- **Fetch API** - HTTP requests ke backend

### Fitur Keamanan
- **CORS** - Cross-Origin Resource Sharing untuk akses LAN
- **HTTPS Support** - SSL/TLS untuk akses kamera browser
- **Input Validation** - Validasi data di backend dan frontend

---

## ✨ Fitur Utama

### 📱 Absensi & Validasi
- **Scan QR Code** - Absensi via browser (HP/laptop) dengan kamera
- **Validasi Waktu & Sesi** - Otomatis cek jadwal dan status (tepat waktu/terlambat)
- **Prevent Double Scan** - Mencegah absensi ganda dalam satu sesi
- **Toleransi Absen** - Konfigurasi batas waktu toleransi per sesi
- **Manual Absensi** - Input manual untuk kasus khusus

### 👥 Manajemen Data
- **Manajemen Peserta** - CRUD lengkap dengan auto-generate QR code
- **Manajemen Sesi** - CRUD dengan range tanggal dan waktu
- **Upload CSV** - Import peserta dalam batch via file CSV
- **Template CSV** - Template standar untuk upload peserta

### 📊 Dashboard & Laporan
- **Dashboard Real-time** - Tampilan data absensi terkini
- **Filter & Pencarian** - Filter berdasarkan tanggal, sesi, dan status
- **Ekspor CSV** - Download laporan dalam format CSV
- **Hapus Data** - Cleanup data absensi dan peserta

### 🔧 Sistem & Maintenance
- **Auto-Recovery QR Code** - Otomatis perbaiki QR code yang hilang
- **Cleanup Files** - Bersihkan file QR code yang tidak terpakai
- **Startup Check** - Validasi sistem saat server startup
- **Log Monitoring** - Log detail untuk debugging

### 🌐 Akses & Keamanan
- **Berbasis LAN** - Tidak memerlukan koneksi internet
- **Tanpa Login** - Akses langsung via URL (untuk kemudahan)
- **HTTPS Support** - SSL untuk akses kamera browser
- **Multi-device** - Akses dari berbagai device di jaringan yang sama

---

## 📁 Struktur Folder & Arsitektur

```
Absensi QR Py/
├── server/                    # Backend FastAPI
│   ├── app.py                # Main FastAPI application
│   ├── database/             # SQLite database files
│   │   └── database.db       # Database utama
│   ├── models/               # SQLAlchemy models
│   │   ├── peserta.py        # Model data peserta
│   │   ├── sesi.py          # Model data sesi
│   │   └── kehadiran.py     # Model data kehadiran
│   ├── routes/               # API endpoints
│   │   ├── peserta_routes.py # CRUD peserta
│   │   ├── sesi_routes.py    # CRUD sesi
│   │   └── attendance_routes.py # Absensi & laporan
│   ├── utils/                # Utility functions
│   │   ├── qr_generator.py   # Generate & manage QR codes
│   │   └── zip_generator.py  # Create ZIP files
│   └── static/               # Static files
│       └── qr_codes/         # Generated QR code images
├── client/                   # Frontend HTML/JS/CSS
│   ├── index.html           # Menu utama
│   ├── dashboard.html       # Dashboard laporan
│   ├── peserta.html         # Manajemen peserta
│   ├── sesi.html           # Manajemen sesi
│   ├── scan.html           # Scan QR code
│   ├── manual.html         # Manual absensi
│   ├── upload_peserta.html # Upload CSV peserta
│   ├── galeri_qr.html      # Galeri QR codes
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript modules
│   ├── icon/               # Icons & assets
│   ├── sound/              # Audio files
│   └── template/           # CSV templates
├── venv/                   # Python virtual environment
├── requirements.txt        # Python dependencies
└── README.md              # Dokumentasi
```

### 🏗️ Arsitektur Aplikasi

**Backend (FastAPI)**
- **RESTful API** dengan endpoint terstruktur
- **Database Layer** menggunakan SQLAlchemy ORM
- **Model Layer** untuk entitas data (Peserta, Sesi, Kehadiran)
- **Route Layer** untuk handling HTTP requests
- **Utility Layer** untuk QR code generation dan file management

**Frontend (HTML/JS)**
- **Single Page Application** dengan multiple HTML pages
- **Modular JavaScript** dengan file terpisah per fitur
- **Responsive Design** dengan CSS Grid dan Flexbox
- **Real-time Updates** menggunakan Fetch API

**Database Schema**
- **peserta**: id, nama, alamat, kelompok, status
- **sesi**: id, nama_sesi, tanggal, tanggal_akhir, mulai, akhir, toleransi_absen
- **kehadiran**: id, peserta_id, sesi_id, timestamp, status

---

## 🚀 Instalasi & Setup

### Prasyarat
- **Python 3.8+** (direkomendasikan Python 3.11+)
- **Git** (untuk clone repository)
- **Browser modern** dengan dukungan WebRTC (Chrome, Firefox, Safari, Edge)

### 1. Clone Repository
```bash
git clone https://github.com/LuckyPicky354/absnesi-python.git
cd absnesi-python
```

### 2. Setup Backend (Server)

#### A. Aktifkan Virtual Environment
```bash
# Windows
   venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
   ```

#### B. Install Dependencies
```bash
   pip install -r requirements.txt
   ```

#### C. Konfigurasi Database
Buat file `.env` di folder `server/`:
```env
# SQLite (default)
DATABASE_URL=sqlite:///./database/database.db

# Atau untuk MySQL/PostgreSQL
# DATABASE_URL=mysql://user:password@localhost/absensi_db
# DATABASE_URL=postgresql://user:password@localhost/absensi_db
```

#### D. Jalankan Server
```bash
# Mode development (dengan auto-reload)
uvicorn server.app:app --host 0.0.0.0 --port 8000 --reload

# Mode production
uvicorn server.app:app --host 0.0.0.0 --port 8000
```

**Server akan berjalan di:** `http://[IP_SERVER]:8000`
- Contoh: `http://192.168.1.10:8000`
- Cek IP server dengan: `ipconfig` (Windows) atau `ifconfig` (Linux/Mac)

### 3. Setup Frontend (Client)

#### A. Konfigurasi API URL
Edit file `client/js/env.js`:
```javascript
window.BASE_URL = 'http://192.168.1.10:8000'; // Ganti dengan IP server Anda
```

#### B. Jalankan Static Server
```bash
# Opsi 1: Python HTTP Server
cd client
python -m http.server 8080

# Opsi 2: Live Server (VSCode)
# Klik kanan index.html → "Open with Live Server"

# Opsi 3: Node.js (jika ada)
npx http-server -p 8080
```

**Frontend akan berjalan di:** `http://[IP_SERVER]:8080`
- Akses: `http://192.168.1.10:8080/index.html`

### 4. Setup HTTPS (Opsional - untuk akses kamera)

#### A. Install OpenSSL
- **Windows**: Download dari [Win32 OpenSSL](https://slproweb.com/products/Win32OpenSSL.html)
- **Linux**: `sudo apt-get install openssl`
- **Mac**: `brew install openssl`

#### B. Generate SSL Certificate
```bash
# Di folder server/
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

#### C. Jalankan Server dengan HTTPS
```bash
uvicorn server.app:app --host 0.0.0.0 --port 8000 --ssl-keyfile=key.pem --ssl-certfile=cert.pem
```

**Akses HTTPS:** `https://192.168.1.10:8000`

### 5. Verifikasi Instalasi

1. **Backend**: Buka `http://[IP_SERVER]:8000` → harus muncul JSON response
2. **Frontend**: Buka `http://[IP_SERVER]:8080` → harus muncul menu utama
3. **Database**: File `server/database/database.db` akan terbuat otomatis
4. **QR Codes**: Folder `server/static/qr_codes/` akan terbuat otomatis

### Database (SQLite)
- **Otomatis dibuat** saat server pertama kali dijalankan
- **Lokasi**: `server/database/database.db`
- **Tabel otomatis dibuat**: peserta, sesi, kehadiran
- **Tidak perlu setup manual** - semua konfigurasi sudah otomatis

---

## 📖 Panduan Penggunaan

### 1. Menu Utama
Akses `http://[IP_SERVER]:8080/index.html` untuk melihat menu utama:
- **Dashboard Laporan Absensi** - Lihat dan kelola data absensi
- **Manajemen Peserta** - Tambah, edit, hapus peserta
- **Manajemen Sesi** - Kelola jadwal dan sesi absensi
- **Scan QR (Peserta)** - Absensi via scan QR code
- **Manual Absensi** - Input absensi manual
- **Upload Peserta** - Import peserta via CSV
- **Galeri QR** - Lihat dan download QR codes

### 2. Manajemen Peserta

#### A. Tambah Peserta Baru
1. Buka **Manajemen Peserta**
2. Klik **Tambah Peserta**
3. Isi data: Nama, Alamat, Kelompok, Status
4. Klik **Simpan** - QR code otomatis terbuat

#### B. Edit/Hapus Peserta
1. Pilih peserta dari tabel
2. Klik **Edit** untuk mengubah data
3. Klik **Hapus** untuk menghapus peserta
4. **Hapus Semua** untuk reset semua peserta

#### C. Upload CSV Peserta
1. Buka **Upload Peserta**
2. Download template CSV
3. Isi data peserta di template
4. Upload file CSV
5. Data peserta akan terimport otomatis

### 3. Manajemen Sesi

#### A. Buat Sesi Baru
1. Buka **Manajemen Sesi**
2. Klik **Tambah Sesi**
3. Isi data:
   - **Nama Sesi**: Nama acara/pertemuan
   - **Tanggal Mulai**: Tanggal mulai sesi
   - **Tanggal Akhir**: Tanggal selesai sesi
   - **Waktu Mulai**: Jam mulai absensi
   - **Waktu Akhir**: Jam selesai absensi
   - **Toleransi**: Menit toleransi keterlambatan
4. Klik **Simpan**

#### B. Edit/Hapus Sesi
1. Pilih sesi dari tabel
2. Klik **Edit** untuk mengubah data
3. Klik **Hapus** untuk menghapus sesi

### 4. Absensi

#### A. Scan QR Code (Peserta)
1. Buka **Scan QR (Peserta)**
2. Izinkan akses kamera browser
3. Arahkan kamera ke QR code peserta
4. Sistem otomatis:
   - Validasi waktu dan sesi
   - Cek apakah sudah absen
   - Tentukan status (Tepat Waktu/Terlambat)
   - Simpan data absensi

#### B. Manual Absensi
1. Buka **Manual Absensi**
2. Pilih peserta dari dropdown
3. Pilih sesi dari dropdown
4. Klik **Absen Manual**
5. Data akan tersimpan dengan status "Manual"

### 5. Dashboard & Laporan

#### A. Lihat Laporan
1. Buka **Dashboard Laporan Absensi**
2. Data absensi akan tampil dalam tabel
3. Kolom: ID, Nama, Alamat, Kelompok, Tanggal, Sesi, Waktu Absen, Status

#### B. Filter Data
1. **Filter Tanggal**: Pilih tanggal tertentu
2. **Filter Sesi**: Pilih sesi tertentu
3. Klik **Terapkan Filter**
4. Klik **Reset** untuk menampilkan semua data

#### C. Ekspor Data
1. Set filter sesuai kebutuhan
2. Klik **Ekspor CSV**
3. File CSV akan terdownload otomatis
4. Format: ID, NAMA, ALAMAT, KELOMPOK, TANGGAL, SESI, WAKTU_ABSEN, STATUS

#### D. Hapus Data
1. **Hapus Absensi**: Hapus data absensi tertentu
2. **Hapus Semua Absensi**: Reset semua data absensi

### 6. Galeri QR Codes

#### A. Lihat QR Codes
1. Buka **Galeri QR**
2. Semua QR code peserta akan tampil
3. QR code = ID peserta (angka)

#### B. Download QR Codes
1. Klik **Download Semua QR** untuk download ZIP
2. Atau klik QR code individual untuk download PNG

### 7. Akses dari Device Lain

#### A. Setup Device Client
1. Pastikan device terhubung ke jaringan yang sama
2. Buka browser dan akses: `http://[IP_SERVER]:8080`
3. Untuk scan QR, gunakan HTTPS: `https://[IP_SERVER]:8080`

#### B. Troubleshooting Kamera
- **Chrome/Edge**: Harus menggunakan HTTPS
- **Firefox**: Bisa menggunakan HTTP di localhost
- **Safari**: Harus menggunakan HTTPS
- **Mobile**: Pastikan izin kamera diizinkan

### 8. Tips & Trik

#### A. Performa Optimal
- Gunakan browser terbaru (Chrome, Firefox, Safari, Edge)
- Pastikan koneksi LAN stabil
- Restart server jika ada masalah

#### B. Keamanan
- Ganti IP server sesuai jaringan Anda
- Backup database secara berkala
- Hapus data lama jika tidak diperlukan

#### C. Maintenance
- Server akan auto-recovery QR code yang hilang
- Database otomatis dibuat dan diupdate
- Log error akan tampil di console server

---

## 🔌 API Endpoints

### Peserta Management
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/peserta` | Get all peserta | - |
| `POST` | `/peserta` | Create new peserta | `{nama, alamat, kelompok, status}` |
| `PUT` | `/peserta/{id}` | Update peserta | `{nama, alamat, kelompok, status}` |
| `DELETE` | `/peserta/{id}` | Delete peserta | - |
| `DELETE` | `/peserta/hapus-semua` | Delete all peserta | - |
| `GET` | `/peserta/{id}/qr` | Get QR code image | - |
| `POST` | `/peserta/upload-csv` | Upload CSV peserta | `multipart/form-data` |
| `GET` | `/peserta/download-template` | Download CSV template | - |
| `POST` | `/peserta/regenerate-qr` | Regenerate all QR codes | - |
| `POST` | `/peserta/{id}/regenerate-qr` | Regenerate specific QR code | - |

### Sesi Management
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/sesi` | Get all sesi | - |
| `POST` | `/sesi` | Create new sesi | `{nama_sesi, tanggal, tanggal_akhir, mulai, akhir, toleransi_absen}` |
| `PUT` | `/sesi/{id}` | Update sesi | `{nama_sesi, tanggal, tanggal_akhir, mulai, akhir, toleransi_absen}` |
| `DELETE` | `/sesi/{id}` | Delete sesi | - |
| `DELETE` | `/sesi/hapus-semua` | Delete all sesi | - |

### Absensi & Laporan
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/absen` | Record attendance | `{peserta_id}` |
| `GET` | `/laporan` | Get attendance report | Query: `tanggal`, `sesi_id` |
| `GET` | `/laporan/export` | Export CSV report | Query: `tanggal`, `sesi_id` |
| `DELETE` | `/laporan/hapus/{id}` | Delete specific attendance | - |
| `DELETE` | `/laporan/hapus-semua` | Delete all attendance | - |

### QR Code Management
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/qr-codes` | Get all QR codes | - |
| `GET` | `/qr-codes/download-zip` | Download all QR codes as ZIP | - |
| `GET` | `/qr-codes/{id}` | Get specific QR code | - |

### Response Format
```json
{
  "status": "success|error",
  "message": "Description",
  "data": {...}
}
```

### Error Handling
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## 📊 Format Database & CSV

### Database Schema
- **peserta**: id, nama, alamat, kelompok, status
- **sesi**: id, nama_sesi, tanggal, tanggal_akhir, mulai, akhir, toleransi_absen
- **kehadiran**: id, peserta_id, sesi_id, timestamp, status

### CSV Export Format
  ```
  ID,NAMA,ALAMAT,KELOMPOK,TANGGAL,SESI,WAKTU_ABSEN,STATUS
1,John Doe,Jakarta,Kelompok A,2025-01-15,Sesi Pagi,08:30:00,Tepat Waktu
2,Jane Smith,Bandung,Kelompok B,2025-01-15,Sesi Pagi,08:45:00,Terlambat
```

### CSV Upload Template
```
nama,alamat,kelompok,status
John Doe,Jakarta,Kelompok A,Aktif
Jane Smith,Bandung,Kelompok B,Aktif
  ```

---

## ⚠️ Catatan Penting

### Keamanan & Akses
- **Tanpa Login**: Dashboard dapat diakses langsung via URL di LAN
- **LAN Only**: Aplikasi hanya berfungsi di jaringan lokal
- **QR Code = ID Peserta**: QR code berisi ID numerik peserta
- **Database Lokal**: Semua data tersimpan di SQLite lokal

### Persyaratan Browser
- **HTTPS Wajib**: Untuk akses kamera dari device lain
- **WebRTC Support**: Browser harus mendukung WebRTC API
- **Modern Browser**: Chrome, Firefox, Safari, Edge (versi terbaru)

### Maintenance
- **Auto-Recovery**: QR code hilang akan otomatis diperbaiki
- **Startup Check**: Sistem validasi otomatis saat server start
- **Log Monitoring**: Error dan status ditampilkan di console
- **File Cleanup**: File QR code tidak terpakai dibersihkan otomatis

### Troubleshooting Umum
- **Kamera tidak bisa akses**: Gunakan HTTPS atau localhost
- **QR code tidak muncul**: Restart server untuk auto-recovery
- **Database error**: Hapus file `database.db` untuk reset
- **Port conflict**: Ganti port 8000/8080 jika sudah digunakan

---

## 🆕 Fitur Auto-Recovery QR Code

### ✅ **Fitur Baru:**
- **Pengecekan Otomatis**: Saat server startup
- **Regenerate QR Code**: Yang hilang secara otomatis
- **Cleanup Files**: QR code yang tidak terpakai
- **API Endpoints**: Regenerate manual via API
- **Log Monitoring**: Detail untuk debugging

### 🔧 **Cara Kerja:**
1. Server startup → cek semua QR code
2. QR code hilang → otomatis dibuat ulang
3. File tidak terpakai → dibersihkan
4. Log detail → ditampilkan di console

### 📋 **API Endpoints:**
- `POST /peserta/regenerate-qr` - Regenerate semua QR code
- `POST /peserta/{id}/regenerate-qr` - Regenerate QR code tertentu

---

## 📝 Lisensi & Kredit

**Dibuat untuk kebutuhan absensi sederhana, ringan, dan mudah digunakan di lingkungan lokal/LAN.**

- **Developer**: RF Design Studio
- **GitHub**: [LuckyPicky354/absnesi-python](https://github.com/LuckyPicky354/absnesi-python)
- **Teknologi**: FastAPI + SQLite + HTML/JS
- **Tahun**: 2025

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:
1. Fork repository
2. Buat feature branch
3. Commit perubahan
4. Push ke branch
5. Buat Pull Request

---

## 📞 Support

Jika mengalami masalah:
1. Cek bagian **Troubleshooting** di atas
2. Lihat log error di console server
3. Pastikan semua prasyarat terpenuhi
4. Buat issue di GitHub repository

**Happy Coding! 🚀**