"use strict";

const pages = {
  "tentang-udd": {
    eyebrow: "TENTANG UDD",
    title: "Mengenal UDD Pembina.",
    intro: "Unit pelayanan darah PMI Provinsi Lampung.",
    about: {
      tag: "PROFIL LEMBAGA",
      name: "Unit Donor Darah Pembina PMI",
      location: "Provinsi Lampung",
      description: "Pelayanan meliputi donor darah, pengolahan komponen darah, dan penyediaan darah bagi fasilitas kesehatan di Provinsi Lampung.",
      facts: [
        ["Alamat", "Jl. Sam Ratulangi No. 105, Penengahan, Bandar Lampung"],
        ["Permintaan darah", "24 jam setiap hari"],
        ["Donor darah", "Setiap hari · 07.30–21.00 WIB"]
      ],
      leader: ["dr. Zam Zanariah Ibrahim, Sp.S., M.Kes.", "Plt. Kepala UDD Pembina"],
      leaderImage: "media/7feec85c323f6d29f4b89b56.jpg",
      video: {
        title: "Company Profile Unit Donor Darah Pembina PMI Provinsi Lampung",
        label: "VIDEO PROFIL · YOUTUBE UDD",
        thumbnail: "media/9f8e7d6c5b4a3210fedcba98.png",
        href: "https://www.youtube.com/watch?v=ckuFZfs0DDQ"
      }
    },
    sections: [
      ["Lingkup layanan", "Pelayanan mencakup penerimaan pendonor, pengambilan dan pengolahan darah, penyimpanan, serta penyediaan darah dan komponen darah untuk pelayanan transfusi."],
      ["Kepemimpinan", "Pelayanan UDD Pembina PMI Provinsi Lampung dipimpin oleh Plt. Kepala UDD dan didukung pengurus PMI Provinsi Lampung."],
      ["Dasar penyelenggaraan", "Pelayanan darah dilaksanakan sesuai ketentuan peraturan perundang-undangan dan standar pelayanan yang berlaku."]
    ],
    action: ["Lihat kontak UDD", "halaman.html?page=kontak"]
  },
  "layanan": {
    eyebrow: "LAYANAN UDD",
    title: "Dukungan layanan darah untuk Lampung.",
    intro: "Pilih informasi sesuai kebutuhan Anda. Untuk kondisi dan persyaratan terbaru, konfirmasikan kepada petugas UDD.",
    cards: [
      ["Donor darah", "Informasi persiapan, kriteria umum, alur donor, dan perawatan setelah donor.", "halaman.html?page=donor"],
      ["Permintaan darah", "Alur permintaan melalui fasilitas kesehatan, komponen darah, pemeriksaan pratransfusi, dan BPPD.", "halaman.html?page=permintaan-darah"],
      ["Mobile Unit", "Informasi kegiatan donor darah di luar gedung melalui agenda SaiDonor.", "index.html#saidonor"],
      ["Kanal resmi", "Kontak telepon, WhatsApp Humas, lokasi, dan jam pelayanan UDD.", "halaman.html?page=kontak"]
    ]
  },
  "donor": {
    eyebrow: "PANDUAN DONOR",
    title: "Donor darah dimulai dari persiapan yang baik.",
    intro: "Kenali langkah penting sebelum, selama, dan setelah donor. Kelayakan akhir ditentukan petugas UDD melalui pemeriksaan.",
    cards: [
      ["Sebelum datang", "Bawa KTP, SIM, atau paspor. Tidur cukup, makan sebelum donor, cukupi minum, dan sisihkan waktu untuk pemeriksaan."],
      ["Saat di UDD", "Isi kuesioner kesehatan dengan jujur. Petugas meninjau riwayat kesehatan, kondisi fisik, kadar hemoglobin, dan menjelaskan proses donor."],
      ["Setelah donor", "Beristirahat sampai siap pulang. Jika merasa pusing atau tidak nyaman, segera beri tahu petugas UDD."],
      ["Jam donor", "Donor darah tersedia setiap hari pukul 07.30–21.00 WIB di UDD Pembina PMI Provinsi Lampung."]
    ],
    action: ["Baca panduan lengkap di beranda", "index.html#donor"]
  },
  "permintaan-darah": {
    eyebrow: "PERMINTAAN DARAH",
    title: "Permintaan darah, langkah demi langkah.",
    intro: "Permintaan darah diajukan melalui fasilitas kesehatan berdasarkan kebutuhan yang ditetapkan dokter yang merawat pasien.",
    cards: [
      ["1 · Permintaan oleh dokter", "Fasilitas kesehatan mengajukan formulir dan sampel pasien sesuai prosedur."],
      ["2 · Verifikasi", "Petugas memeriksa kelengkapan dokumen, identitas, dan ketersediaan darah."],
      ["3 · Pemeriksaan pratransfusi", "Dilakukan pemeriksaan golongan darah dan uji silang serasi sesuai kebutuhan."],
      ["4 · Penyerahan", "Darah diserahkan sesuai hasil pemeriksaan dan prosedur pengiriman."]
    ],
    action: ["Hubungi layanan 24 jam", "halaman.html?page=kontak"]
  },
  "mobile-unit": {
    eyebrow: "MOBILE UNIT",
    title: "Donor darah hadir lebih dekat.",
    intro: "Mobile Unit membantu penyelenggara menghadirkan kegiatan donor darah di luar gedung UDD.",
    cards: [
      ["Untuk pendonor", "Lihat agenda kegiatan, lokasi, dan waktu donor melalui aplikasi SaiDonor sebelum datang."],
      ["Untuk penyelenggara", "Rencanakan kegiatan bersama UDD dan koordinasikan jadwal, lokasi, serta kebutuhan teknis sejak awal."],
      ["Sebelum berkunjung", "Pastikan jadwal dan lokasi masih berlaku melalui kanal resmi penyelenggara atau UDD."],
      ["Kanal agenda", "Agenda Mobile Unit tersedia melalui aplikasi SaiDonor PMI Provinsi Lampung."]
    ],
    action: ["Lihat aplikasi SaiDonor", "index.html#saidonor"]
  },
  "berita": {
    eyebrow: "BERITA & EDUKASI",
    title: "Kabar dan edukasi dari UDD.",
    intro: "Ikuti informasi kegiatan, edukasi kependonoran, dan kabar resmi UDD Pembina PMI Provinsi Lampung.",
    cards: [
      ["Edukasi donor", "Kesiapan diri, kriteria umum, alur donor, dan informasi setelah donor."],
      ["Kegiatan UDD", "Dokumentasi kegiatan donor darah dan kolaborasi kemanusiaan bersama masyarakat Lampung."],
      ["Kabar lembaga", "Informasi kelembagaan dan perkembangan layanan UDD Pembina."],
      ["Kanal resmi", "Ikuti Instagram, YouTube, dan TikTok UDD untuk informasi terbaru.", "index.html#informasi"]
    ],
    action: ["Lihat kabar di beranda", "index.html#informasi"]
  },
  "faq": {
    eyebrow: "PERTANYAAN UMUM",
    title: "Jawaban untuk hal yang sering ditanyakan.",
    intro: "Temukan jawaban singkat tentang donor, permintaan darah, kelayakan, dan kontak UDD.",
    faqs: [
      ["Kapan saya bisa donor darah?", "Donor darah tersedia setiap hari pukul 07.30–21.00 WIB. Kelayakan ditentukan petugas setelah pemeriksaan."],
      ["Apa yang perlu dibawa saat donor?", "Bawa KTP, SIM, atau paspor. Jika pernah donor, kartu donor dapat dibawa bila tersedia."],
      ["Bagaimana permintaan darah diajukan?", "Permintaan diajukan melalui fasilitas kesehatan yang merawat pasien sesuai kebutuhan dokter dan prosedur pelayanan."],
      ["Apakah permintaan darah dilayani 24 jam?", "Ya. Pelayanan permintaan darah tersedia 24 jam setiap hari melalui UDD dan fasilitas kesehatan."],
      ["Bagaimana menghubungi UDD?", "Gunakan telepon UDD, WhatsApp Humas, atau datang ke alamat layanan yang tercantum di halaman kontak."]
    ],
    action: ["Lihat kontak UDD", "halaman.html?page=kontak"]
  },
  "kontak": {
    eyebrow: "KONTAK & LOKASI",
    title: "Hubungi UDD dengan mudah.",
    intro: "Gunakan kanal resmi untuk memperoleh informasi layanan, ketersediaan, dan arahan sebelum berkunjung.",
    cards: [
      ["Telepon UDD Pembina", "(0721) 702147", "tel:+62721702147"],
      ["Saluran kedua", "(0721) 703020", "tel:+62721703020"],
      ["WhatsApp Humas UDD", "0811 790 3020", "https://wa.me/628117903020"],
      ["Alamat layanan", "Jl. Sam Ratulangi No. 105, Penengahan, Bandar Lampung.", "https://www.google.com/maps/place/?q=place_id:ChIJLcX8tvvaQC4R0qqmUuzVKXw"],
      ["Jam layanan", "Permintaan darah 24 jam setiap hari. Donor darah setiap hari pukul 07.30–21.00 WIB."]
    ]
  },
  "privasi": {
    eyebrow: "KEBIJAKAN PRIVASI",
    title: "Privasi dan penggunaan informasi.",
    intro: "Halaman ini menjelaskan prinsip umum perlindungan informasi saat Anda menggunakan website UDD.",
    sections: [
      ["Informasi yang dikumpulkan", "Website ini berisi informasi publik dan tidak meminta data kesehatan untuk membaca panduan. Jika Anda menghubungi kanal eksternal, periksa kebijakan privasi kanal tersebut."],
      ["Tautan pihak ketiga", "Tautan ke WhatsApp, Google Maps, Google Play, dan media sosial membawa Anda ke layanan pihak ketiga dengan kebijakan masing-masing."],
      ["Aplikasi SaiDonor", "Untuk informasi penggunaan data pada SaiDonor, baca kebijakan privasi yang dicantumkan oleh pengembang di halaman aplikasi."],
      ["Pembaruan", "Informasi layanan dapat berubah. Konfirmasikan jam, agenda, dan persyaratan terbaru melalui kanal resmi UDD."]
    ]
  },
  "peta-situs": {
    eyebrow: "PETA SITUS",
    title: "Temukan semua informasi UDD.",
    intro: "Gunakan daftar ini untuk berpindah ke halaman layanan yang Anda perlukan.",
    cards: [
      ["Tentang UDD", "Profil, pimpinan, lokasi, dan jam pelayanan.", "halaman.html?page=tentang-udd"],
      ["Layanan UDD", "Donor darah, permintaan darah, dan Mobile Unit.", "halaman.html?page=layanan"],
      ["Panduan donor", "Persiapan, alur, dan informasi setelah donor.", "halaman.html?page=donor"],
      ["Permintaan darah", "Alur, pemeriksaan pratransfusi, dan kontak layanan.", "halaman.html?page=permintaan-darah"],
      ["Berita & edukasi", "Kabar kegiatan dan materi edukasi UDD.", "halaman.html?page=berita"],
      ["FAQ & kontak", "Jawaban umum, lokasi, telepon, dan WhatsApp UDD.", "halaman.html?page=faq"]
    ]
  }
};

