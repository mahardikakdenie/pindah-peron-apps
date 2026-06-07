---

![alt text](image-1.png)

````markdown
# Konteks

Kamu adalah Senior React Native Developer. Tugasmu adalah mengintegrasikan API jadwal Kereta Commuter Line (KRL) KCI ke dalam aplikasi React Native yang sedang saya kembangkan.

# Deskripsi API

Saya telah melakukan _reverse-engineering_ pada web KCI dan mendapatkan tiga _endpoint_ API beserta struktur JSON responsnya. API ini membutuhkan _header_ spesifik (terutama `User-Agent` dan `Accept`) agar _request_ berhasil.

## 1. Endpoint: Get Data Stations

- **Method:** `GET`
- **URL:** `https://kci.id/api/krl/stations`
- **Fungsi:** Mengambil daftar semua stasiun KRL yang aktif.
- **Contoh Response:**

```json
{
	"status": 200,
	"message": "Success",
	"data": [
		{
			"sta_id": "WIL0",
			"sta_name": "AREA JABODETABEK",
			"group_wil": 0,
			"fg_enable": 0
		},
		{
			"sta_id": "CIT",
			"sta_name": "CIBITUNG",
			"group_wil": 0,
			"fg_enable": 1
		}
	]
}
```
````

## 2. Endpoint: Get Data Schedules

- **Method:** `GET`
- **URL:** `https://kci.id/api/krl/schedules?stationid={STA_ID}&timefrom={HH:MM}&timeto={HH:MM}`
- **Fungsi:** Mengambil jadwal kereta di stasiun tertentu (`stationid`) pada rentang waktu tertentu.
- **Contoh Response:**

```json
{
	"status": 200,
	"data": [
		{
			"train_id": "6059A",
			"ka_name": "COMMUTER LINE CIKARANG",
			"route_name": "CIKARANG-KAMPUNGBANDAN VIA PSE",
			"dest": "KAMPUNGBANDAN VIA PSE",
			"time_est": "17:04:00",
			"color": "#0084D8",
			"dest_time": "18:17:00"
		}
	]
}
```

## 3. Endpoint: Get Data Details Trains

- **Method:** `GET`
- **URL:** `https://kci.id/api/krl/train-schedule?trainid={TRAIN_ID}`
- **Fungsi:** Mengambil detail urutan stasiun yang dilewati oleh satu ID kereta spesifik.
- **Contoh Response:**

```json
{
	"status": 200,
	"data": [
		{
			"train_id": "6059A",
			"ka_name": "COMMUTER LINE CIKARANG",
			"station_id": "CIT",
			"station_name": "CIBITUNG",
			"time_est": "17:04:00",
			"transit_station": false,
			"color": "#0084D8",
			"transit": ""
		}
	]
}
```

# Tugas Utama

Buatkan implementasi kode React Native dengan _requirements_ berikut:

1. **API Service Integration:** - Buat satu _file_ _service_ (misal: `krlApi.js` atau `.ts`) menggunakan `axios` atau `fetch`.

- Implementasikan fungsi untuk ketiga _endpoint_ tersebut.
- **Penting:** Sertakan _header_ replikasi _browser_ pada setiap _request_, contohnya:
  `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36` dan `Accept: application/json`.

2. **UI Components & State Management:**

- Buat satu komponen layar utama (`ScheduleScreen`).
- Gunakan `useState` dan `useEffect` untuk mengelola data stasiun, jadwal, dan _loading state_.
- Buat UI _Dropdown_ / _Picker_ agar _user_ bisa memilih Stasiun (filter data di mana `fg_enable: 1`).
- Gunakan `FlatList` untuk me-_render_ daftar jadwal kereta yang lewat (berdasarkan `Get Data Schedules`).
- Terapkan warna dinamis pada UI menggunakan properti `color` dari API (contoh: `#0084D8`).

3. **Detail View (Modal/BottomSheet):**

- Ketika _user_ menekan salah satu jadwal di `FlatList`, panggil _endpoint_ `Get Data Details Trains`.
- Tampilkan rute stasiun-stasiun yang dilewati kereta tersebut dalam bentuk _timeline list_ sederhana di dalam sebuah _Modal_.

Tolong berikan kode yang rapi, terstruktur, dan siap untuk langsung dijalankan.

```

***

### Catatan Tambahan Terkait API KCI

Karena *request* aslimu menyertakan parameter `Cookie` (dengan token Laravel `XSRF-TOKEN`, sesi Datadog, dll.), ada kemungkinan API KCI menerapkan proteksi anti-bot atau validasi CSRF yang ketat.

Jika nanti implementasi kode React Native langsung mengalami masalah **CORS** atau *Unauthorized/Forbidden*, solusi paling aman adalah tidak melakukan *fetch* langsung dari aplikasi *mobile*. Kamu bisa membuat *backend proxy* sederhana (misalnya menggunakan fungsi Golang atau Next.js API Routes yang biasa kamu gunakan) untuk me-*request* data ke server KCI, lalu meneruskannya kembali ke aplikasi React Native-mu.

```
