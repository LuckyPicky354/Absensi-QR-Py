
# Absensi QR LAN

Aplikasi **Absensi QR** adalah sistem absensi peserta berbasis QR code yang berjalan di jaringan LAN, menggunakan backend Python FastAPI + SQLite dan frontend HTML/JS. Peserta melakukan scan QR via browser (HP/laptop), data absensi otomatis tervalidasi waktu & sesi, serta tersedia dashboard admin untuk manajemen peserta, sesi, dan laporan.

---

## Fitur Utama
- **Absensi via QR code** (scan dari browser HP/laptop)
- **Validasi waktu & sesi** (tepat waktu/terlambat)
- **Prevent double scan** (1x absen per sesi)
- **Manajemen peserta** (CRUD + auto generate QR)
- **Manajemen sesi** (CRUD)
- **Dashboard laporan** (filter, ekspor CSV)
- **Tanpa login admin** (akses dashboard via URL di LAN)
- **Berbasis LAN** (tidak butuh internet)
- **🆕 Auto-recovery QR code** (otomatis perbaiki QR code yang hilang)

---

## Struktur Folder

```
server/   # Backend FastAPI + SQLite
client/   # Frontend HTML/JS/CSS
```

---

## Cara Menjalankan Backend (Server)

1. **Aktifkan virtual environment** (jika belum):
   ```
   venv\Scripts\activate
   ```
2. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```
3. **Buat file konfigurasi database `.env` di folder `server/`:**
   - Contoh isi file `.env`:
     ```
     DATABASE_URL=sqlite:///../database.db
     ```
   - Untuk MySQL/Postgres, sesuaikan format dan IP-nya.
4. **Jalankan server FastAPI agar bisa diakses dari device lain:**
   ```
   uvicorn server.app:app --host 0.0.0.0 --port 8000 --reload
   ```
   - Server berjalan di: `http://[IP_SERVER]:8000` (misal: `http://192.168.1.10:8000`)

### Database (SQLite)
- Database otomatis dibuat di `database.db` saat server dijalankan.
- Tidak perlu setup manual, semua tabel akan dibuat otomatis.

---

## Cara Menjalankan Frontend (Client)

1. **Jalankan server static untuk frontend**
   - **Pakai Python:**
     - Buka terminal di folder `client/`
     - Jalankan:
       ```
       python -m http.server 8080
       ```
     - Akses di browser: `http://localhost:8080/index.html`
   - **Atau pakai Live Server (VSCode):**
     - Klik kanan `index.html` → "Open with Live Server"

2. **Pengaturan BASE_URL untuk API**
   - Edit file `client/js/env.js`:
     ```js
     window.BASE_URL = 'http://192.168.1.10:8000'; // Ganti dengan IP server Anda
     ```
   - Semua request client akan otomatis mengarah ke IP server yang Anda set di sini.
   - Tidak perlu edit hardcode IP di file JS lain.

3. **Akses dari device lain di LAN:**
   - Pastikan device terhubung ke jaringan yang sama dengan server
   - Akses: `http://[IP_SERVER]:8080/index.html` dari browser device lain

---

## Menjalankan Server dengan HTTPS (Agar Kamera Bisa Diakses di Browser)

1. **Install OpenSSL di Windows:**
   - Download dari: https://slproweb.com/products/Win32OpenSSL.html
   - Install dan tambahkan folder `bin` ke PATH agar bisa dipanggil dari Command Prompt.

2. **Generate sertifikat SSL self-signed:**
   - Buka Command Prompt di folder `server/` atau root project.
   - Jalankan perintah berikut:
     ```
     openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
     ```
   - Isi data yang diminta (bebas, untuk lokal).
   - Akan terbentuk file `key.pem` dan `cert.pem`.

3. **Jalankan server dengan SSL:**
   ```
   uvicorn server.app:app --host 0.0.0.0 --port 8000 --reload --ssl-keyfile=key.pem --ssl-certfile=cert.pem
   ```

4. **Akses aplikasi dari device lain dengan protokol HTTPS:**
   - Contoh: `https://192.168.1.10:8000`
   - Browser akan muncul warning "Not Secure" (karena self-signed), klik "Advanced" → "Proceed".
   - Kamera di browser akan bisa diakses.

---

## Format Database & CSV

- **peserta:** id, nama, alamat, kelompok, status
- **sesi:** id, nama_sesi, tanggal, tanggal_akhir, mulai, akhir
- **kehadiran:** id, peserta_id, sesi_id, timestamp, status
- **CSV laporan:**
  ```
  ID,NAMA,ALAMAT,KELOMPOK,TANGGAL,SESI,WAKTU_ABSEN,STATUS
  ```

---

## Catatan
- Tidak perlu login admin, dashboard hanya bisa diakses di LAN
- QR code = ID peserta (otomatis dibuat saat tambah peserta)
- Semua data tersimpan di SQLite lokal
- Untuk akses kamera di browser dari device lain, **WAJIB** menggunakan protokol HTTPS (lihat instruksi SSL di atas)

---

**Dibuat untuk kebutuhan absensi sederhana, ringan, dan mudah digunakan di lingkungan lokal/LAN.** 

---

## 🆕 Fitur Auto-Recovery QR Code

Aplikasi sekarang memiliki sistem auto-recovery untuk QR code yang hilang:

### ✅ **Fitur Baru:**
- **Pengecekan otomatis** saat server startup
- **Regenerate QR code** yang hilang secara otomatis
- **Cleanup file** QR code yang tidak terpakai
- **API endpoints** untuk regenerate QR code manual
- **Log monitoring** yang detail

### 🔧 **Cara Kerja:**
1. Saat server startup, sistem mengecek semua QR code
2. Jika ada QR code yang hilang, otomatis dibuat ulang
3. File QR code yang tidak terpakai dibersihkan
4. Log detail ditampilkan di console

### 📋 **Endpoint API Baru:**
- `POST /peserta/regenerate-qr` - Regenerate semua QR code
- `POST /peserta/{id}/regenerate-qr` - Regenerate QR code peserta tertentu

### 📖 **Dokumentasi Lengkap:**
Lihat file `QR_CODE_MANAGEMENT.md` untuk dokumentasi detail sistem QR code.

---