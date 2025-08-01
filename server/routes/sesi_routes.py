from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from server.app import SessionLocal
from server.models.sesi import Sesi
from datetime import date, time

router = APIRouter(prefix="/sesi", tags=["Sesi"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("")
def get_sesi(db: Session = Depends(get_db)):
    return db.query(Sesi).all()

@router.post("")
def create_sesi(data: dict, db: Session = Depends(get_db)):
    data['tanggal'] = date.fromisoformat(data['tanggal'])
    data['tanggal_akhir'] = date.fromisoformat(data['tanggal_akhir'])
    data['mulai'] = time.fromisoformat(data['mulai'])
    data['akhir'] = time.fromisoformat(data['akhir'])
    data['toleransi_absen'] = int(data.get('toleransi_absen', 0))
    sesi = Sesi(**data)
    db.add(sesi)
    db.commit()
    db.refresh(sesi)
    return sesi

@router.put("/{id}")
def update_sesi(id: int, data: dict, db: Session = Depends(get_db)):
    sesi = db.query(Sesi).filter(Sesi.id == id).first()
    if not sesi:
        raise HTTPException(status_code=404, detail="Sesi tidak ditemukan")
    data['tanggal'] = date.fromisoformat(data['tanggal'])
    data['tanggal_akhir'] = date.fromisoformat(data['tanggal_akhir'])
    data['mulai'] = time.fromisoformat(data['mulai'])
    data['akhir'] = time.fromisoformat(data['akhir'])
    data['toleransi_absen'] = int(data.get('toleransi_absen', 0))
    for k, v in data.items():
        setattr(sesi, k, v)
    db.commit()
    return sesi

@router.delete("/{id}")
def delete_sesi(id: int, db: Session = Depends(get_db)):
    sesi = db.query(Sesi).filter(Sesi.id == id).first()
    if not sesi:
        raise HTTPException(status_code=404, detail="Sesi tidak ditemukan")
    db.delete(sesi)
    db.commit()
    return {"ok": True}