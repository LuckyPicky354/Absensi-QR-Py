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

# Import utility untuk QR code
from server.utils.qr_generator import check_and_regenerate_qr_codes, cleanup_orphaned_qr_files

# Membuat tabel database jika belum ada
Base.metadata.create_all(bind=engine)

app.include_router(peserta_router)
app.include_router(sesi_router)
app.include_router(attendance_router)

# Startup event untuk mengecek QR code
@app.on_event("startup")
async def startup_event():
    """
    Event yang dijalankan saat server startup
    Mengecek dan membuat ulang QR code yang hilang
    """
    print("🚀 Server Absensi QR sedang startup...")
    
    # Buat session database untuk pengecekan
    db = SessionLocal()
    try:
        # Cek dan regenerate QR code yang hilang
        check_and_regenerate_qr_codes(db)
        
        # Bersihkan file QR code yang tidak terpakai
        cleanup_orphaned_qr_files(db)
        
        print("✅ Startup selesai! Server siap digunakan.")
    except Exception as e:
        print(f"❌ Error saat startup: {str(e)}")
    finally:
        db.close()

# Endpoint root
@app.get("/")
def read_root():
    return {"message": "Absensi QR FastAPI server aktif!"} 