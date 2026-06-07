# 🧩 Backend Task: Transit Detection & Route Analysis Engine

## 📋 Konteks
Aplikasi "Pindah Peron" mengandalkan keakuratan penentuan stasiun transit. Backend (BE) wajib memiliki fungsi utilitas yang bisa menentukan di mana user harus melakukan transit berdasarkan stasiun asal dan stasiun tujuan akhir.

Tugas BE adalah mengimplementasikan **"Manual Rule Matrix"** di bawah ini ke dalam logika Python/FastAPI.

---

## 1. Data Dasar: Pemetaan Jalur (Line Mapping)
Gunakan kamus (dictionary) ini sebagai acuan jalur setiap stasiun. 
*Catatan: BE harus menyimpan ini di database atau memori (singleton).*

| Nama Jalur | Warna | Contoh Stasiun Utama (ID) |
| :--- | :--- | :--- |
| **BOGOR LINE** | Merah | BOO, DP, MRI, JAKK, GDD |
| **CIKARANG LINE** | Biru | CKR, BKS, JNG, MRI, SUD, THB, DU, KPB, AK |
| **RANGKAS LINE** | Hijau | RK, PRP, SRP, PDJ, THB |
| **TANGERANG LINE** | Cokelat | TNG, RWB, GF, DU |
| **PRIOK LINE** | Pink | TPK, KPB, JAKK |

---

## 2. Matriks Keputusan Transit (The Brain)
Logika penentuan stasiun transit menggunakan pencocokan lintas jalur. Jika `Jalur_Asal != Jalur_Tujuan`, BE wajib merujuk ke tabel ini:

```python
TRANSIT_MATRIX = {
    "Bogor-Cikarang": "MRI",
    "Bogor-Rangkasbitung": "MRI",     # Hop 1: Ke Hub Utama (Manggarai)
    "Bogor-Tangerang": "MRI",         # Hop 1: Ke Hub Utama (Manggarai)
    "Bogor-TanjungPriok": "JAKK", 
    
    "Cikarang-Bogor": "MRI",
    "Cikarang-Rangkasbitung": "THB",  # Hub Hijau
    "Cikarang-Tangerang": "DU",       # Hub Cokelat
    "Cikarang-TanjungPriok": "KPB",   # Hub Pink
    
    "Rangkasbitung-Bogor": "THB",      # Hop 1: Ke Loop Line di THB
    "Rangkasbitung-Cikarang": "THB",
    "Rangkasbitung-Tangerang": "THB",  # Hop 1: Ke Loop Line di THB
    "Rangkasbitung-TanjungPriok": "THB",
    
    "Tangerang-Bogor": "DU",           # Hop 1: Ke Loop Line di DU
    "Tangerang-Cikarang": "DU",
    "Tangerang-Rangkasbitung": "DU",   # Hop 1: Ke Loop Line di DU
    "Tangerang-TanjungPriok": "DU",
    
    "TanjungPriok-Bogor": "JAKK",
    "TanjungPriok-Cikarang": "KPB",
    "TanjungPriok-Rangkasbitung": "KPB",
    "TanjungPriok-Tangerang": "KPB",
}
```

---

## 3. Workflow Deteksi Transit (Langkah Kerja BE)

BE harus membuat fungsi `get_transit_hub(origin_id, destination_id)`:

1.  **Dapatkan Nama Jalur**: Cari stasiun `origin_id` ada di jalur mana, dan `destination_id` ada di jalur mana.
2.  **Cek Kesamaan**: Jika jalur sama, kembalikan `null` (Rute Langsung).
3.  **Lookup Matrix**: Gunakan kunci `{Jalur_Asal}-{Jalur_Tujuan}` untuk mengambil ID stasiun transit dari `TRANSIT_MATRIX`.
4.  **Special Case: Hub Manggarai**: Manggarai (MRI) adalah stasiun yang sangat kompleks. Jika asal adalah jalur Bogor dan tujuan adalah Jalur Cikarang, sistem **WAJIB** berhenti di MRI.

---

## 4. Logika Deteksi Jalur Kereta (Dynamic Line Detection)
Karena data dari API KCI seringkali hanya memberikan `train_id`, BE harus bisa mendeteksi jalur kereta tersebut secara dinamis untuk menentukan apakah kereta tersebut "searah":

- **Logic**: Periksa nama kereta (`ka_name`) atau rute (`route_name`).
- **Kata Kunci**:
    - "BOGOR" / "JAKARTA KOTA" -> **Bogor Line**.
    - "CIKARANG" / "BEKASI" / "LINGKAR" -> **Cikarang Line**.
    - "RANGKAS" / "PARUNG" / "SERPONG" -> **Rangkas Line**.
    - "TANGERANG" -> **Tangerang Line**.
    - "PRIOK" -> **Tanjung Priok Line**.

---

## 5. Implementasi Multi-Hop (PENTING)
Backend tidak perlu pusing memikirkan rute 3 atau 4 kali pindah sekaligus. Gunakan prinsip **"Next Logical Hop"**:

- Jika user dari **Depok (Bogor)** ingin ke **Tangerang (Cokelat)**.
- Matriks menunjukkan Transit: **Manggarai (MRI)**.
- Berikan info transit ke MRI.
- Begitu user sudah di dalam kereta menuju MRI dan sampai di sana, polling berikutnya akan mendeteksi posisi baru: **Manggarai (Cikarang/Loop)** ke **Tangerang (Cokelat)**.
- Matriks akan otomatis memberikan Transit baru: **Duri (DU)**.

**Sistem akan memandu user stasiun demi stasiun (Hop-by-Hop) secara otomatis.**

---

## ✅ Output yang Diharapkan
Fungsi utilitas ini akan digunakan oleh endpoint `/transit/calculate` untuk menentukan stasiun mana yang harus ditarik jadwalnya sebagai "Connecting Train".

**Status: HIGH PRIORITY**
Logika ini adalah fondasi utama fitur "Pindah Peron".