const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const pageLink = (href, label) => `<a href="${esc(href)}">${esc(label)} <span aria-hidden="true">→</span></a>`;
const navItems = [
  ["Tentang UDD", "tentang-udd"], ["Layanan", "layanan"], ["Donor Darah", "donor"],
  ["Butuh Darah", "permintaan-darah"], ["Berita", "berita"], ["FAQ", "faq"], ["Kontak UDD", "kontak"]
];

function renderNavigation() {
  document.querySelector("#site-nav").innerHTML = navItems.map(([label, page], index) => `<a href="halaman.html?page=${page}"${index === navItems.length - 1 ? ' class="nav-cta"' : ""}>${esc(label)}${index === navItems.length - 1 ? ' <span aria-hidden="true">↗</span>' : ""}</a>`).join("");
  const toggle = document.querySelector(".menu-toggle");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Buka menu navigasi" : "Tutup menu navigasi");
    document.querySelector("#site-nav").classList.toggle("is-open", !open);
  });
}

function renderFooter() {
  document.querySelector("#footer").innerHTML = `<div class="section-wrap footer-main"><p><strong>UDD Pembina PMI Provinsi Lampung</strong><span>Panduan donor, informasi layanan, dan kontak resmi UDD.</span></p><nav class="footer-navigation" aria-label="Jelajahi situs"><div class="footer-nav-group"><span>Layanan</span>${pageLink("halaman.html?page=donor", "Informasi donor")}${pageLink("halaman.html?page=permintaan-darah", "Permintaan darah")}${pageLink("halaman.html?page=layanan", "Layanan UDD")}</div><div class="footer-nav-group"><span>Informasi</span>${pageLink("halaman.html?page=tentang-udd", "Tentang UDD")}${pageLink("halaman.html?page=berita", "Kabar & kegiatan")}${pageLink("halaman.html?page=faq", "FAQ")}${pageLink("halaman.html?page=kontak", "Lokasi & kontak")}${pageLink("halaman.html?page=privasi", "Kebijakan privasi")}${pageLink("halaman.html?page=peta-situs", "Peta situs")}</div></nav><a class="back-top" href="index.html#beranda">Kembali ke beranda <span aria-hidden="true">↑</span></a></div><div class="section-wrap footer-bottom"><span class="footer-copyright">© 2026 · UDD Pembina PMI Provinsi Lampung</span><span class="footer-note">Informasi edukatif. Kelayakan donor ditetapkan petugas UDD.</span></div>`;
}

