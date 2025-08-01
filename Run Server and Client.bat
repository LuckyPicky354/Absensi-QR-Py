@echo off
REM Aktifkan virtual environment
call venv\Scripts\activate

REM Cek file sertifikat SSL
if not exist "client\cert\cert.pem" (
    echo File client\cert\cert.pem tidak ditemukan!
    pause
    exit /b 1
)
if not exist "client\cert\key.pem" (
    echo File client\cert\key.pem tidak ditemukan!
    pause
    exit /b 1
)

REM Jalankan client (http-server) di port 8080
start cmd /k "cd client && http-server . -S -C cert/cert.pem -K cert/key.pem -p 8080"

REM Jalankan backend (uvicorn) di port 8000
start cmd /k "uvicorn server.app:app --host 0.0.0.0 --port 8000 --reload --ssl-keyfile=client/cert/key.pem --ssl-certfile=client/cert/cert.pem"

REM Selesai
echo Server dan client sedang dijalankan di terminal baru.
pause 