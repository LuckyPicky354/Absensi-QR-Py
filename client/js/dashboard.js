// Tambahkan di paling atas
// Jika ada window.BASE_URL dari env.js, gunakan itu, jika tidak fallback ke default
const BASE_URL = window.BASE_URL || 'http://127.0.0.1:8000';
const API_ABSENSI = `${BASE_URL}/absensi`;
const API_SESI = `${BASE_URL}/sesi`;
const API_CSV = `${BASE_URL}/report`;

const filterForm = document.getElementById('filter-form');
const tanggalInput = document.getElementById('filter-tanggal');
const sesiSelect = document.getElementById('filter-sesi');
const resetBtn = document.getElementById('reset-filter');
const exportBtn = document.getElementById('export-csv');
const tableBody = document.querySelector('#laporan-table tbody');
const hapusSemuaBtn = document.getElementById('hapus-semua-absensi');

// Format waktu absen agar mudah dibaca (12 jam, AM/PM, hh:mm:ss)
function formatWaktu(waktu) {
    if (!waktu) return '';
    const d = new Date(waktu);
    if (!isNaN(d)) {
        let hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const seconds = d.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 jadi 12
        const hh = hours.toString().padStart(2, '0');
        return `${hh}:${minutes}:${seconds} ${ampm}`;
    }
    // Fallback: potong T dan ambil jam
    return waktu.replace('T', ' ').split(' ')[1] || waktu;
}

// Fungsi format tanggal ke dd-mm-yy
function formatTanggalDDMMYY(tanggalStr) {
    if (!tanggalStr) return '';
    // Asumsi input yyyy-mm-dd
    const [y, m, d] = tanggalStr.split('-');
    return `${d}-${m}-${y.slice(2)}`;
}

// Load sesi untuk filter
async function loadSesi() {
    const res = await fetch(API_SESI);
    const data = await res.json();
    data.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.nama_sesi + ' (' + s.tanggal + (s.tanggal_akhir ? ' s/d ' + s.tanggal_akhir : '') + ')';
        sesiSelect.appendChild(opt);
    });
}

// Load laporan absensi
async function loadLaporan() {
    let url = API_ABSENSI;
    const params = [];
    if (tanggalInput.value) params.push('tanggal=' + tanggalInput.value);
    if (sesiSelect.value) params.push('sesi_id=' + sesiSelect.value);
    if (params.length) url += '?' + params.join('&');
    const res = await fetch(url);
    const data = await res.json();
    tableBody.innerHTML = '';
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#888;">Belum ada data absensi peserta</td></tr>';
        return;
    }
    data.forEach(l => {
        const tr = document.createElement('tr');
        let statusCell = l.status;
        if (l.status === 'Terlambat') {
            statusCell = `<span style="color:#e74c3c;font-weight:bold;">${l.status}</span>`;
        }
        else if (l.status === 'Tepat Waktu') {
            statusCell = `<span style="color:#27ae60;font-weight:bold;">${l.status}</span>`;
        }
        tr.innerHTML = `
            <td>${l.id}</td>
            <td>${l.nama}</td>
            <td>${l.alamat}</td>
            <td>${l.kelompok}</td>
            <td>${formatTanggalDDMMYY(l.tanggal)}</td>
            <td>${l.sesi}</td>
            <td>${formatWaktu(l.waktu_absen)}</td>
            <td>${statusCell}</td>
            <td><button class="btn-hapus" onclick="deleteAbsensi(${l.id})" style="margin-top:4px;">Hapus</button></td>
        `;
        tableBody.appendChild(tr);
    });
}

// Filter form submit
filterForm.onsubmit = e => {
    e.preventDefault();
    loadLaporan();
};

// Reset filter
resetBtn.onclick = () => {
    tanggalInput.value = '';
    sesiSelect.value = '';
    loadLaporan();
};

// Ekspor CSV
exportBtn.onclick = () => {
    let url = API_CSV;
    const params = [];
    if (tanggalInput.value) params.push('tanggal=' + tanggalInput.value);
    if (sesiSelect.value) params.push('sesi_id=' + sesiSelect.value);
    if (params.length) url += '?' + params.join('&');
    window.open(url, '_blank');
};

// Hapus absensi
window.deleteAbsensi = async function(id) {
    if (confirm('Yakin ingin menghapus data absensi ini?')) {
        await fetch(`${BASE_URL}/absensi/${id}`, { method: 'DELETE' });
        loadLaporan();
    }
}

// Hapus semua absensi
hapusSemuaBtn.onclick = async () => {
    if (confirm('Yakin ingin menghapus SEMUA data absensi? Tindakan ini tidak bisa dibatalkan!')) {
        const res = await fetch(`${BASE_URL}/absensi/all`, { method: 'DELETE' });
        const data = await res.json();
        if (data.ok) {
            alert('Semua data absensi berhasil dihapus!');
            loadLaporan();
        } else {
            alert('Gagal menghapus semua data absensi!');
        }
    }
};

// Inisialisasi
loadSesi().then(loadLaporan); 