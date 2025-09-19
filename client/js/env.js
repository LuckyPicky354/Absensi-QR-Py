window.BASE_URL = 'https://192.168.0.7:8000'; // isikan IP Server

window.AUTH_USERS = [
  // role 'admin' bisa akses semua halaman, role 'scanner' hanya bisa akses halaman scan dan absen manual
  { username: 'admin', password: 'admin', role: 'admin' },
  { username: 'scanner', password: 'scan', role: 'scanner' }
];

// Opsi halaman redirect per role (opsional)
window.ROLE_HOME = {
  admin: 'menu.html',
  scanner: 'scan.html'
};