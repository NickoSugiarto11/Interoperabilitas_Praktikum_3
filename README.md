# Praktikum AUTH

---

## Nicko Sugiarto_362458302119_TRPL2D

---

## Tujuan Tugas

1. # Mengaplikasikan middleware autentikasi pada serangkaian endpoint baru.
1. Mengaplikasikan middleware autentikasi pada serangkaian endpoint baru
1. Memperkuat pemahaman tentang alur kerja autentikasi berbasis token.

---

## Instalasi

1. Install bcryptjs
2. Ubah File .env dengan menambahkan `JWT_SECRET`
3. Lalu jalankan server dengan `Nodemon server.js`

## Endpoint

1. POST /auth/register registrasi pengguna baru
2. POST /auth/login login dan mendapatkan token JWT
3. GET /movies/:id ambil film berdasarkan ID
4. POST /movies tambah data film baru
5. PUT /movies/:id update data film
6. DELETE /movies/:id hapus data film
   sutradara berdasarkan ID
7. POST /directors tambah data sutradara
8. PUT /directors/:id update data sutradara
9. DELETE /directors/:id hapus data sutradara
