const BASE_URL = window.BASE_URL || 'http://127.0.0.1:8000';
const API_ABSEN = `${BASE_URL}/absen`;
const API_SESI = `${BASE_URL}/sesi`;
const sesiInfoDiv = document.getElementById('sesi-info');
const statusDiv = document.getElementById('status');

// Fungsi konversi waktu 24 jam ke 12 jam
function to12HourFormat(time24) {
    if (!time24) return '';
    const [hour, minute] = time24.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${minute} ${ampm}`;
}

// Tampilkan info sesi aktif
async function loadSesiAktif() {
    const res = await fetch(API_SESI);
    const data = await res.json();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const jam = now.toTimeString().slice(0,5);
    
    // Perbaiki logika pengecekan range tanggal
    const sesi = data.find(s => {
        const tglMulai = new Date(s.tanggal);
        const tglAkhir = new Date(s.tanggal_akhir || s.tanggal);
        const today = new Date(todayStr);
        
        // Reset jam ke 00:00:00 untuk perbandingan tanggal yang akurat
        tglMulai.setHours(0,0,0,0);
        tglAkhir.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        
        return today >= tglMulai && 
               today <= tglAkhir && 
               jam >= s.mulai.slice(0,5) && 
               jam <= s.akhir.slice(0,5);
    });
    
    if (sesi) {
        sesiInfoDiv.innerHTML = `<b>Sesi Aktif:</b> ${sesi.nama_sesi}<br>Waktu: ${to12HourFormat(s.mulai)} - ${to12HourFormat(s.akhir)}<br>Toleransi Absen: <b>${sesi.toleransi_absen} menit</b>`;
    } else {
        sesiInfoDiv.innerHTML = '<span style="color:#e67e22">Tidak ada sesi aktif saat ini</span>';
    }
}

function showStatus(msg, color) {
    statusDiv.innerHTML = msg;
    statusDiv.style.color = color || '#222';
}

// Tentukan ukuran qrbox responsif
function getQrBoxSize() {
    const width = window.innerWidth;
    if (width < 500) {
        return Math.floor(width * 0.95); // 95% lebar layar untuk smartphone
    } else {
        return 400; // lebih besar untuk desktop/tablet
    }
}

// Konfigurasi scanner dengan fps lebih tinggi dan resolusi kamera tinggi
const scannerConfig = {
    fps: 20, // lebih responsif
    qrbox: getQrBoxSize(),
    aspectRatio: 1.0,
    videoConstraints: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 }
    }
};

const html5QrcodeScanner = new Html5QrcodeScanner(
    "qr-reader", scannerConfig
);
html5QrcodeScanner.render(onScanSuccess);

// Tampilkan tips jika QR tidak terdeteksi dalam 5 detik
let scanTimeout = setTimeout(() => {
    showStatus('QR code belum terdeteksi? Pastikan QR jelas, tidak silau, dan kamera fokus.', '#e67e22');
}, 5000);

// Tambahkan fungsi playSound agar bisa dipakai di sini
function playSound(filename) {
    const audio = new Audio(`sound/${filename}`);
    audio.play();
}

function onScanSuccess(decodedText, decodedResult) {
    clearTimeout(scanTimeout);
    // Mainkan suara saat QR terdeteksi
    playSound('beep.mp3'); // Ganti dengan nama file sesuai file sound Anda
    // decodedText = ID peserta
    showStatus('Memproses absensi...', '#888');
    fetch(API_ABSEN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peserta_id: decodedText })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'Tepat Waktu') {
            showStatus(
                `Absen untuk <b>${data.nama}</b> <span style="color:green">BERHASIL</span>.<br>waktu absen <b>${data.waktu_absen}</b><br><span style="color:green">ANDA TEPAT WAKTU</span>`,
                'green'
            );
        } else if (data.status === 'Terlambat') {
            showStatus(
                `Absen untuk <b>${data.nama}</b> <span style="color:green">BERHASIL</span>.<br>waktu absen <b>${data.waktu_absen}</b><br><span style="color:orange">ANDA TERLAMBAT</span>`,
                'orange'
            );
        } else if (data.status === 'Sudah Absen') {
            showStatus(
                `<b>${data.nama}</b> sudah absen`,
                'red'
            );
        } else {
            showStatus('❌ ' + (data.status || 'Gagal absen'), 'red');
        }
    })
    .catch(() => showStatus('❌ Gagal menghubungi server', 'red'));
    // Stop scanning sementara (biar tidak double scan)
    html5QrcodeScanner.clear();
    setTimeout(() => window.location.reload(), 3000);
}

// Inisialisasi info sesi aktif
document.addEventListener('DOMContentLoaded', loadSesiAktif);