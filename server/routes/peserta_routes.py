from fastapi import APIRouter, HTTPException, Depends, Response, UploadFile, File
from sqlalchemy.orm import Session
from server.app import SessionLocal
from server.models.peserta import Peserta
import os
from fastapi.responses import FileResponse
from server.utils.qr_generator import generate_qr_code
from server.utils.zip_generator import create_qr_zip_file, cleanup_zip_files
import csv
from io import StringIO

router = APIRouter(prefix="/peserta", tags=["Peserta"])

# Dependency untuk session database

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# GET /peserta
@router.get("")
def get_peserta(db: Session = Depends(get_db)):
    return db.query(Peserta).all()

# POST /peserta
@router.post("")
def create_peserta(data: dict, db: Session = Depends(get_db)):
    peserta = Peserta(**data)
    db.add(peserta)
    db.commit()
    db.refresh(peserta)
    # Generate QR code menggunakan utility function
    generate_qr_code(peserta.id)
    return peserta

# PUT /peserta/{id}
@router.put("/{id}")
def update_peserta(id: int, data: dict, db: Session = Depends(get_db)):
    peserta = db.query(Peserta).filter(Peserta.id == id).first()
    if not peserta:
        raise HTTPException(status_code=404, detail="Peserta tidak ditemukan")
    for k, v in data.items():
        setattr(peserta, k, v)
    db.commit()
    return peserta

# DELETE /peserta/hapus-semua
@router.delete("/hapus-semua")
def hapus_semua_peserta(db: Session = Depends(get_db)):
    deleted = db.query(Peserta).delete()
    db.commit()
    # Hapus semua file QR code peserta
    qr_dir = "server/static/qr_codes/"
    for f in os.listdir(qr_dir):
        if f.endswith('.png'):
            os.remove(os.path.join(qr_dir, f))
    return {"success": True, "deleted": deleted}
# DELETE /peserta/{id}
@router.delete("/{id}")
def delete_peserta(id: int, db: Session = Depends(get_db)):
    peserta = db.query(Peserta).filter(Peserta.id == id).first()
    if not peserta:
        raise HTTPException(status_code=404, detail="Peserta tidak ditemukan")
    db.delete(peserta)
    db.commit()
    # Hapus QR code jika ada
    qr_path = f"server/static/qr_codes/{id}.png"
    if os.path.exists(qr_path):
        os.remove(qr_path)
    return {"ok": True}

# GET /peserta/{id}/qr
@router.get("/{id}/qr")
def get_qr(id: int, db: Session = Depends(get_db)):
    # Cek apakah peserta ada
    peserta = db.query(Peserta).filter(Peserta.id == id).first()
    if not peserta:
        raise HTTPException(status_code=404, detail="Peserta tidak ditemukan")
    
    qr_path = f"server/static/qr_codes/{id}.png"
    if not os.path.exists(qr_path):
        # Jika QR code tidak ada, generate ulang
        if generate_qr_code(id):
            return FileResponse(qr_path, media_type="image/png")
        else:
            raise HTTPException(status_code=500, detail="Gagal membuat QR code")
    
    return FileResponse(qr_path, media_type="image/png")

# POST /peserta/regenerate-qr - Regenerate semua QR code
@router.post("/regenerate-qr")
def regenerate_all_qr_codes(db: Session = Depends(get_db)):
    """
    Endpoint untuk regenerate semua QR code yang hilang
    """
    from server.utils.qr_generator import check_and_regenerate_qr_codes
    
    try:
        check_and_regenerate_qr_codes(db)
        return {"message": "QR code berhasil di-regenerate", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal regenerate QR code: {str(e)}")

# POST /peserta/{id}/regenerate-qr - Regenerate QR code untuk peserta tertentu
@router.post("/{id}/regenerate-qr")
def regenerate_peserta_qr(id: int, db: Session = Depends(get_db)):
    """
    Endpoint untuk regenerate QR code peserta tertentu
    """
    # Cek apakah peserta ada
    peserta = db.query(Peserta).filter(Peserta.id == id).first()
    if not peserta:
        raise HTTPException(status_code=404, detail="Peserta tidak ditemukan")
    
    try:
        if generate_qr_code(id):
            return {"message": f"QR code untuk peserta {peserta.nama} berhasil dibuat ulang", "status": "success"}
        else:
            raise HTTPException(status_code=500, detail="Gagal membuat QR code")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal regenerate QR code: {str(e)}") 

# GET /peserta/download-all-qr-zip
@router.get("/download-all-qr-zip")
def download_all_qr_zip(db: Session = Depends(get_db)):
    """
    Endpoint untuk download semua QR code peserta dalam format ZIP
    """
    try:
        # Bersihkan file ZIP lama
        cleanup_zip_files()
        
        # Buat file ZIP baru
        zip_path = create_qr_zip_file(db)
        
        # Cek apakah file ZIP berhasil dibuat
        if os.path.exists(zip_path):
            return FileResponse(
                zip_path, 
                media_type="application/zip",
                filename=os.path.basename(zip_path)
            )
        else:
            raise HTTPException(status_code=500, detail="Gagal membuat file ZIP")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saat membuat ZIP: {str(e)}")

# POST /peserta/upload-csv
@router.post("/upload-csv")
def upload_peserta_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Validasi ekstensi
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File harus berformat CSV")
    content = file.file.read().decode('utf-8')
    reader = csv.DictReader(StringIO(content))
    expected_header = ['nama', 'alamat', 'kelompok', 'status']
    # Validasi header HARUS sama persis (urutan dan nama)
    if reader.fieldnames != expected_header:
        raise HTTPException(status_code=400, detail=f"Header CSV tidak sesuai. Harus persis: {','.join(expected_header)}")
    peserta_list = []
    for row in reader:
        # Validasi sederhana, bisa ditambah sesuai kebutuhan
        if not all(row.get(h) for h in expected_header):
            continue
        peserta = Peserta(
            nama=row['nama'],
            alamat=row['alamat'],
            kelompok=row['kelompok'],
            status=row['status']
        )
        db.add(peserta)
        peserta_list.append(peserta)
    db.commit()
    return {"success": True, "inserted": len(peserta_list), "message": f"{len(peserta_list)} peserta berhasil diupload."} 