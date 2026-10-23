# UDD PMI Provinsi Lampung

Situs informasi publik berbahasa Indonesia beserta CMS lokal untuk menyunting konten tanpa mengubah kode. Aplikasi menggunakan Node.js bawaan dan tidak memerlukan framework atau layanan pihak ketiga.

## Menjalankan situs dan CMS

1. Pasang Node.js 18 atau lebih baru.
2. Jalankan server lokal:

   ```powershell
   node server.js
   ```
3. Buka situs publik di <http://127.0.0.1:4173/>. Pertama kali membuka <http://127.0.0.1:4173/admin>, server mengarahkan Anda ke setup lokal untuk membuat nama pengguna dan kata sandi baru minimal 14 karakter. Setelah akun tersimpan, halaman setup ditutup dan Anda masuk ke CMS.

Alternatifnya, jalankan `npm.cmd start` dari PowerShell. `node setup-admin.js` tetap tersedia sebagai opsi setup melalui terminal interaktif.

Server hanya bind ke `127.0.0.1`; CMS tidak dapat diakses dari jaringan luar. Setup akun pertama hanya aktif jika akun belum ada dan hanya menerima koneksi lokal. Login membatasi percobaan, sesi memakai cookie `HttpOnly`/`SameSite=Strict`, dan perubahan CMS memerlukan token CSRF. Jangan membuka port server ke internet atau memublikasikan folder `private/`.

## Situs publik

Versi publik statis tersedia di <https://pandu-dwinoto.github.io/udd-pmi-lampung-site/>. Source dan CMS tetap berada di repository privat ini; repository publik terpisah hanya berisi halaman, konten, lambang, dan gambar yang memang ditampilkan ke pengunjung. Setelah menyunting CMS lokal, sinkronkan `index.html`, `script.js`, `styles.css`, `content.json`, `assets/pmi-official-favicon.png`, dan aset `media/` yang dipakai ke repository publik lalu push agar situs terbarui. Jangan salin server, halaman CMS, atau folder `private/`. Anggap seluruh konten dan gambar di repository publik sebagai informasi publik.

## Menyunting dan memublikasikan konten

Masuk ke CMS, pilih bagian dari navigasi editor, lalu ubah kolom yang diperlukan. Semua teks situs, metadata SEO, menu, layanan, kontak, jam, FAQ, berita/kegiatan, dan tautan referensi disimpan sebagai satu sumber terstruktur di `content.json`; CMS menyediakan tambah/hapus dan pengurutan item pada daftar seperti menu, layanan, berita, referensi, FAQ, dan kontak. Unggah logo/gambar opsional dari bagian **Media** (PNG, JPEG, WebP hingga 5 MB); file disimpan lokal di folder `media/` dan dapat disajikan secara publik sebagai aset situs. Jangan unggah foto sensitif atau data pribadi. Gunakan **Pratinjau draf** sebelum **Simpan & publikasikan**. Publikasi menyimpan perubahan ke `content.json`; versi sebelumnya dicadangkan di `content.json.bak`.

`content.json` juga dapat disunting manual dengan editor teks. Jika server sedang berjalan, muat ulang halaman publik setelah menyimpan. Simpan salinan cadangan proyek secara berkala. Jangan membagikan folder `private/` atau file cadangan kredensial/konten; folder `media/` berisi aset publik yang dipilih untuk situs.

## Sumber dan batasan konten

