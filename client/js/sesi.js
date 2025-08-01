const BASE_URL = window.BASE_URL || 'http://127.0.0.1:8000';
const API_URL = `${BASE_URL}/sesi`;

const form = document.getElementById('sesi-form');
const idInput = document.getElementById('sesi-id');
const namaInput = document.getElementById('nama_sesi');
const tanggalInput = document.getElementById('tanggal');
const tanggalAkhirInput = document.getElementById('tanggal_akhir');
const mulaiInput = document.getElementById('mulai');
const akhirInput = document.getElementById('akhir');
const toleransiInput = document.getElementById('toleransi_absen');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const tableBody = document.querySelector('#sesi-table tbody');

// Format jam ke 12 jam AM/PM
function formatJam(jam) {
    if (!jam) return '';
    // jam: "HH:MM"
    const [h, m] = jam.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
}

// Fungsi format tanggal ke dd-mm-yy
function formatTanggalDDMMYY(tanggalStr) {
    if (!tanggalStr) return '';
    // Asumsi input yyyy-mm-dd
    const [y, m, d] = tanggalStr.split('-');
    return `${d}-${m}-${y.slice(2)}`;
}

// Fetch dan tampilkan data sesi
async function loadSesi() {
    const res = await fetch(API_URL);
    const data = await res.json();
    tableBody.innerHTML = '';
    data.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${s.id}</td>
            <td>${s.nama_sesi}</td>
            <td>${formatTanggalDDMMYY(s.tanggal)}</td>
            <td>${formatTanggalDDMMYY(s.tanggal_akhir)}</td>
            <td>${formatJam(s.mulai)}</td>
            <td>${formatJam(s.akhir)}</td>
            <td>${s.toleransi_absen} menit</td>
            <td>
                <button onclick="editSesi(${s.id}, '${s.nama_sesi}', '${s.tanggal}', '${s.tanggal_akhir}', '${s.mulai}', '${s.akhir}', ${s.toleransi_absen})">Edit</button>
                <button class="btn-hapus" onclick="deleteSesi(${s.id})">Hapus</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Tambah/Update sesi
form.onsubmit = async (e) => {
    e.preventDefault();
    const id = idInput.value;
    const data = {
        nama_sesi: namaInput.value,
        tanggal: tanggalInput.value,
        tanggal_akhir: tanggalAkhirInput.value,
        mulai: mulaiInput.value,
        akhir: akhirInput.value,
        toleransi_absen: parseInt(toleransiInput.value) || 0
    };
    if (id) {
        // Update
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } else {
        // Tambah
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }
    form.reset();
    idInput.value = '';
    submitBtn.textContent = 'Tambah';
    loadSesi();
};

// Edit sesi
window.editSesi = (id, nama_sesi, tanggal, tanggal_akhir, mulai, akhir, toleransi_absen) => {
    idInput.value = id;
    namaInput.value = nama_sesi;
    tanggalInput.value = tanggal;
    tanggalAkhirInput.value = tanggal_akhir;
    mulaiInput.value = mulai;
    akhirInput.value = akhir;
    toleransiInput.value = toleransi_absen;
    submitBtn.textContent = 'Update';
};

// Hapus sesi
window.deleteSesi = async (id) => {
    if (confirm('Yakin hapus sesi?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadSesi();
    }
};

// Reset form
resetBtn.onclick = () => {
    form.reset();
    idInput.value = '';
    toleransiInput.value = 0;
    submitBtn.textContent = 'Tambah';
};

// Inisialisasi
loadSesi(); 