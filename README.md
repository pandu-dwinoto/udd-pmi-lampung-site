# UDD Pembina PMI Provinsi Lampung

Situs informasi publik berbahasa Indonesia beserta CMS lokal untuk menyunting konten tanpa mengubah kode. Aplikasi memakai Node.js bawaan tanpa framework maupun dependensi pihak ketiga.

## Menjalankan situs dan CMS

1. Pasang Node.js 18 atau lebih baru.
2. Jalankan server lokal:

   ```powershell
   npm start
   ```

3. Buka <http://127.0.0.1:4173/>. Saat pertama membuka <http://127.0.0.1:4173/admin>, server mengarahkan ke setup lokal untuk membuat nama pengguna dan kata sandi (minimal 14 karakter, minimal 8 karakter berbeda). Setelah akun tersimpan, halaman setup ditutup dan CMS dapat dipakai.

Server hanya bind ke `127.0.0.1`; CMS tidak dapat diakses dari jaringan luar. Login dibatasi 5 percobaan per 15 menit, sesi memakai cookie `HttpOnly`/`SameSite=Strict`, dan perubahan konten memerlukan token CSRF. Jangan membuka port server ke internet atau memublikasikan folder `private/`.

Ganti kata sandi kapan saja dengan `npm run change-password` (terminal interaktif). Sesi CMS yang sedang aktif otomatis tidak berlaku karena server memeriksa cap waktu berkas kredensial.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm start` | Menjalankan situs + CMS di `127.0.0.1:4173`. |
| `npm test` | Cek sintaks JS, validitas `content.json`, tautan, berkas media, dan token versi. |
| `npm run bump` | Memperbarui token `?v=` di `index.html`, `script.js`, dan `lastmod` sitemap. |
| `npm run setup-admin` | Membuat akun lewat terminal (alternatif halaman setup). |
| `npm run change-password` | Mengganti kata sandi akun CMS. |

CI di `.github/workflows/ci.yml` menjalankan `npm test` pada setiap push/PR.

Jika PowerShell memblokir `npm.ps1` karena execution policy, gunakan `npm.cmd` (misalnya `npm.cmd test` dan `npm.cmd start`).

## Menyunting dan memublikasikan konten

Masuk ke CMS, pilih bagian pada navigasi editor, lalu ubah kolom yang diperlukan. Seluruh teks situs, metadata SEO, menu, layanan, kontak, jam, FAQ, berita/kegiatan, dan tautan referensi disimpan terstruktur di `content.json`. CMS menyediakan tambah/hapus serta pengurutan item pada daftar seperti menu, layanan, berita, FAQ, kontak, dan langkah layanan.

Unggah logo/gambar dari bagian **Media** (PNG, JPEG, WebP hingga 5 MB). Berkas disimpan di `media/` dan disajikan sebagai aset publik. Jangan unggah foto sensitif atau data pribadi.

- **Pratinjau draf** menampilkan perubahan di iframe sebelum publikasi.
- **Simpan & publikasikan** menulis `content.json` secara atomik dan menyimpan cadangan bertimestamp di `backups/` (maksimal 20 berkas, berkas terlama dihapus otomatis).
- Editor memakai versi konten (hash) untuk mencegah dua tab saling menimpa. Jika konten berubah di tempat lain, editor dimuat ulang dan perubahan perlu diulang.
- Peringatan muncul jika menutup tab dengan draf yang belum disimpan.

`content.json` juga dapat disunting manual. Jika server sedang berjalan, muat ulang halaman publik setelah menyimpan.

## Caching, kompresi, dan keamanan

- HTML/CSS/JS/JSON dikirim dengan `Cache-Control: no-cache` + `ETag`, sehingga browser melakukan revalidasi dan menerima `304` bila tidak berubah.
- `media/` dan `assets/` memakai cache `immutable` selama satu tahun karena nama berkas unik/berversi.
- Respons teks dikompresi gzip bila klien mendukung.
- Header keamanan: CSP, `nosniff`, `Referrer-Policy`, `X-Frame-Options`, dan `Permissions-Policy`.
- API admin dan halaman CMS memakai `Cache-Control: no-store`.

## Situs publik

Versi publik statis tersedia di <https://pandu-dwinoto.github.io/udd-pmi-lampung-site/>. Source dan CMS berada di repository privat ini; repository publik terpisah hanya memuat halaman, konten, lambang, dan gambar yang ditampilkan ke pengunjung.

Checklist publikasi:

1. Jalankan `npm test`.
2. Jalankan `npm run bump` agar cache pengunjung mengambil versi baru.
3. Salin `index.html`, `script.js`, `styles.css`, `content.json`, `robots.txt`, `sitemap.xml`, `404.html`, `assets/`, dan aset `media/` yang dipakai ke repository publik, lalu push.
4. Jangan menyalin `server.js`, halaman CMS, `private/`, atau `backups/`.

Catatan penting untuk GitHub Pages:

- `robots.txt` dan `sitemap.xml` pada project Pages berada di subpath (`/udd-pmi-lampung-site/`). Crawler hanya membaca `robots.txt` di root domain, sehingga aturan `Disallow` tidak berlaku. Daftarkan sitemap secara manual di Google Search Console, atau pindahkan situs ke domain/subdomain sendiri agar `robots.txt` efektif.
- Header HTTP dari `server.js` tidak berlaku di GitHub Pages. CSP di `index.html` tetap aktif lewat `<meta>`, tetapi tanpa `frame-ancestors`; gunakan hosting yang mendukung header kustom bila perlindungan clickjacking diperlukan.
- Canonical, Open Graph, dan `sameAs` masih menunjuk ke URL GitHub Pages. Perbarui bila pindah domain.

## Sumber dan batasan konten

- Jam layanan: situs [PMI Lampung](https://www.pmilampung.or.id/donor-darah) mencantumkan UDD Pembina buka 24 jam dan gerai donor Markas PMI setiap Jumat pukul 10.00–15.00 WIB.
- Alamat: Jl. Sam Ratulangi No. 105, Penengahan, Bandar Lampung.
- Telepon UDD: (0721) 702147 dan (0721) 703020, bersumber dari direktori [Kontak PMI – Ayodonor](https://ayodonor.pmi.or.id/kontakpmi.php). Call Center PMI Provinsi Lampung: 0811 7979 972 (kanal provinsi, bukan kontak khusus UDD). WhatsApp Humas 0811 790 3020 tercantum pada profil resmi UDD.
- Pimpinan: Ketua Pengurus PMI Provinsi Lampung Purnama Wulan Sari Mirza (2025–2030); Plt. Kepala UDD dr. Zam Zanariah Ibrahim, Sp.S., M.Kes. Konfirmasikan jabatan terbaru sebelum publikasi resmi.
- Teks edukasi ditinjau pada 24 Oktober 2026 dengan rujukan Permenkes No. 91 Tahun 2015 (https://jdih.kemkes.go.id/storage/documents/pdfs/2015permenkes091.pdf), terutama informasi dan seleksi pendonor (halaman tercetak 54–57) serta uji silang serasi (halaman tercetak 205–206). Tidak ada janji penyelesaian permintaan dalam tiga jam. Kelayakan donor ditetapkan petugas; indikasi transfusi ditetapkan dokter. Tarif BPPD, jadwal layanan, kontak, dan klaim aplikasi harus dikonfirmasi pengelola; bukan ketentuan yang ditetapkan Permenkes tersebut. Peninjauan editorial ini bukan sertifikasi kepatuhan operasional UDD.
- Kabar & Kegiatan diarahkan ke kanal digital UDD (Instagram/YouTube), bukan kanal PMI Provinsi. Unggahan lama diberi tahun eksplisit agar tidak disalahartikan sebagai agenda mendatang.
- Foto beranda menampilkan dr. Zam Zanariah Ibrahim, bersumber dari artikel profil Metropolis dan disimpan di `media/`. Galeri memakai dua foto pratinjau dari unggahan resmi Instagram UDD (5 dan 4 Oktober 2026) dengan tautan sumber.
- SaiDonor dirangkum dari listing Google Play, halaman Keamanan Data, dan kebijakan privasi pengembang; tangkapan layar telah disamarkan. Angka stok/agenda pada gambar bukan data terkini.
- Lambang PMI diambil dari favicon situs resmi PMI Lampung. UU No. 1 Tahun 2018 Pasal 23–25 mengatur bentuk dan penggunaan lambang; penggunaan oleh pihak lain memerlukan persetujuan Pengurus Pusat PMI. Konfirmasikan izin dan minta berkas master/pedoman identitas sebelum publikasi resmi.
- Situs tidak memuat formulir data kesehatan/PII pengunjung dan tidak menampilkan stok darah langsung.
