import zipfile
import os
from datetime import datetime
from sqlalchemy.orm import Session
from server.models.peserta import Peserta

def create_qr_zip_file(db: Session) -> str:
    """
    Membuat file ZIP yang berisi semua QR code peserta
    Returns: path ke file ZIP yang dibuat
    """
    # Ambil semua peserta dari database
    peserta_list = db.query(Peserta).all()
    
    # Buat nama file ZIP dengan timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_filename = f"qr_codes_{timestamp}.zip"
    zip_path = f"server/static/qr_codes/{zip_filename}"
    
    # Buat file ZIP
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for peserta in peserta_list:
            qr_file_path = f"server/static/qr_codes/{peserta.id}.png"
            
            # Cek apakah file QR ada
            if os.path.exists(qr_file_path):
                # Tambahkan ke ZIP dengan nama yang lebih deskriptif
                zipf.write(qr_file_path, f"QR_{peserta.nama}_{peserta.id}.png")
    
    return zip_path

def cleanup_zip_files():
    """
    Membersihkan file ZIP lama (lebih dari 1 jam)
    """
    import time
    current_time = time.time()
    qr_dir = "server/static/qr_codes/"
    
    for filename in os.listdir(qr_dir):
        if filename.endswith('.zip'):
            file_path = os.path.join(qr_dir, filename)
            # Hapus file yang lebih dari 1 jam
            if current_time - os.path.getctime(file_path) > 3600:  # 1 jam = 3600 detik
                try:
                    os.remove(file_path)
                except:
                    pass 