function renderAbout(page) {
  if (!page.about) return "";
  const about = page.about;
  const facts = (about.facts || []).map(([label, value]) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("");
  return `<section class="about-layout" aria-label="Profil UDD Pembina"><article class="about-identity"><div class="about-copy"><p class="eyebrow">${esc(about.tag)}</p><h2>${esc(about.name)}<br><span>${esc(about.location)}</span></h2><p>${esc(about.description)}</p></div><div class="about-facts">${facts}</div></article><figure class="about-leadership"><img src="${esc(about.leaderImage)}" alt="${esc(about.leader[0])}" loading="lazy"><figcaption><span>PIMPINAN UDD PEMBINA</span><strong>${esc(about.leader[0])}</strong><p>${esc(about.leader[1])}</p></figcaption></figure></section>`;
}

function renderAboutSections(page) {
  if (!page.about) return "";
  return `<section class="about-notes" aria-label="Informasi kelembagaan">${(page.sections || []).map(([title, text], index) => `<article class="about-note"><span>0${index + 1}</span><h2>${esc(title)}</h2><p>${esc(text)}</p></article>`).join("")}</section>`;
}

function renderAboutVideo(page) {
  const video = page.about && page.about.video;
  if (!video) return "";
  return `<a class="about-video" href="${esc(video.href)}" target="_blank" rel="noopener noreferrer" aria-label="Tonton ${esc(video.title)} di YouTube"><span class="about-video-thumb"><img src="${esc(video.thumbnail)}" alt="Ilustrasi suasana donor darah untuk video profil UDD" loading="lazy"><span class="about-video-poster-label">VIDEO PROFIL UDD</span><span class="about-video-play" aria-hidden="true">▶</span></span><span class="about-video-copy"><span>${esc(video.label)}</span><strong>${esc(video.title)}</strong><em>Putar di YouTube <b aria-hidden="true">↗</b></em></span></a>`;
}

function renderPage() {
  const key = new URLSearchParams(window.location.search).get("page") || "tentang-udd";
  const page = pages[key] || pages["tentang-udd"];
  document.title = `${page.title.replace(/\.$/, "")} | UDD Pembina PMI Provinsi Lampung`;
  const cards = (page.cards || []).map(([title, text, href], index) => `<article class="inner-card"><span class="inner-card-index">${String(index + 1).padStart(2, "0")}</span><h2>${esc(title)}</h2><p>${esc(text)}</p>${href ? pageLink(href, "Buka informasi") : ""}</article>`).join("");
  const faqs = (page.faqs || []).map(([q, a]) => `<details class="inner-faq"><summary>${esc(q)}<span aria-hidden="true">+</span></summary><p>${esc(a)}</p></details>`).join("");
  const sections = (page.sections || []).map(([title, text]) => `<article class="inner-reading"><h2>${esc(title)}</h2><p>${esc(text)}</p></article>`).join("");
  const reading = page.about ? renderAboutSections(page) : (page.sections ? `<div class="inner-reading-list">${sections}</div>` : "");
  const hero = page.about ? "" : `<section class="inner-hero section-wrap"><div><p class="eyebrow">${esc(page.eyebrow)}</p><h1>${esc(page.title)}</h1><p class="inner-intro">${esc(page.intro)}</p></div></section>`;
  const bodyClass = page.about ? "inner-body section-wrap inner-body--about" : "inner-body section-wrap";
  document.querySelector("#konten").innerHTML = `${hero}<div class="${bodyClass}">${renderAbout(page)}${page.cards ? `<div class="inner-grid">${cards}</div>` : ""}${page.faqs ? `<div class="inner-faq-list">${faqs}</div>` : ""}${reading}${renderAboutVideo(page)}${page.action ? `<div class="inner-actions">${pageLink(page.action[1], page.action[0])}</div>` : ""}</div>`;
}

renderNavigation();
renderPage();
renderFooter();