Rujukan operasional yang dicantumkan ialah [situs PMI Lampung](https://www.pmilampung.or.id/), [informasi donor darah](https://www.pmilampung.or.id/donor-darah), dan [lokasi donor](https://www.pmilampung.or.id/donor-darah/lokasi-donor): UDD Pembina disebut buka 24 jam, dan gerai donor di Markas PMI disebut berlangsung setiap Jumat pukul 10.00–15.00 WIB. Jadwal ini dapat berubah. Alamat UDD Pembina, Jl. Sam Ratulangi No. 105, Penengahan, Bandar Lampung, diberikan oleh pengguna. Nomor 0811 7979 972 adalah Call Center PMI Provinsi Lampung, bukan kontak khusus UDD. Ketua PMI Provinsi Lampung periode 2025–2030 dicantumkan sebagai Purnama Wulan Sari Mirza sesuai informasi yang diberikan.

Bagian **Kabar & Kegiatan** diarahkan ke kanal digital UDD (Instagram dan YouTube), bukan kanal atau situs PMI Provinsi. Arsip kegiatan UDD dari 2022 diberi tahun secara eksplisit agar tidak disalahartikan sebagai agenda mendatang; jika belum ada berita terkini yang terverifikasi, halaman menyatakannya secara terbuka.

Foto utama menampilkan dr. Zam Zanariah Ibrahim. Foto bersumber dari artikel profil [Metropolis](https://metropolis.co.id/2019/08/07/mengenal-lebih-dekat-sosok-dr-zam-zanariahsp-s-m-kes/) yang memberi keterangan nama pada fotonya; salinan lokal berada di `media/7feec85c323f6d29f4b89b56.jpg`. Pemberitaan [penugasan PMI pada Maret 2026](https://mediapublika.com/dr-zam-zanariah-ditunjuk-jadi-plt-uud-pmi-provinsi-lampung/) dan [kegiatan donor darah Mei 2026](https://www.sinarlampung.co/2026/05/06/wujudkan-kepedulian-kemanusiaan-dkd-lampung-gelar-bakti-sosial-donor-darah-bersama-plt-ketua-udd-pmi-provinsi-lampung/) menyebut beliau sebagai Plt. Kepala/Ketua UDD. Konfirmasikan jabatan terbaru dan izin penggunaan foto sebelum publikasi resmi.

Kanal UDD dan pilihan konten media sosial ditambahkan setelah pemeriksaan [Instagram UDD Pembina PMI Provinsi Lampung](https://www.instagram.com/uddpmiprovinsilampung/), [Linktree yang ditautkan profil](https://linktr.ee/UDDPEMBINAPMIPROVINSILAMPUNG), tautan Facebook, TikTok, YouTube, serta profil Instagram PMI Provinsi pada 23 Oktober 2026. Bio menyebut WhatsApp Humas 0811-790-3020; Linktree menyediakan tautan WhatsApp yang sama serta mengonfirmasi alamat Jl. Sam Ratulangi No. 105, Penengahan, Kota Bandar Lampung dan arah Google Maps. Linktree menautkan Instagram, TikTok, Facebook, YouTube, serta WhatsApp. Profil Instagram menampilkan sorotan “Edukasi”, “Syarat Donor”, “Mitos dan Fakta”, dan “Aplikasi Donorku”; isi story memerlukan login dan belum dapat diperiksa. Channel YouTube UDD menampilkan video edukasi, company profile, Pojok Baca, Caffe Donor, dokumentasi kegiatan, serta video Siger Donor Darah; daftar pilihannya ada di bagian **Kontak** situs dan dapat diedit melalui CMS.

Galeri **Dokumentasi UDD** menggunakan dua foto pratinjau dari unggahan resmi Instagram UDD: Reel [5 Oktober 2026](https://www.instagram.com/uddpmiprovinsilampung/reel/DeIw9dtTBtc/) dan Reel [4 Oktober 2026](https://www.instagram.com/uddpmiprovinsilampung/reel/DeFyLFkzKfk/). Pengguna mengonfirmasi izin penggunaan; setiap foto ditautkan kembali ke unggahan sumber. File disimpan lokal di `media/` agar tetap tampil tanpa bergantung pada URL CDN Instagram yang dapat kedaluwarsa. Teks alternatif dan keterangan foto tersedia untuk diedit dari CMS bagian **Dokumentasi UDD**. Jika izin berubah atau unggahan sumber ditarik, perbarui atau hapus gambar sebelum publikasi.

Satu unggahan Instagram UDD tentang persediaan AB/B untuk 13–20 Oktober 2026 dicatat sebagai pengumuman historis yang sudah kedaluwarsa, bukan status stok saat ini. Judul video “Syarat Donor Darah” dan sorotan terkait ditautkan saja tanpa menyalin panduan kelayakan/medis. Unggahan Facebook tidak dapat dilihat tanpa login dan halaman TikTok tidak tampil saat pemeriksaan; angka pengikut/subscriber adalah snapshot tanggal pemeriksaan dan dapat berubah. Daftar video/sorotan adalah pilihan konten yang terlihat, bukan arsip lengkap semua unggahan; kanal sumber ditautkan agar pengunjung dapat memeriksa pembaruan langsung.

Ringkasan SaiDonor pada bagian **SaiDonor** bersumber dari [listing Google Play](https://play.google.com/store/apps/details?id=id.pmilampung.saidonor&hl=id), [Keamanan Data](https://play.google.com/store/apps/datasafety?id=id.pmilampung.saidonor&hl=id), dan [kebijakan privasi yang ditautkan pengembang](https://docs.google.com/document/d/e/2PACX-1vSSzw8drGEL33LNhHKPMzvrPj6Ib7RAGJw7J16Eoxt6EjeAw8iG3VfU2eyZLE_tb-Sz4JPmXiCBofiQ/pub), diperiksa pada 23 Oktober 2026. Klaim fitur dan praktik data diatribusikan kepada listing/dokumen, bukan verifikasi independen. Bagian tersebut mencatat perbedaan informasi batas usia, alamat, dan penghapusan data. Data sensitif hanya diringkas sebagai pengungkapan aplikasi; situs ini tidak meminta data kesehatan, NIK, atau data pribadi pengunjung.

Galeri tampilan SaiDonor memakai lima tangkapan layar yang diberikan pengguna. Nama, golongan darah, status/riwayat dan jumlah donor, ID, QR, nomor HP, serta alamat pribadi pada layar terkait ditutup sebelum file disimpan ke `media/`. Angka stok dan agenda tetap merupakan cuplikan pada saat tangkapan layar dibuat, bukan data langsung atau informasi terkini; keterangan di situs mengingatkan pengunjung untuk memeriksa aplikasi. Periksa kembali redaksi dan izin penggunaan screenshot sebelum publikasi resmi.

Alur beranda mengambil inspirasi UX dari halaman [Give Blood American Red Cross](https://www.redcross.org/give-blood.html): tindakan utama yang mudah ditemukan, pintasan kebutuhan donor, serta tautan aplikasi. Informasi promosi, pencarian donor dengan kode pos, persyaratan, dan klaim layanan dari Red Cross tidak disalin karena tidak berlaku sebagai fakta atau kebijakan UDD PMI Lampung.

Lambang PMI diambil utuh dari favicon situs resmi [PMI Lampung](https://www.pmilampung.or.id/) dan disimpan sebagai `assets/pmi-official-favicon.png`; situs tidak menggambar ulang atau menambahkan bingkai pada lambang. UU No. 1 Tahun 2018 [Pasal 23–25](https://peraturan.go.id/id/uu-no-1-tahun-2018) menetapkan bentuk lambang PMI dan mengatur penggunaannya; khusus penggunaan oleh pihak lain, Pasal 25 mensyaratkan persetujuan Pengurus Pusat PMI. Pasal 17 ayat (2) juga mensyaratkan persetujuan tertulis untuk tanda asosiatif. Sebelum situs dipublikasikan sebagai kanal resmi, konfirmasikan kewenangan/izin penggunaan lambang kepada PMI dan minta berkas master serta pedoman identitas terkini. Pembaruan visual ini menjaga gambar yang ada tetap utuh; bukan pengesahan hukum atas izin penggunaan.

Alamat, kontak langsung UDD, email, perubahan jadwal, persyaratan dan prosedur donor yang disahkan, berita, serta agenda perlu dikonfirmasi sebelum publikasi. Halaman donor PMI dapat memuat materi medis lama; situs ini tidak menyalin nasihat medis atau persyaratan kelayakan darinya. CMS dan situs ini tidak memuat formulir data kesehatan/PII pengunjung atau stok darah langsung.
