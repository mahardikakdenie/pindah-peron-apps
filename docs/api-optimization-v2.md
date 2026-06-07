## 🎯 Visi Arsitektur

Tujuan utama dari spesifikasi ini adalah **"Offloading Logic"**. Frontend (FE) tidak lagi boleh melakukan perhitungan manual, filtering arah sekuensial, atau penentuan titik transit. BE harus bertindak sebagai **Brain Engine** yang mengembalikan data siap saji (UI-Ready) sehingga kinerja ponsel user tetap ringan dan hemat baterai.

**Tech Stack Backend:** FastAPI, Redis (Caching), PostgreSQL.

---

## 🏗️ Perbandingan Arsitektur: FE vs BE

| Fitur                | Arsitektur Lama (FE Heavy)                      | Arsitektur Baru (Smart BE)                                               |
| :------------------- | :---------------------------------------------- | :----------------------------------------------------------------------- |
| **Pencarian Unit**   | FE hit API, lalu filter manual arah sekuensial. | BE terima `{asal, tujuan}`, BE filter arah & kembalikan list siap pakai. |
| **Titik Transit**    | FE hitung manual rute mana yang butuh transit.  | BE otomatis deteksi butuh transit atau tidak (Direct vs Multi-hop).      |
| **Radar Perjalanan** | FE hitung manual stasiun mana yang sudah lewat. | BE kirim status `is_passed` & `is_current` untuk setiap stasiun.         |
| **War Mode**         | FE hit endpoint kalkulasi secara terpisah.      | Menjadi satu kesatuan dalam status Live Radar.                           |

---

## 📡 Endpoint 1: Master Station Data

Daftar stasiun untuk mengisi pilihan dropdown awal.

- **URL**: `GET /api/v2/stations`
- **Logic BE**:
    - Proxy ke API KCI `/stations`.
    - Filter `fg_enable == 1`.
    - **Redis Cache**: 24 Jam.
- **Ekspektasi Response**:

```json
{
	"status": "success",
	"data": [
		{
			"id": "MRI",
			"name": "MANGGARAI",
			"line": "Bogor/Cikarang",
			"is_popular": true
		},
		{
			"id": "SUD",
			"name": "SUDIRMAN",
			"line": "Cikarang",
			"is_popular": true
		}
	]
}
```

---

## 📡 Endpoint 2: Smart Unit Discovery

User memilih Asal & Tujuan, BE mencarikan kereta yang **searah** dan menentukan apakah butuh transit.

- **URL**: `POST /api/v2/setup/search-trains`
- **Request Body**:

```json
{
	"origin_id": "PSMB",
	"destination_id": "SUD"
}
```

- **Logic BE (The Heavy Lifting)**:
    1. **Transit Detection**: Cek apakah Asal & Tujuan di jalur yang sama.
    2. **Gateway Determination**: Jika beda jalur, BE tentukan secara internal stasiun transitnya (misal: MRI).
    3. **Sequential Filtering**: BE memanggil jadwal di `origin_id`. BE wajib membuang kereta yang arahnya berlawanan dengan `destination_id` atau `transit_hub`.
    4. **Time Correction**: Jika request jam 01:00 AM, BE koreksi ke jam 04:00 AM secara otomatis.
- **Ekspektasi Response**:

```json
{
	"status": "success",
	"route_info": {
		"is_direct": false,
		"transit_hub_id": "MRI",
		"transit_hub_name": "MANGGARAI"
	},
	"available_units": [
		{
			"train_id": "1151",
			"ka_name": "COMMUTER LINE BOGOR",
			"dest": "JAKARTA KOTA",
			"time_est": "17:05:00",
			"color": "#ef4444"
		}
	]
}
```

---

## 📡 Endpoint 3: Tactical Live Radar (The HUD Engine)

Ini adalah endpoint yang dipolling oleh FE saat Dashboard aktif. BE mengembalikan SEGALANYA dalam satu payload.

