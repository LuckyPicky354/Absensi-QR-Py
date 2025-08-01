from sqlalchemy import Column, Integer, String, Date, Time
from server.app import Base

class Sesi(Base):
    __tablename__ = 'sesi'
    id = Column(Integer, primary_key=True, index=True)
    nama_sesi = Column(String, nullable=False)
    tanggal = Column(Date, nullable=False)  # tanggal mulai
    tanggal_akhir = Column(Date, nullable=False)  # tanggal selesai
    mulai = Column(Time, nullable=False)
    akhir = Column(Time, nullable=False)
    toleransi_absen = Column(Integer, nullable=False, default=0)  # toleransi absen dalam menit