# 🔍 Troubleshooting BE: Penanganan "Jadwal Tidak Tersedia"

## 📋 Masalah
Backend (BE) mengembalikan error: `{"success": false, "message": "Jadwal di stasiun transit tidak tersedia"}`. 
Hal ini terjadi karena BE gagal menemukan kereta sambungan yang searah dengan tujuan user pada jam kedatangan tersebut.

---

## 🛠️ Workflow FE Saat Ini (Solusi Wajib di BE)

Frontend (FE) saat ini memiliki strategi pencarian yang sangat luas untuk menghindari error ini. BE **WAJIB** menerapkan logika yang sama:

### 1. Jendela Waktu yang Luas (The 3-Hour Window)
FE tidak mencari jadwal hanya pada jam kedatangan saja. FE menggunakan fungsi `getTimeRangeFromBase` untuk mengambil jadwal **3 JAM KE DEPAN** dari jam kedatangan kereta aktif.
- **Contoh**: Jika kereta aktif sampai di MRI jam `17:05`, BE harus memanggil API KCI untuk rentang waktu `17:05` s/d `20:05`.
- **Tujuan**: Memastikan jika ada jeda antar kereta yang lama, data tetap ditemukan.

### 2. Penanganan Midnight Crossing (24 Jam)
Jika kereta sampai jam `23:30`, maka 3 jam ke depan adalah jam `02:30`.
- BE harus cerdas membagi request jika melewati tengah malam atau menambahkan logika +24 jam pada kalkulasi menit agar selisihnya tidak negatif.

### 3. Filter "Missed Train"
Sebelum menentukan jadwal tidak tersedia, pastikan BE sudah membuang `train_id` yang ada di `missed_train_ids`. Jika setelah dibuang datanya kosong, barulah BE boleh memberikan response "tidak tersedia".

---

## 📤 Ekspektasi Response FE (Correct Format)

FE tidak mengharapkan `success: false` jika data tidak ditemukan secara teknis (kosong). FE lebih menyukai response **`found: false`** di dalam objek, agar UI tetap bisa merender radar meskipun datanya sedang dicari.

**Jika benar-benar tidak ada kereta 3 jam ke depan, berikan response seperti ini:**

```json
{
  "success": true,
  "train_identity": {
    "train_id": "1151",
    "ka_name": "COMMUTER LINE BOGOR",
    "line_color": "#ef4444"
  },
  "transit_analysis": {
    "transit_station_id": "MRI",
    "transit_station_name": "MANGGARAI",
    "waktu_tiba_estimasi": "17:05:00"
  },
  "connecting_train": {
    "found": false,
    "train_id_sambungan": "-",
    "destinasi": "-",
    "waktu_berangkat_estimasi": "-"
  },
  "kalkulasi": {
    "selisih_menit": 0
  },
  "ui_trigger": {
    "mode": "CHILL_MODE",
    "color_code": "#94A3B8",
    "vibrate": false,
    "message": "📡 Menunggu jadwal sambungan tersedia di radar..."
  }
}
```

## ✅ Checklist untuk BE:
1. [ ] Apakah BE sudah mengambil jadwal **3 jam ke depan** dari jam kedatangan?
2. [ ] Apakah BE sudah melakukan **String Normalization** (hapus spasi) pada destinasi?
3. [ ] Apakah BE sudah menyaring jadwal berdasarkan `missed_train_ids`?
4. [ ] Apakah BE mengembalikan `success: true` with `found: false` daripada langsung melempar error 404/message fail?
