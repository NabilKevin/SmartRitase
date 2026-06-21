# Sistem Manajemen Logistik Galian Tanah

Aplikasi berbasis Progressive Web App (PWA) untuk melacak operasional armada berat, mencatat bon tanah (Land Tickets), dan bukti pengiriman (Proof of Deliveries).

## Fitur Utama
* **Manajemen Tiket & Bukti Pengiriman:** Pencatatan ritase lengkap dengan lokasi GPS dan integrasi tanda tangan digital (Photo Capture).
* **Peta Interaktif & Geotagging:** Terintegrasi dengan Leaflet Maps untuk menentukan titik koordinat lokasi galian dan area pembuangan (*landfill*).
* **Mode Offline (PWA):** Dukungan penuh untuk area *blank spot* (tanpa sinyal) menggunakan Firebase Local Cache dan Service Worker. Supir tetap bisa membuat tiket saat internet mati.
* **Sistem Role (Admin & Supir):** Pembatasan akses, di mana Admin dapat memonitor seluruh operasional dan mengelola *user*, sementara Supir hanya fokus pada tugas mereka sendiri.
* **Optimasi Performa Tinggi:** Menggunakan sistem *Client-Side Pagination* dan *Infinite Scroll* (Load More) untuk menjaga aplikasi tetap ringan meskipun memuat ribuan data ritase.

## Teknologi yang Digunakan
* **Frontend:** React, Vite, TypeScript, Tailwind CSS
* **State Management:** Zustand (termasuk *middleware* `persist`)
* **Backend & Database:** Firebase (Authentication, Firestore Database)
* **Pemetaan:** React Leaflet & Google Maps URL
* **PWA:** `vite-plugin-pwa`

---

## Instruksi Penginstalan

### Prasyarat Sistem
Pastikan komputer Anda telah terinstal perangkat lunak berikut sebelum memulai:
* [Node.js](https://nodejs.org/) (versi 16 atau lebih baru) disarankan versi LTS.
* Git
* Akun [Firebase](https://firebase.google.com/) untuk konfigurasi *database* dan *authentication*.

### Langkah-langkah Instalasi Lokal

**1. Kloning Repositori**
Buka terminal dan jalankan perintah berikut untuk mengunduh kode ke mesin lokal Anda:
```bash
git clone https://github.com/NabilKevin/SmartRitase.git
cd SmartRitase
```

**2. Instal Depedensi**
Unduh semua library pendukung yang dibutuhkan oleh proyek:

```bash
npm install
```

**3. Konfigurasi Environment Variables (Firebase)**
Aplikasi membutuhkan koneksi ke Firebase.
Buat file baru dengan nama .env di root directory (sejajar dengan file package.json).
Salin konfigurasi dari proyek Firebase Console Anda dan tempelkan ke file tersebut dengan format awalan VITE_ seperti berikut:

```bash
VITE_FIREBASE_API_KEY="api_key_anda_di_sini"
VITE_FIREBASE_AUTH_DOMAIN="project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="project-id"
VITE_FIREBASE_STORAGE_BUCKET="project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="sender_id_anda"
VITE_FIREBASE_APP_ID="app_id_anda"
```

**4. Jalankan Aplikasi (Mode Development)**
Setelah konfigurasi selesai, jalankan server pengembangan lokal:

```bash
npm run dev
```

Buka browser Anda dan akses http://localhost:5173.