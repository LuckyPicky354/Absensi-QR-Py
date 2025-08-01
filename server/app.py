from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Setup database
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///server/database/database.db')
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Inisialisasi FastAPI
app = FastAPI()

# CORS agar bisa diakses dari browser LAN
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import dan include router
from server.routes.peserta_routes import router as peserta_router
from server.routes.sesi_routes import router as sesi_router
from server.routes.attendance_routes import router as attendance_router

# Membuat tabel database jika belum ada
Base.metadata.create_all(bind=engine)

app.include_router(peserta_router)
app.include_router(sesi_router)
app.include_router(attendance_router)

# Endpoint root
@app.get("/")
def read_root():
    return {"message": "Absensi QR FastAPI server aktif!"} 