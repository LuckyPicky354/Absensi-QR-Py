# Ubah alamat IP API Endpoint server

   - buka file env.js dan ubah alamat IP sesuai dengan alamat IP server, pastikan menggunakan https jika di situ ada sertifikat SSL terinstall, jika tidak maka gunakan http

# Setup node.js untuk menjalankan client Https
   
   - Install http-server di node js secara global
      ```
      npm install -g http-server
      ```
# Jalankan Client dan server

   - Buka terminal di directory /client lalu jalankan command
      ```
      http-server . -S -C cert/cert.pem -K cert/key.pem -p 8080
      ```
   - Buka terminal baru di folder root project lalu jalankan
      ```
      venv\Scripts\activate
      ```
      lalu
      ```
      uvicorn server.app:app --host 0.0.0.0 --port 8000 --reload --ssl-keyfile=client\cert\key.pem --ssl-certfile=client\cert\cert.pem
      ```
   - Server dan client sudh UP