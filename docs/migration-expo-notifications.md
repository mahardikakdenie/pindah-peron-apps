Tentu, ini adalah panduan lengkapnya dalam format Markdown (`.md`) agar mudah Anda salin dan simpan di dokumentasi proyek Anda.

````markdown
# 🛠️ Panduan Migrasi: Expo Go ke Development Build (Fix Push Notifications)

Pesan error `expo-notifications functionality is not fully supported in Expo Go` muncul karena Expo SDK 53+ tidak lagi mendukung Remote Push Notifications di dalam aplikasi _sandbox_ Expo Go. Solusi wajib untuk fitur ini adalah beralih menggunakan **Development Build**.

Ikuti langkah-langkah di bawah ini untuk mengatasinya:

---

## Langkah 1: Install Expo Dev Client

Tambahkan pustaka `expo-dev-client` ke dalam proyek Anda untuk mengaktifkan kapabilitas _custom build_. Buka terminal di folder proyek dan jalankan:

```bash
npx expo install expo-dev-client
```
````

## Langkah 2: Setup Firebase Cloud Messaging (FCM)

Untuk menerima notifikasi jarak jauh di ekosistem Android, Anda memerlukan Firebase.

1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat proyek baru (misalnya: "Pindah Peron Apps").
2. Tambahkan aplikasi Android ke dalam proyek tersebut. Pastikan mengisi **Package Name** (misalnya: `com.pindahperon.app`).
3. Unduh file konfigurasi **`google-services.json`** yang diberikan oleh Firebase.
4. Pindahkan file `google-services.json` tersebut ke _root_ direktori proyek React Native Anda (posisinya harus sejajar dengan file `app.json`).

## Langkah 3: Konfigurasi `app.json`

Daftarkan _package name_ dan _path_ file Firebase yang baru saja diunduh ke dalam konfigurasi aplikasi. Buka file `app.json` dan tambahkan blok `android` serta `plugins` seperti berikut:

```json
{
	"expo": {
		"name": "Pindah Peron",
		"android": {
			"package": "com.pindahperon.app",
			"googleServicesFile": "./google-services.json"
		},
		"plugins": ["expo-dev-client", "expo-notifications"]
	}
}
```

## Langkah 4: Build Custom APK dengan EAS

Gunakan Expo Application Services (EAS) untuk melakukan _compile_ dan membuat _file_ APK _development_ Anda sendiri.

1. Pastikan Anda sudah masuk ke akun Expo melalui terminal:

```bash
   npx expo login

```

2. Inisialisasi konfigurasi EAS di dalam proyek Anda:

```bash
   npx eas build:configure

```

3. Jalankan perintah _build_ untuk platform Android (proses ini berjalan di server Expo dan mungkin memakan waktu beberapa menit):

```bash
   npx eas build --profile development --platform android

```

## Langkah 5: Jalankan Development Client

Setelah proses _build_ di server EAS selesai, ikuti langkah terakhir ini untuk mulai melakukan pengetesan:

1. Unduh file `.apk` dari _link_ atau pindai _QR Code_ yang muncul di terminal setelah eksekusi Langkah 4 selesai.
2. Pasang (install) file `.apk` tersebut di HP Android Anda.
3. Jalankan _development server_ di komputer Anda dengan menambahkan parameter _client_:

```bash
   npx expo start --dev-client

```

4. Buka aplikasi "Pindah Peron" yang baru saja diinstal di HP Anda (Jangan menggunakan Expo Go). Aplikasi akan mendeteksi server lokal secara otomatis dan melakukan _bundling_ kode Anda.

```

```
