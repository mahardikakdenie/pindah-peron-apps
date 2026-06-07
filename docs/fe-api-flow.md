# 📡 Frontend API Flow: "Pindah Peron" (Normal Journey)

Dokumen ini menjelaskan urutan pemanggilan API (API Flow) yang dilakukan oleh Frontend dari awal aplikasi dibuka hingga user menyelesaikan perjalanan. Tim Backend (BE) wajib memahami alur ini agar dapat menyediakan proxy API yang efisien dan sinkron.

---

## 🏗️ Fase 1: Inisialisasi & Setup Rute

Fase ini terjadi saat user berada di layar `SetupScreen`.

### 1. Ambil Daftar Stasiun
**Trigger**: Aplikasi pertama kali dibuka.
**Aksi**: FE memanggil endpoint daftar stasiun untuk mengisi pilihan dropdown/list.
- **Endpoint**: `GET /api/v1/stations` (Proxy dari KCI `/stations`)
- **Tujuan**: Mendapatkan semua nama dan ID stasiun aktif.

### 2. Ambil Jadwal di Stasiun Asal
**Trigger**: User telah memilih **Stasiun Asal** dan **Stasiun Tujuan Akhir**.
**Aksi**: FE memanggil jadwal di stasiun asal untuk membiarkan user memilih kereta (unit) mana yang sedang mereka naiki.
- **Endpoint**: `GET /api/v1/schedules/{start_station_id}?timefrom={HH:mm}&timeto={HH:mm}`
- **Logika FE**: FE akan menyaring (filter) hasil dari BE agar hanya menampilkan kereta yang **searah** dengan tujuan (menggunakan logika sekuensial jalur).
- **Hasil**: User memilih satu `train_id` (misal: KA 1151).

---

## 🚀 Fase 2: Pelacakan & Kalkulasi Transit (Looping)

Fase ini terjadi saat user sudah masuk ke layar `Dashboard`. FE akan melakukan polling setiap **10-60 detik**.

### 3. Ekstraksi Detail Rute Kereta Aktif (Workflow 1)
**Aksi**: Mendapatkan urutan stasiun lengkap dari kereta yang dipilih user.
- **Endpoint**: `GET /api/v1/train-schedule?trainid={active_train_id}`
- **Tujuan**: Mengetahui posisi kereta saat ini dan secara presisi mencari **jam tiba di stasiun transit**.

### 4. Cari Titik Transit (Workflow 2)
**Logika FE**: 
1. FE mengecek jalur kereta saat ini (misal: Bogor Line).
2. FE membandingkan dengan tujuan akhir (misal: Sudirman/Cikarang Line).
3. FE menetapkan stasiun transit (misal: Manggarai).
4. FE mencari di hasil langkah #3, jam berapa kereta aktif tersebut tiba di Manggarai (**ETA Transit**).

### 5. Kalkulasi Sambungan Tercepat (Workflow 3)
**Aksi**: Mencari kereta "lawan" di stasiun transit.
- **Endpoint**: `POST /api/v1/transit/calculate`
- **Payload**:
  ```json
  {
    "active_train_id": "1151",
    "transit_station_id": "MRI",
    "final_destination_id": "SUD",
    "missed_train_ids": []
  }
  ```
- **Proses di BE (Wajib)**:
  1. BE hit API KCI `/schedules` untuk stasiun `MRI`.
  2. BE menggunakan jendela waktu **3 JAM KE DEPAN** dari jam tiba kereta aktif.
  3. BE memfilter kereta yang hanya searah ke `SUD`.
  4. BE mengembalikan satu jadwal terbaik (sambungan tercepat).

---

## 🔄 Fase 3: Auto-Boarding (Multi-Hop)

### 6. Pindah Kereta
**Trigger**: User klik tombol **"SAYA SUDAH DI DALAM"**.
**Aksi**:
1. FE mengganti `active_train_id` menjadi ID kereta sambungan yang baru saja dinaiki.
2. Seluruh alur kembali ke **Fase 2 Langkah #3** secara otomatis.
3. Sistem mulai mencari titik transit berikutnya (jika masih ada) hingga sampai ke tujuan akhir.

---

## 📝 Ringkasan Urutan Hit untuk Tim BE:

1.  **START**: `GET /stations` (Cache 24j)
2.  **SELECTION**: `GET /schedules/{start_id}` (Filter arah di FE/BE)
3.  **DASHBOARD (Loop)**:
    *   `GET /train-schedule?trainid={id}` (Untuk update posisi radar)
    *   `POST /transit/calculate` (Kalkulasi cerdas sambungan)
4.  **BOARDING**: Update `active_train_id` -> Kembali ke Loop langkah #3.

**Catatan Penting**: BE harus memastikan caching Redis berjalan agresif pada langkah #3 dan #5 karena endpoint ini akan ditembak terus menerus oleh ribuan user secara bersamaan.
