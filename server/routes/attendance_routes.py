from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from server.app import SessionLocal
from server.models.kehadiran import Kehadiran
from server.models.peserta import Peserta
from server.models.sesi import Sesi
from datetime import datetime, date, time
from fastapi.responses import StreamingResponse
import csv
import io
from datetime import datetime, timedelta

router = APIRouter(tags=["Absensi"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# POST /absen
@router.post("/absen")
def absen(data: dict, db: Session = Depends(get_db)):
    peserta_id = data.get("peserta_id")
    now = datetime.now()
    today = now.date()
    waktu = now.time()
    # Perbaiki query untuk mengecek range tanggal
    sesi = db.query(Sesi).filter(
        Sesi.tanggal <= today,
        Sesi.tanggal_akhir >= today,
        Sesi.mulai <= waktu,
        Sesi.akhir >= waktu
    ).first()
    if not sesi:
        return {"status": "Invalid / Belum Waktu Absen"}
    sudah = db.query(Kehadiran).filter_by(peserta_id=peserta_id, sesi_id=sesi.id).first()
    if sudah:
        peserta = db.query(Peserta).filter_by(id=peserta_id).first()
        return {
            "status": "Sudah Absen",
            "nama": peserta.nama if peserta else None,
            "waktu_absen": None
        }
    # Hitung batas toleransi
    toleransi = sesi.toleransi_absen or 0
    batas_toleransi = (datetime.combine(today, sesi.mulai) + timedelta(minutes=toleransi)).time()
    if waktu <= batas_toleransi:
        status = "Tepat Waktu"
    else:
        status = "Terlambat"
    kehadiran = Kehadiran(peserta_id=peserta_id, sesi_id=sesi.id, timestamp=now, status=status)
    db.add(kehadiran)
    db.commit()
    peserta = db.query(Peserta).filter_by(id=peserta_id).first()
    # Log ke console
    if peserta:
        print(f"[ABSEN] {peserta.nama} absen pada {now.strftime('%Y-%m-%d %H:%M:%S')} (status: {status})")
    return {
        "status": status,
        "nama": peserta.nama if peserta else None,
        "waktu_absen": now.strftime('%Y-%m-%d %H:%M:%S')
    }

# GET /absensi?tanggal=YYYY-MM-DD&sesi_id=ID
@router.get("/absensi")
def get_absensi(tanggal: date = Query(None), sesi_id: int = Query(None), db: Session = Depends(get_db)):
    q = db.query(Kehadiran, Peserta, Sesi).join(Peserta, Kehadiran.peserta_id == Peserta.id).join(Sesi, Kehadiran.sesi_id == Sesi.id)
    if tanggal:
        q = q.filter(Sesi.tanggal == tanggal)
    if sesi_id:
        q = q.filter(Sesi.id == sesi_id)
    result = []
    for k, p, s in q.all():
        result.append({
            "id": p.id,
            "nama": p.nama,
            "alamat": p.alamat,
            "kelompok": p.kelompok,
            "tanggal": s.tanggal,
            "sesi": s.nama_sesi,
            "waktu_absen": k.timestamp,
            "status": k.status
        })
    return result

# GET /report (ekspor CSV)
@router.get("/report")
def export_csv(db: Session = Depends(get_db)):
    q = db.query(Kehadiran, Peserta, Sesi).join(Peserta, Kehadiran.peserta_id == Peserta.id).join(Sesi, Kehadiran.sesi_id == Sesi.id)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID","NAMA","ALAMAT","KELOMPOK","TANGGAL","SESI","WAKTU_ABSEN","STATUS"])
    for k, p, s in q.all():
        writer.writerow([p.id, p.nama, p.alamat, p.kelompok, s.tanggal, s.nama_sesi, k.timestamp, k.status])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=absensi.csv"}) 

# DELETE /absensi/all
@router.delete("/absensi/all")
def delete_all_absensi(db: Session = Depends(get_db)):
    deleted = db.query(Kehadiran).delete()
    db.commit()
    return {"ok": True, "deleted": deleted}

# DELETE /absensi/{id}
@router.delete("/absensi/{id}")
def delete_absensi(id: int, db: Session = Depends(get_db)):
    absen = db.query(Kehadiran).filter(Kehadiran.id == id).first()
    if not absen:
        raise HTTPException(status_code=404, detail="Data absensi tidak ditemukan")
    db.delete(absen)
    db.commit()
    return {"ok": True}