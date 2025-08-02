// Download template CSV
const templateBtn = document.getElementById('download-template-btn');
templateBtn.onclick = function() {
  window.open('template/template_peserta.csv', '_blank');
};

const form = document.getElementById('csv-upload-form');
const fileInput = document.getElementById('csv-file');
const statusDiv = document.getElementById('upload-status');

form.onsubmit = async function(e) {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) {
    statusDiv.innerHTML = '<span style="color:#e74c3c;">Silakan pilih file CSV terlebih dahulu.</span>';
    return;
  }
  const formData = new FormData();
  formData.append('file', file);
  statusDiv.innerHTML = 'Mengupload...';
  try {
    const BASE_URL = window.BASE_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${BASE_URL}/peserta/upload-csv`, {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        statusDiv.innerHTML = '<span style="color:#27ae60;">Upload berhasil! ' + (data.message || '') + '</span>';
      } else {
        statusDiv.innerHTML = '<span style="color:#e67e22;">Upload selesai, tapi ada peringatan: ' + (data.message || 'Cek data Anda.') + '</span>';
      }
    } else {
      const err = await res.text();
      statusDiv.innerHTML = '<span style="color:#e74c3c;">Gagal upload: ' + err + '</span>';
    }
  } catch (err) {
    statusDiv.innerHTML = '<span style="color:#e74c3c;">Terjadi error: ' + err + '</span>';
  }
};