import qrcode
import os
from sqlalchemy.orm import Session
from server.models.peserta import Peserta

def generate_qr_code(peserta_id: int, qr_folder: str = "server/static/qr_codes"):
    """
    Generate QR code untuk peserta dengan ID tertentu
    """
    try:
        # Buat folder jika belum ada
        os.makedirs(qr_folder, exist_ok=True)
        
        # Generate QR code
        qr_path = os.path.join(qr_folder, f"{peserta_id}.png")
        img = qrcode.make(str(peserta_id))
        img.save(qr_path)
        
        print(f"✅ QR code berhasil dibuat untuk peserta ID: {peserta_id}")
        return True
    except Exception as e:
        print(f"❌ Gagal membuat QR code untuk peserta ID {peserta_id}: {str(e)}")
        return False

def check_and_regenerate_qr_codes(db: Session, qr_folder: str = "server/static/qr_codes"):
    """
    Mengecek dan membuat ulang QR code yang hilang
    """
    print("🔍 Memulai pengecekan QR code...")
    
    # Ambil semua peserta dari database
    peserta_list = db.query(Peserta).all()
    
    if not peserta_list:
        print("ℹ️ Tidak ada peserta dalam database")
        return
    
    # Buat folder QR codes jika belum ada
    os.makedirs(qr_folder, exist_ok=True)
    
    missing_qr_count = 0
    regenerated_count = 0
    
    for peserta in peserta_list:
        qr_path = os.path.join(qr_folder, f"{peserta.id}.png")
        
        # Cek apakah file QR code ada
        if not os.path.exists(qr_path):
            print(f"⚠️ QR code hilang untuk peserta ID: {peserta.id} ({peserta.nama})")
            missing_qr_count += 1
            
            # Generate ulang QR code
            if generate_qr_code(peserta.id, qr_folder):
                regenerated_count += 1
        else:
            print(f"✅ QR code ada untuk peserta ID: {peserta.id} ({peserta.nama})")
    
    print(f"\n📊 Hasil pengecekan QR code:")
    print(f"   - Total peserta: {len(peserta_list)}")
    print(f"   - QR code hilang: {missing_qr_count}")
    print(f"   - Berhasil dibuat ulang: {regenerated_count}")
    
    if missing_qr_count == 0:
        print("🎉 Semua QR code tersedia!")
    else:
        print(f"🔧 {regenerated_count} QR code berhasil dibuat ulang")

def cleanup_orphaned_qr_files(db: Session, qr_folder: str = "server/static/qr_codes"):
    """
    Membersihkan file QR code yang tidak memiliki peserta di database
    """
    print("🧹 Memulai pembersihan file QR code yang tidak terpakai...")
    
    if not os.path.exists(qr_folder):
        print("ℹ️ Folder QR codes tidak ada")
        return
    
    # Ambil semua ID peserta dari database
    peserta_ids = [peserta.id for peserta in db.query(Peserta).all()]
    
    # Cek setiap file di folder QR codes
    orphaned_files = []
    for filename in os.listdir(qr_folder):
        if filename.endswith('.png'):
            try:
                file_id = int(filename.replace('.png', ''))
                if file_id not in peserta_ids:
                    orphaned_files.append(filename)
            except ValueError:
                # File dengan nama yang tidak valid
                orphaned_files.append(filename)
    
    # Hapus file yang tidak terpakai
    for filename in orphaned_files:
        file_path = os.path.join(qr_folder, filename)
        try:
            os.remove(file_path)
            print(f"🗑️ Menghapus file tidak terpakai: {filename}")
        except Exception as e:
            print(f"❌ Gagal menghapus file {filename}: {str(e)}")
    
    print(f"📊 Pembersihan selesai: {len(orphaned_files)} file tidak terpakai dihapus") 