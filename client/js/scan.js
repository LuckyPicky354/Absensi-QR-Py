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
    try {
        console.log('Loading sesi aktif...');
        
        // Pastikan elemen sesi-info ada
        if (!sesiInfoDiv) {
            console.error('Elemen sesi-info tidak ditemukan!');
            return;
        }
        
        // Tampilkan loading state
        sesiInfoDiv.innerHTML = '<span style="color:#888">Memuat informasi sesi...</span>';
        
        const res = await fetch(API_SESI);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Data sesi:', data);
        
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const jam = now.toTimeString().slice(0,5);
        
        console.log('Waktu sekarang:', { todayStr, jam });
        
        // Perbaiki logika pengecekan range tanggal
        const sesi = data.find(s => {
            const tglMulai = new Date(s.tanggal);
            const tglAkhir = new Date(s.tanggal_akhir || s.tanggal);
            const today = new Date(todayStr);
            
            // Reset jam ke 00:00:00 untuk perbandingan tanggal yang akurat
            tglMulai.setHours(0,0,0,0);
            tglAkhir.setHours(0,0,0,0);
            today.setHours(0,0,0,0);
            
            const isTanggalValid = today >= tglMulai && today <= tglAkhir;
            const isWaktuValid = jam >= s.mulai.slice(0,5) && jam <= s.akhir.slice(0,5);
            
            console.log(`Sesi ${s.nama_sesi}:`, {
                tanggal: s.tanggal,
                tanggal_akhir: s.tanggal_akhir,
                mulai: s.mulai,
                akhir: s.akhir,
                isTanggalValid,
                isWaktuValid
            });
            
            return isTanggalValid && isWaktuValid;
        });
        
        if (sesi) {
            console.log('Sesi aktif ditemukan:', sesi);
            sesiInfoDiv.innerHTML = `<b>Sesi Aktif:</b> ${sesi.nama_sesi}<br>Waktu: ${to12HourFormat(sesi.mulai)} - ${to12HourFormat(sesi.akhir)}<br>Toleransi Absen: <b>${sesi.toleransi_absen} menit</b>`;
        } else {
            console.log('Tidak ada sesi aktif');
            sesiInfoDiv.innerHTML = '<span style="color:#e67e22">Tidak ada sesi aktif saat ini</span>';
        }
    } catch (error) {
        console.error('Error loading sesi aktif:', error);
        if (sesiInfoDiv) {
            sesiInfoDiv.innerHTML = '<span style="color:red">Error: Gagal memuat informasi sesi</span>';
        }
    }
}

// Fungsi format waktu notifikasi absen (sama seperti manual.js)
function formatWaktu(waktuString) {
    if (!waktuString) return '';
    
    const date = new Date(waktuString);
    let jam = date.getHours();
    const menit = date.getMinutes().toString().padStart(2, '0');
    const detik = date.getSeconds().toString().padStart(2, '0');
    const tanggal = date.getDate().toString().padStart(2, '0');
    const bulan = (date.getMonth() + 1).toString().padStart(2, '0');
    const tahun = date.getFullYear();
    
    // Konversi ke format 12 jam
    const ampm = jam >= 12 ? 'PM' : 'AM';
    jam = jam % 12;
    if (jam === 0) jam = 12;
    const jam12 = jam.toString().padStart(2, '0');
    
    return `${jam12}.${menit}.${detik} ${ampm} Tanggal ${tanggal}-${bulan}-${tahun}`;
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

// Tampilkan tips jika QR tidak terdeteksi dalam 10 detik
let scanTimeout = setTimeout(() => {
    showStatus('QR code belum terdeteksi? Pastikan QR jelas, tidak silau, dan kamera fokus.', 'red');
}, 10000);

// fungsi playSound
function playSound(filename) {
    const audio = new Audio(`sound/${filename}`);
    audio.play();
}

function onScanSuccess(decodedText, decodedResult) {
    clearTimeout(scanTimeout);
    // Mainkan suara saat QR terdeteksi
    playSound('beep.mp3');
    // decodedText = ID peserta
    showStatus('Memproses absensi...', '#888');
    fetch(API_ABSEN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peserta_id: decodedText })
    })
    .then(res => res.json())
    .then(data => {
        // Format waktu absen menggunakan fungsi baru
        const waktuAbsenFormatted = formatWaktu(data.waktu_absen);
        
        if (data.status === 'Tepat Waktu') {
            showStatus(
                `Absen untuk <b>${data.nama}</b> <span style="color:green">BERHASIL</span>.<br>waktu absen <b>${waktuAbsenFormatted}</b><br><span style="color:green">ANDA TEPAT WAKTU</span>`
            );
        } else if (data.status === 'Terlambat') {
            showStatus(
                `Absen untuk <b>${data.nama}</b> <span style="color:green">BERHASIL</span>.<br>waktu absen <b>${waktuAbsenFormatted}</b><br><span style="color:red">ANDA TERLAMBAT</span>`
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

// Inisialisasi info sesi aktif - pindahkan ke akhir file
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing scan page...');
    loadSesiAktif();
});