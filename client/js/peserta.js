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

// Fetch dan tampilkan data peserta
async function loadPeserta() {
    const res = await fetch(API_URL);
    const data = await res.json();
    tableBody.innerHTML = '';
    data.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nama}</td>
            <td>${p.alamat}</td>
            <td>${p.kelompok}</td>
            <td>${p.status}</td>
            <td><a href="${API_URL}/${p.id}/qr" target="_blank">QR</a></td>
            <td>
                <button onclick="editPeserta(${p.id}, '${p.nama}', '${p.alamat}', '${p.kelompok}', '${p.status}')">Edit</button>
                <button class="btn-hapus" onclick="deletePeserta(${p.id})">Hapus</button>
            </td>
        `;
        tableBody.appendChild(tr);
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