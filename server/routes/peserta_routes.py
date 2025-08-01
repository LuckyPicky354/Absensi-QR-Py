from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from server.app import SessionLocal
from server.models.peserta import Peserta
import qrcode
import os

from fastapi.responses import FileResponse

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
    # Generate QR code
    qr_path = f"server/static/qr_codes/{peserta.id}.png"
    os.makedirs(os.path.dirname(qr_path), exist_ok=True)
    img = qrcode.make(str(peserta.id))
    img.save(qr_path)
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
def get_qr(id: int):
    qr_path = f"server/static/qr_codes/{id}.png"
    if not os.path.exists(qr_path):
        raise HTTPException(status_code=404, detail="QR code tidak ditemukan")
    return FileResponse(qr_path, media_type="image/png") 