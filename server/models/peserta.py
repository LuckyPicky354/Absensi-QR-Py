from sqlalchemy import Column, Integer, String
from server.app import Base

class Peserta(Base):
    __tablename__ = 'peserta'
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String, nullable=False)
    alamat = Column(String, nullable=False)
    kelompok = Column(String, nullable=False)
    status = Column(String, nullable=False) 