- **URL**: `POST /api/v2/dashboard/live-radar`
- **Request Body**:

```json
{
	"active_train_id": "1151",
	"origin_id": "PSMB",
	"destination_id": "SUD",
	"missed_train_ids": [],
	"delay_mins": 0
}
```

- **Logic BE (High Intensity)**:
    1. **Workflow 1 (Active Schedule)**: Ambil rute lengkap KA 1151.
    2. **Workflow 2 (Transit Sync)**: Jika butuh transit, cari ETA di `transit_hub` (misal: MRI).
    3. **Workflow 3 (War Mode Calculation)**: Cari sambungan di stasiun transit, filter arah ke tujuan akhir, hitung selisih menit.
    4. **Radar Processing**: Bandingkan jam sekarang (Server Time) dengan setiap stasiun di rute. Tandai stasiun dengan `is_passed: true/false` dan `is_current: true/false`.
    5. **Progress Calculation**: Hitung % penyelesaian misi.
- **Ekspektasi Response (UI-Ready)**:

```json
{
	"success": true,
	"mission_status": {
		"mode": "RUN_MODE",
		"message": "🚨 LARI! Kereta sambungan berangkat 2 menit lagi!",
		"color_code": "#EF4444",
		"progress_pct": 0.45,
		"is_offline_data": false
	},
	"radar_display": {
		"train_id": "1151",
		"line_name": "BOGOR LINE",
		"stations": [
			{
				"id": "PSMB",
				"name": "PASAR MINGGU BARU",
				"time": "17:00",
				"is_passed": true,
				"is_current": false
			},
			{
				"id": "MRI",
				"name": "MANGGARAI",
				"time": "17:15",
				"is_passed": false,
				"is_current": true,
				"is_transit": true,
				"platform": "8"
			}
		]
	},
	"connection_details": {
		"found": true,
		"train_id": "5065B",
		"dest": "ANGKE",
		"etd": "17:17:00",
		"countdown_mins": 2
	}
}
```

---

## ⚡ Key Optimizations (BE Responsibilities)

### 1. Redis Multilayer Caching

- **Level 1 (Global)**: Daftar stasiun (TTL 24 Jam).
- **Level 2 (Station-Time)**: Jadwal per stasiun per rentang waktu (TTL 1 Menit). Key: `schedules:{station_id}:{time_bucket}`.
- **Level 3 (Train-Route)**: Detail rute per ID kereta (TTL 5 Menit - karena kereta jarang berubah rute di tengah jalan).

### 2. High-Efficiency Polling

BE tidak boleh menembak API KCI 3 kali untuk satu request Live Radar.

- BE harus melakukan **Parallel Processing** (panggil detail kereta dan jadwal transit secara bersamaan menggunakan `asyncio` atau `Worker Threads`).
- Jika data di Redis masih valid, BE **haram** menembak API KCI.

### 3. Smart Error Recovery

Jika API KCI down (404/Timeout):

- BE harus mengembalikan data terakhir yang ada di Redis (Stale data) dengan flag `is_offline_data: true`.
- BE melakukan **Session Auto-Refresh** secara background jika terdeteksi kegagalan massal (Session Expired).

### 4. Sequential Logic (Core Intelligence)

BE harus memiliki kamus urutan stasiun (`routeSequence.ts` versi Python).

- Jika User dari A ke B, dan Kereta menuju C, BE harus memastikan B ada di antara urutan stasiun A ke C. Jika tidak, buang unit tersebut dari hasil pencarian.

---

## 📝 Kesimpulan

Dengan arsitektur ini, Frontend Anda hanya akan menjadi **"Layar Monitor"** yang pasif. Semua kecerdasan, pemetaan rute, dan perhitungan waktu yang rumit dilakukan oleh Backend FastAPI yang dibantu oleh Redis.

Ini akan membuat aplikasi **Pindah Peron** terasa sangat cepat, akurat, dan sangat profesional bagi pengguna.
