const BASE_URL = window.BASE_URL || 'http://127.0.0.1:8000';
const API_URL = `${BASE_URL}/peserta`;

const form = document.getElementById('peserta-form');
const idInput = document.getElementById('peserta-id');
const namaInput = document.getElementById('nama');
const alamatInput = document.getElementById('alamat');
const kelompokInput = document.getElementById('kelompok');
const statusInput = document.getElementById('status');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const tableBody = document.querySelector('#laporan-table tbody');
const hapusSemuaBtn = document.getElementById('hapus-semua-peserta');

let pesertaData = [];

// Fetch dan tampilkan data peserta
async function loadPeserta() {
    const res = await fetch(API_URL);
    pesertaData = await res.json();
    renderPesertaTable(pesertaData);
}

function renderPesertaTable(data) {
    tableBody.innerHTML = '';
    data.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nama}</td>
            <td>${p.alamat}</td>
            <td>${p.kelompok}</td>
            <td>${p.status}</td>
            <td>
                <button class="btn-qr" onclick="window.open('${API_URL}/${p.id}/qr', '_blank')" title="Lihat QR Code">
                  <img src="icon/qr-code.svg" alt="QR" class="icon-btn qr-white" />
                </button>
            </td>
            <td>
                <button onclick="editPeserta(${p.id}, '${p.nama}', '${p.alamat}', '${p.kelompok}', '${p.status}')">
                  <img src="icon/square-pen.svg" alt="Edit" class="icon-btn" />
                </button>
                <button class="btn-hapus" onclick="deletePeserta(${p.id})">
                  <img src="icon/trash-2.svg" alt="Hapus" class="icon-btn" />
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

const searchInput = document.getElementById('search-peserta');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const keyword = this.value.trim().toLowerCase();
        if (!keyword) {
            renderPesertaTable(pesertaData);
            return;
        }
        const filtered = pesertaData.filter(p =>
            p.nama.toLowerCase().includes(keyword) ||
            p.alamat.toLowerCase().includes(keyword) ||
            p.kelompok.toLowerCase().includes(keyword) ||
            p.status.toLowerCase().includes(keyword)
        );
        renderPesertaTable(filtered);
    });
}

// Tambah/Update peserta
form.onsubmit = async (e) => {
    e.preventDefault();
    const id = idInput.value;
    const data = {
        nama: namaInput.value,
        alamat: alamatInput.value,
        kelompok: kelompokInput.value,
        status: statusInput.value
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
    loadPeserta();
};

// Edit peserta
window.editPeserta = (id, nama, alamat, kelompok, status) => {
    idInput.value = id;
    namaInput.value = nama;
    alamatInput.value = alamat;
    kelompokInput.value = kelompok;
    statusInput.value = status;
    submitBtn.textContent = 'Update';
};

// Hapus peserta
window.deletePeserta = async (id) => {
    if (confirm('Yakin hapus peserta?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadPeserta();
    }
};

// Reset form
resetBtn.onclick = () => {
    form.reset();
    idInput.value = '';
    submitBtn.textContent = 'Tambah';
};

// Inisialisasi
loadPeserta();

if (hapusSemuaBtn) {
    hapusSemuaBtn.onclick = async function() {
        if (confirm('PERINGATAN: Semua data peserta dan QR code akan dihapus permanen dan tidak bisa di-undo! Lanjutkan?')) {
            const BASE_URL = window.BASE_URL || 'http://127.0.0.1:8000';
            try {
                const res = await fetch(`${BASE_URL}/peserta/hapus-semua`, { method: 'DELETE' });
                if (res.ok) {
                    alert('Semua peserta berhasil dihapus!');
                    loadPeserta();
                } else {
                    const err = await res.text();
                    alert('Gagal menghapus semua peserta: ' + err);
                }
            } catch (err) {
                alert('Terjadi error: ' + err);
            }
        }
    }
} 