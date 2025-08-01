from sqlalchemy import Column, Integer, DateTime, String, ForeignKey
from server.app import Base

class Kehadiran(Base):
    __tablename__ = 'kehadiran'
    id = Column(Integer, primary_key=True, index=True)
    peserta_id = Column(Integer, ForeignKey('peserta.id'), nullable=False)
    sesi_id = Column(Integer, ForeignKey('sesi.id'), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    status = Column(String, nullable=False) 