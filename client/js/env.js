window.BASE_URL = 'https://192.168.0.7:8000'; // isikan IP Server

// Konfigurasi kredensial login sederhana (client-side only)
// PERINGATAN: Jangan gunakan untuk produksi. Hanya untuk kebutuhan lokal/demonstrasi.
window.AUTH_USERS = [
  // Contoh akun admin (akses semua halaman)
  { username: 'admin', password: 'admin123', role: 'admin' },
  // Contoh akun scanner (hanya bisa akses manual.html dan scan.html)
  { username: 'scanner', password: 'scan123', role: 'scanner' }
];

// Opsi halaman redirect per role (opsional)
window.ROLE_HOME = {
  admin: 'menu.html',
  scanner: 'scan.html'
};