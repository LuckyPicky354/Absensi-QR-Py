# Sistem Manajemen QR Code Otomatis

## 🎯 **Masalah yang Dipecahkan**
Aplikasi Absensi QR sebelumnya memiliki masalah dimana jika file QR code PNG terhapus atau hilang dari folder `server/static/qr_codes/`, aplikasi tidak bisa menampilkan QR code tersebut.

## ✅ **Solusi yang Diterapkan**

### 1. **Pengecekan Otomatis Saat Startup**
- Server akan mengecek semua QR code saat startup
- Jika ada QR code yang hilang, akan dibuat ulang secara otomatis
- Membersihkan file QR code yang tidak terpakai (orphaned files)

### 2. **Fungsi Utility Baru**
File: `server/utils/qr_generator.py`

#### Fungsi yang Tersedia:
- `generate_qr_code(peserta_id)` - Generate QR code untuk peserta tertentu
- `check_and_regenerate_qr_codes(db)` - Cek dan regenerate semua QR code yang hilang
- `cleanup_orphaned_qr_files(db)` - Bersihkan file QR code yang tidak terpakai

### 3. **Endpoint API Baru**
- `POST /peserta/regenerate-qr` - Regenerate semua QR code yang hilang
- `POST /peserta/{id}/regenerate-qr` - Regenerate QR code untuk peserta tertentu
- `GET /peserta/{id}/qr` - Sekarang otomatis generate QR code jika hilang

## 🔧 **Cara Kerja**

### Saat Server Startup:
```
🚀 Server Absensi QR sedang startup...
🔍 Memulai pengecekan QR code...
✅ QR code ada untuk peserta ID: 1 (John Doe)
⚠️ QR code hilang untuk peserta ID: 2 (Jane Smith)
✅ QR code berhasil dibuat untuk peserta ID: 2
🧹 Memulai pembersihan file QR code yang tidak terpakai...
📊 Pembersihan selesai: 0 file tidak terpakai dihapus
✅ Startup selesai! Server siap digunakan.
```

### Log Output:
- ✅ QR code ada
- ⚠️ QR code hilang (akan dibuat ulang)
- 🗑️ File tidak terpakai dihapus
- 📊 Laporan hasil pengecekan

## 📁 **Struktur File Baru**

```
server/
├── utils/
│   ├── __init__.py
│   └── qr_generator.py          # Utility functions untuk QR code
├── static/
│   └── qr_codes/               # Folder penyimpanan QR code PNG
├── app.py                      # Startup event ditambahkan
└── routes/
    └── peserta_routes.py       # Endpoint baru ditambahkan
```

## 🚀 **Cara Menggunakan**

### 1. **Otomatis (Saat Server Startup)**
Server akan otomatis mengecek dan membuat ulang QR code yang hilang saat dijalankan:
```bash
uvicorn server.app:app --host 0.0.0.0 --port 8000 --reload
```

### 2. **Manual via API**
```bash
# Regenerate semua QR code
curl -X POST http://localhost:8000/peserta/regenerate-qr

# Regenerate QR code untuk peserta tertentu
curl -X POST http://localhost:8000/peserta/1/regenerate-qr
```

### 3. **Otomatis saat Akses QR Code**
Ketika mengakses `GET /peserta/{id}/qr`, jika QR code hilang akan otomatis dibuat ulang.

## 🛡️ **Fitur Keamanan**

1. **Validasi Peserta**: QR code hanya dibuat untuk peserta yang ada di database
2. **Error Handling**: Jika gagal membuat QR code, akan ada log error yang jelas
3. **Cleanup Otomatis**: File QR code yang tidak terpakai akan dihapus otomatis
4. **Folder Creation**: Folder `qr_codes` akan dibuat otomatis jika belum ada

## 📊 **Monitoring**

Sistem akan memberikan laporan lengkap:
- Total peserta dalam database
- Jumlah QR code yang hilang
- Jumlah QR code yang berhasil dibuat ulang
- Jumlah file tidak terpakai yang dihapus

## 🔄 **Maintenance**

### Untuk Menambah Peserta Baru:
- QR code akan otomatis dibuat saat endpoint `POST /peserta` dipanggil

### Untuk Menghapus Peserta:
- QR code akan otomatis dihapus saat endpoint `DELETE /peserta/{id}` dipanggil

### Untuk Backup/Restore:
- Backup folder `server/static/qr_codes/` bersama database
- Saat restore, server akan otomatis mengecek dan membuat ulang QR code yang hilang

## 🎉 **Keuntungan**

1. **Zero Downtime**: QR code hilang tidak akan mengganggu operasional
2. **Self-Healing**: Sistem otomatis memperbaiki diri sendiri
3. **Monitoring**: Log yang jelas untuk troubleshooting
4. **Modular**: Kode terpisah dan mudah di-maintain
5. **API Ready**: Bisa dipanggil via API untuk maintenance manual 