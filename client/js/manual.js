const BASE_URL = window.BASE_URL || 'http://127.0.0.1:8000';
const API_SESI = `${BASE_URL}/sesi`;
const API_PESERTA = `${BASE_URL}/peserta`;
const API_ABSENSI = `${BASE_URL}/absensi`;
const API_ABSEN = `${BASE_URL}/absen`;

const infoSesiDiv = document.getElementById('info-sesi');
const tableBody = document.querySelector('#laporan-table tbody');
const statusDiv = document.getElementById('status');

let sesiAktif = null;
let pesertaBelumAbsenGlobal = [];

// Fungsi format waktu notifikasi absen
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

function to12HourFormat(time24) {
    if (!time24) return '';
    const [hour, minute] = time24.split(":");
    let h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${minute} ${ampm}`;
}

async function loadSesiAktif() {
    const res = await fetch(API_SESI);
    const data = await res.json();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const jam = now.toTimeString().slice(0,5);
    sesiAktif = data.find(s => {
        const mulai = s.tanggal;
        const akhir = s.tanggal_akhir || s.tanggal;
        return todayStr >= mulai && todayStr <= akhir && jam >= s.mulai.slice(0,5) && jam <= s.akhir.slice(0,5);
    });
    if (sesiAktif) {
        infoSesiDiv.innerHTML = `<br><b>INFORMASI SESI AKTIF</b><br>------</br><br>Sesi Aktif: <b>${sesiAktif.nama_sesi}</b><br>Waktu: <b>${to12HourFormat(sesiAktif.mulai)}</b> - <b>${to12HourFormat(sesiAktif.akhir)}</b><br>Toleransi Absen: <b>${sesiAktif.toleransi_absen} menit</b>`;
    } else {
        infoSesiDiv.innerHTML = '<span style="color:#e67e22">Tidak ada sesi aktif saat ini</span>';
    }
}

async function loadPesertaBelumAbsen() {
    tableBody.innerHTML = '<tr><td colspan="5">Memuat data...</td></tr>';
    await loadSesiAktif();
    if (!sesiAktif) {
        tableBody.innerHTML = '<tr><td colspan="5">Tidak ada sesi aktif</td></tr>';
        pesertaBelumAbsenGlobal = [];
        return;
    }
    // Ambil semua peserta
    const pesertaRes = await fetch(API_PESERTA);
    const pesertaList = await pesertaRes.json();
    // Ambil absensi sesi aktif
    const absensiRes = await fetch(`${API_ABSENSI}?tanggal=${sesiAktif.tanggal}&sesi_id=${sesiAktif.id}`);
    const absensiList = await absensiRes.json();
    const sudahAbsenId = new Set(absensiList.map(a => a.id));
    // Filter peserta yang belum absen
    const belumAbsen = pesertaList.filter(p => !sudahAbsenId.has(p.id));
    pesertaBelumAbsenGlobal = belumAbsen;
    renderPesertaTable(belumAbsen);
}

function renderPesertaTable(pesertaList) {
    if (pesertaList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">Tidak ada peserta ditemukan</td></tr>';
        return;
    }
    tableBody.innerHTML = '';
    pesertaList.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nama}</td>
            <td>${p.alamat}</td>
            <td>${p.kelompok}</td>
            <td><button onclick="absenManual(${p.id}, '${p.nama}')">Absen</button></td>
        `;
        tableBody.appendChild(tr);
    });
}

// Event listener untuk search
const searchInput = document.getElementById('search-peserta');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const keyword = this.value.trim().toLowerCase();
        if (!keyword) {
            renderPesertaTable(pesertaBelumAbsenGlobal);
            return;
        }
        const filtered = pesertaBelumAbsenGlobal.filter(p =>
            p.nama.toLowerCase().includes(keyword) ||
            p.alamat.toLowerCase().includes(keyword) ||
            p.kelompok.toLowerCase().includes(keyword)
        );
        renderPesertaTable(filtered);
    });
}

window.absenManual = async (id, nama) => {
    statusDiv.textContent = `Memproses absensi untuk ${nama}...`;
    const res = await fetch(API_ABSEN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peserta_id: id })
    });
    const data = await res.json();
    
    // Menggunakan format waktu yang sudah di siapakan di atas
    const waktuAbsenFormatted = formatWaktu(data.waktu_absen);
    
    if (data.status === 'Tepat Waktu') {
        statusDiv.innerHTML = `Absen untuk <b>${data.nama}</b> <span style="color:green">BERHASIL</span>.<br>waktu absen <b>${waktuAbsenFormatted}</b><br><span style="color:green"><b>ANDA TEPAT WAKTU</b></span>`, 'green';
    } else if (data.status === 'Terlambat') {
        statusDiv.innerHTML = `Absen untuk <b>${data.nama}</b> <span style="color:green">BERHASIL</span>.<br>waktu absen <b>${waktuAbsenFormatted}</b><br><span style="color:red"><b>ANDA TERLAMBAT</b></span>`, 'orange';
    } else if (data.status === 'Sudah Absen') {
        statusDiv.innerHTML = `<b>${data.nama}</b> sudah absen`;
    } else {
        statusDiv.innerHTML = '❌ ' + (data.status || 'Gagal absen');
    }
    await loadPesertaBelumAbsen();
};

// Inisialisasi
loadPesertaBelumAbsen(); 