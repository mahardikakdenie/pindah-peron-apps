# 🚀 Backend Task: "Pindah Peron" Core API & Logic Engine

## 📋 Konteks Proyek
Kita sedang membangun backend sebagai **Proxy & Logic Engine** untuk aplikasi "Pindah Peron" (sebelumnya WAR WITH KRL). Backend ini bertujuan untuk mengambil alih seluruh logika kalkulasi transit yang saat ini ada di Frontend (FE), guna meningkatkan efisiensi, keamanan session KCI, dan performa aplikasi.

**Tech Stack:** FastAPI (Python), Redis (Caching), PostgreSQL (Storage).

---

## 🛠️ Arsitektur & Workflow Utama (Copy from FE Logic)
Backend harus mengimplementasikan 3 Workflow inti yang saat ini sudah berjalan stabil di FE:

### 1. Workflow: Ekstraksi Jalur & Gateway
Backend harus mampu memetakan `train_id` menjadi urutan stasiun lengkap dan mengidentifikasi titik transit berdasarkan rute user.
- **Goal**: Memberikan detail rute dan menetapkan "Gateway" transit (MRI, THB, DU, dsb).

### 2. Workflow: Kalkulator Transit "War Mode" (Logic Engine)
Backend menerima `active_train_id`, `transit_station_id`, DAN `final_destination_id`.

**Detail Logika Manual (WAJIB):**
1. **Gateway & Bridge Matching**: Karena user bisa menuju stasiun menengah (misal: Karet), BE tidak boleh hanya mencari kereta tujuan "Karet". Gunakan pemetaan terminal jembatan:
   - Jika target di Line **Rangkasbitung**, izinkan terminal: `THB`, `ANGKE`, `KPB`, `MRI`.
   - Jika target di Line **Tangerang**, izinkan terminal: `DU`, `ANGKE`, `KPB`, `MRI`.
   - Jika target di Line **Bogor**, izinkan terminal: `JAKK`, `MRI`.
   - (Gunakan file `src/utils/transitLogic.ts` sebagai referensi pemetaan terminal lengkap).
2. **String Normalization**: API KCI tidak konsisten dengan spasi. BE wajib menghapus semua spasi dan mengubah ke uppercase sebelum melakukan matching (misal: "JAKARTA KOTA" -> "JAKARTAKOTA").
3. **Operational Hours (04:00 AM)**: Jika request dilakukan di bawah jam 4 pagi, BE harus otomatis mengoreksi `time_from` menjadi `04:00` agar mendapatkan jadwal keberangkatan pertama.
4. **Missed Train Filtering**: Abaikan semua `train_id` yang ada di dalam array `missed_train_ids` saat menghitung sambungan tercepat.
5. **Logic Engine**:
    - Cari waktu tiba kereta aktif di stasiun transit (ETA Transit).
    - Pilih kereta sambungan tercepat yang `time_est > ETA Transit` DAN `diff > 0`.
    - Tentukan Mode: `RUN_MODE` (<=2m), `HURRY_MODE` (<=5m), `CHILL_MODE` (>5m).

---

## 📡 Endpoint Requirements

### 1. `GET /api/v1/stations`
- **Fungsi**: Mengambil daftar stasiun aktif (`fg_enable: 1`).
- **Optimization**: Simpan di **Redis (TTL: 24 Jam)**. Jangan nembak API KCI setiap saat.

### 2. `GET /api/v1/schedules/{station_id}`
- **Params**: `time_from`, `time_to`.
- **Fungsi**: Proxy jadwal stasiun.
- **Optimization**: Cache di **Redis (TTL: 1 Menit)** menggunakan key `sched:{station_id}:{hh:mm}`.

### 3. `POST /api/v1/transit/calculate`
- **Body**:
  ```json
  {
    "active_train_id": "string",
    "transit_station_id": "string",
    "final_destination_id": "string",
    "missed_train_ids": ["string"]
  }
  ```
- **Response**: **Harus Strict JSON** sesuai spesifikasi `flow-war.md` (identitas kereta, transit analysis, connecting train, kalkulasi, dan UI trigger).

---

## ⚡ Strategi Efisiensi (Backend Best Practices)

1. **Redis Layer (Wajib)**:
   - Karena API KCI membatasi rate-limit, BE wajib menyimpan hasil fetch jadwal stasiun di Redis.
   - Gunakan **Service Warmup**: BE bisa melakukan background task untuk refresh cache stasiun-stasiun populer (MRI, SUD, THB) setiap 30 detik.
2. **KCI Session Manager**:
   - API KCI membutuhkan `laravel_session`. BE harus mengelola satu "Master Session" yang di-refresh secara berkala (Hit halaman utama KCI) agar tidak terkena 404/Unauthorized.
3. **String Normalization**:
   - Hilangkan spasi saat memproses nama stasiun (misal: "JAKARTA KOTA" -> "JAKARTAKOTA") agar matching logic selalu akurat.
4. **PostgreSQL Persistence**:
   - Gunakan DB untuk menyimpan statistik rute populer atau logging error API KCI sebagai bahan evaluasi stabilitas.

---

## 📤 Final Output Format (Example)
Response dari `/transit/calculate` harus menyatukan semua info:
```json
{
  "success": true,
  "train_identity": { "train_id": "5132B", "ka_name": "COMMUTER LINE CIKARANG", "line_color": "#3b82f6" },
  "transit_analysis": { "transit_station_id": "MRI", "transit_station_name": "MANGGARAI", "waktu_tiba_estimasi": "17:03:00" },
  "connecting_train": { "found": true, "train_id_sambungan": "1385", "destinasi": "JAKARTAKOTA", "waktu_berangkat_estimasi": "17:05:00" },
  "kalkulasi": { "selisih_menit": 2 },
  "ui_trigger": { "mode": "RUN_MODE", "color_code": "#FF0000", "vibrate": true, "message": "🚨 MODE LARI AKTIF! Kereta sambungan tiba 2 Menit lagi!" }
}
```

---
**Tugas ini bersifat High Priority untuk memindahkan beban komputasi dari Mobile ke Server.**
