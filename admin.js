"use strict";

const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[character]);

const sectionNames = {
  language: "Bahasa situs",
  meta: "SEO & metadata",
  media: "Media",
  brand: "Identitas",
  navigation: "Menu navigasi",
  hero: "Halaman utama",
  quickAccess: "Akses cepat beranda",
  notice: "Pemberitahuan",
  profile: "Profil",
  gallery: "Dokumentasi UDD",
  services: "Layanan utama",
  donor: "Syarat & alur donor",
  bloodRequest: "Permintaan darah",
  app: "Aplikasi SaiDonor",
  updates: "Berita & referensi",
  faq: "FAQ",
  contact: "Kontak",
  footer: "Footer",
  ui: "Aksesibilitas & UI"
};

const fieldNames = {
  language: "Bahasa",
  title: "Judul",
  themeColor: "Warna tema browser",
  ogTitle: "Judul pratinjau sosial",
  ogDescription: "Deskripsi pratinjau sosial",
  ogImage: "Gambar pratinjau sosial",
  logo: "Logo (opsional)",
  heroImage: "Gambar utama (opsional)",
  heroImageAlt: "Teks alternatif gambar utama",
  image: "Gambar dokumentasi",
  alt: "Teks alternatif gambar",
  sourceUrl: "Tautan unggahan sumber",
  sourceLabel: "Label tautan sumber",
  shortName: "Nama singkat",
  organization: "Nama organisasi",
  accessibleName: "Nama aksesibel",
  label: "Label",
  href: "Tautan",
  cta: "Tampilkan sebagai tombol utama",
  suffix: "Simbol di akhir label",
  eyebrow: "Label bagian",
  titleFirst: "Judul baris pertama",
  titleSecond: "Judul baris kedua",
  description: "Deskripsi",
  introduction: "Pengantar",
  note: "Catatan",
  primaryAction: "Tombol utama",
  secondaryAction: "Tombol kedua",
  artDescription: "Deskripsi ilustrasi",
  artLabel: "Teks dalam ilustrasi",
  artCaptionTitle: "Judul keterangan ilustrasi",
  artCaptionDescription: "Keterangan ilustrasi",
  artIndex: "Nomor ilustrasi",
  artLocation: "Label lokasi ilustrasi",
  footerLabel: "Label bagian bawah hero",
  footerTopics: "Topik bagian bawah hero",
  linkLabel: "Label tautan",
  quickAccess: "Akses cepat",
  quickAccessNumber: "Nomor urut kartu akses",
  quickAccessIcon: "Ikon kartu akses",
  external: "Buka tautan di tab baru",
  accent: "Tampilkan dengan warna aksen",
  icon: "Ikon (emoji/karakter)",
  number: "Nomor urut",
  status: "Label status",
  emptyIcon: "Ikon status kosong",
  emptyTitle: "Judul saat belum ada berita",
  emptyDescription: "Keterangan saat belum ada berita",
  entries: "Berita & kegiatan",
  references: "Tautan referensi",
  features: "Fitur aplikasi",
  releaseItems: "Catatan pembaruan",
  contacts: "Kontak pengembang",
  dataSafetyClaims: "Pengungkapan Keamanan Data",
  dataCollected: "Kategori data yang dicantumkan",
  privacyPurposes: "Tujuan penggunaan data",
  privacyOtherClaims: "Pernyataan dalam kebijakan privasi",
  discrepancies: "Hal yang perlu dikonfirmasi",
  playStoreUrl: "Tautan aplikasi Google Play",
  playStoreLabel: "Label tombol Google Play",
  privacyPolicyUrl: "Tautan kebijakan privasi",
  dataSafetyUrl: "Tautan Keamanan Data Google Play",
  privacyPolicyLabel: "Label tautan kebijakan privasi",
  dataSafetyLabel: "Label tautan Keamanan Data",
  sourceNote: "Catatan sumber aplikasi",
  integration: "Integrasi yang disebut listing",
  snapshot: "Ringkasan data listing",
  snapshotLabel: "Label ringkasan listing",
  releaseVersion: "Versi dan tanggal pembaruan",
  developer: "Nama pengembang",
  privacyIntro: "Pengantar privasi dan verifikasi",
  privacyLabel: "Label bagian privasi",
  featuresLabel: "Label fitur",
  releaseLabel: "Label pembaruan",
  contactLabel: "Label kontak pengembang",
  discrepancyLabel: "Label perbedaan informasi",
  question: "Pertanyaan",
  answer: "Jawaban",
  value: "Isi",
  items: "Daftar item",
  date: "Tanggal",
  category: "Kategori",
  summary: "Ringkasan",
  requirementsTitle: "Judul persiapan donor",
  requirements: "Daftar persiapan donor",
  deferralsTitle: "Judul catatan kelayakan",
  deferrals: "Catatan kelayakan donor",
  deferralsNote: "Catatan tambahan kelayakan",
  stepsTitle: "Judul alur",
  steps: "Langkah-langkah",
  tips: "Tips setelah donor",
  scheduleTitle: "Judul jadwal layanan",
  schedule: "Jadwal layanan",
  urgentTitle: "Judul kebutuhan mendesak",
  urgentDescription: "Deskripsi kebutuhan mendesak",
  urgentActions: "Aksi kebutuhan mendesak",
  componentsTitle: "Judul komponen darah",
  components: "Komponen darah",
  componentsNote: "Catatan komponen darah",
  bppdTitle: "Judul BPPD",
  bppdDescription: "Deskripsi BPPD",
  bppdPoints: "Poin BPPD",
  datetime: "Tanggal mesin (format ISO, opsional)",
  screenshotsTitle: "Judul galeri tangkapan layar",
  screenshotsNote: "Catatan tangkapan layar",
  screenshots: "Tangkapan layar aplikasi",
  profileLogoAlt: "Teks alternatif logo",
  screenshotsEyebrow: "Label galeri tangkapan layar",
  screenshotsCount: "Satuan jumlah layar",
  screenshotsHint: "Petunjuk geser galeri",
  screenshotsRegionLabel: "Label wilayah galeri",
  privacyDataSafetyHeading: "Judul keamanan data",
  privacyDataCollectedHeading: "Judul data yang dicantumkan",
  privacyPurposesHeading: "Judul tujuan penggunaan data",
  privacyProtectionHeading: "Judul perlindungan data",
  relatedAccountLabel: "Label akun terkait",
  socialChannelsCount: "Satuan jumlah kanal",
  socialContentCount: "Satuan jumlah konten",
  sourceLinksLabel: "Label tautan sumber",
  footerNavLabel: "Label navigasi footer",
  footerServicesLabel: "Judul grup layanan footer",
  footerInfoLabel: "Judul grup informasi footer",
  contactHref: "Tautan kontak",
  contactLabel: "Label kontak",
  social: "Kanal sosial & Humas UDD",
  channels: "Semua kanal UDD",
  contentItems: "Sorotan & konten publik pilihan",
  platform: "Platform",
  category: "Kategori konten",
  linkLabel: "Label tautan sumber",
  profileSummary: "Ringkasan profil Instagram",
  checkedAt: "Tanggal pemeriksaan sumber",
  footnote: "Catatan kaki",
  copyrightPrefix: "Awalan hak cipta",
  copyrightSuffix: "Akhiran hak cipta",
  backToTop: "Label kembali ke atas",
  skipLink: "Tautan lewati ke konten",
  menuOpen: "Label menu dibuka",
  menuClose: "Label menu ditutup",
  sectionNavigation: "Label navigasi utama"
};

const longFields = new Set([
  "description", "introduction", "note", "answer", "summary", "footnote",
  "emptyDescription", "ogDescription", "confirmation", "deferralsNote",
  "componentsNote", "bppdDescription", "urgentDescription"
]);

const templateForArray = (path, current) => {
  const key = path.join(".");
  const templates = {
    navigation: { label: "", href: "#" },
    "quickAccess.items": { icon: "", title: "", description: "", href: "#", external: false },
    "gallery.items": { image: "", alt: "", title: "", description: "", date: "", sourceUrl: "", sourceLabel: "Lihat unggahan sumber" },
    "services.items": { number: "", icon: "", title: "", description: "", linkLabel: "", href: "#", external: false, accent: false },
    "donor.requirements": { label: "", value: "" },
    "donor.steps": { title: "", description: "" },
    "donor.schedule": { place: "", detail: "" },
    "donor.tips": { title: "", items: [] },
    "donor.actions": { label: "", href: "#", suffix: "→" },
    "bloodRequest.steps": { title: "", description: "" },
    "bloodRequest.urgentActions": { label: "", href: "#" },
    "updates.entries": { date: "", datetime: "", category: "Kegiatan", title: "", summary: "", href: "", linkLabel: "", external: false },
    "updates.references": { label: "", href: "" },
    "faq.items": { question: "", answer: "" },
    "contact.items": { label: "", value: "", href: "" }
  };
  if (templates[key]) return structuredClone(templates[key]);
  const first = current.find((item) => item && typeof item === "object");
  if (first) return Object.fromEntries(Object.entries(first).map(([field, value]) => [field, typeof value === "boolean" ? false : typeof value === "object" ? {} : ""]));
  return "";
};

function initLogin() {
  const form = document.querySelector("#login-form");
  if (!form) return false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.querySelector("#login-message");
    const button = form.querySelector("button[type=submit]");
    const body = Object.fromEntries(new FormData(form));
    button.disabled = true;
    message.textContent = "Memeriksa akun…";
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Login gagal. Periksa nama pengguna dan kata sandi.");
      window.location.assign("/admin");
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
  return true;
}

function initSetup() {
  const form = document.querySelector("#setup-form");
  if (!form) return false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.querySelector("#setup-message");
    const button = form.querySelector("button[type=submit]");
    const data = new FormData(form);
    const password = data.get("password");
    if (password !== data.get("confirmation")) {
      message.textContent = "Kata sandi dan pengulangan belum sama.";
      return;
    }
    button.disabled = true;
    message.textContent = "Membuat akun editor lokal…";
    try {
      const response = await fetch("/api/setup-admin", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.get("username"), password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Akun editor tidak dapat dibuat.");
      window.location.assign("/admin");
    } catch (error) {
      message.textContent = error.message;
      button.disabled = false;
    }
  });
  return true;
}

function initCMS() {
  const editor = document.querySelector("#editor");
  if (!editor) return;

  const nav = document.querySelector("#section-nav");
  const status = document.querySelector("#status");
  const saveButton = document.querySelector("#save-button");
  const previewButton = document.querySelector("#preview-button");
  const previewPanel = document.querySelector("#preview-panel");
  const previewFrame = document.querySelector("#preview-frame");
  let content;
  let csrfToken;
  let version;
  let activeSection;
  let previewReady = false;
  let dirty = false;

  const showStatus = (text, isError = false) => {
    status.textContent = text;
    status.classList.toggle("error", isError);
  };
  const pathValue = (path) => path.reduce((value, part) => value == null ? undefined : value[part], content);
  const setPath = (path, value) => {
    const parent = path.slice(0, -1).reduce((node, part) => node[part], content);
    parent[path[path.length - 1]] = value;
  };
  const pathAttribute = (path) => escapeHTML(JSON.stringify(path));
  const readableName = (key, path) => {
    const contextualNames = {
      "meta.title": "Judul situs",
      "meta.description": "Deskripsi mesin pencari",
      "profile.name": "Nama unit",
      "profile.location": "Wilayah",
      "profile.description": "Deskripsi profil",
      "hero.description": "Deskripsi halaman utama",
      "hero.note": "Catatan halaman utama",
      "hero.artDescription": "Deskripsi ilustrasi halaman utama",
      "footer.note": "Catatan footer",
      "updates.entries.title": "Judul berita",
      "app.titleFirst": "Judul SaiDonor baris pertama",
      "app.titleSecond": "Judul SaiDonor baris kedua",
      "app.introduction": "Pengantar aplikasi SaiDonor",
      "app.dataCollected.details": "Rincian data yang dicantumkan",
      "contact.social.profileSummary": "Informasi profil dan sorotan Instagram",
      "contact.social.checkedAt": "Tanggal pemeriksaan kanal",
      "contact.social.contentItems": "Ringkasan konten media sosial",
      "contact.social.channels": "Kanal dan kontak yang ditautkan",
      "media.heroImageAlt": "Teks alternatif gambar utama"
    };
    return contextualNames[path.join(".")] || fieldNames[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
  };

  function renderField(key, value, path) {
    const label = readableName(key, path);
    if (Array.isArray(value)) {
      return `<section class="array-editor">
        <div class="array-heading"><h2>${escapeHTML(label)} <span>(${value.length})</span></h2><button class="add-button" type="button" data-action="add" data-path="${pathAttribute(path)}">+ Tambah item</button></div>
        ${value.map((item, index) => `<div class="array-item"><div class="array-item-top"><strong>${escapeHTML(label)} ${index + 1}</strong><div class="array-item-actions">${index > 0 ? `<button class="move-button" type="button" data-action="move-up" data-path="${pathAttribute([...path, index])}" aria-label="Pindahkan item ${index + 1} ke atas">↑</button>` : ""}${index < value.length - 1 ? `<button class="move-button" type="button" data-action="move-down" data-path="${pathAttribute([...path, index])}" aria-label="Pindahkan item ${index + 1} ke bawah">↓</button>` : ""}<button class="danger-button" type="button" data-action="remove" data-path="${pathAttribute([...path, index])}">Hapus</button></div></div>${renderField(`Item ${index + 1}`, item, [...path, index])}</div>`).join("")}
        ${value.length === 0 ? `<p class="field-help">Belum ada item. Tambahkan entri baru untuk menampilkannya pada situs.</p>` : ""}
      </section>`;
    }
    if (value !== null && typeof value === "object") {
      return `<fieldset class="object-editor"><legend>${escapeHTML(label)}</legend>${Object.entries(value).map(([childKey, childValue]) => renderField(childKey, childValue, [...path, childKey])).join("")}</fieldset>`;
    }
    if (typeof value === "boolean") {
      return `<div class="field-group"><label class="checkbox-row"><input class="field-checkbox editor-input" type="checkbox" data-path="${pathAttribute(path)}"${value ? " checked" : ""}><span class="field-label">${escapeHTML(label)}</span></label></div>`;
    }

    const stringValue = value == null ? "" : String(value);
    const fieldId = `field-${path.map((part) => String(part).replace(/[^a-zA-Z0-9_-]/g, "-")).join("-")}`;
    const isLong = longFields.has(key) || stringValue.length > 100 || stringValue.includes("\n");
    const inputMarkup = isLong
      ? `<textarea id="${fieldId}" class="field-textarea editor-input" data-path="${pathAttribute(path)}" rows="3">${escapeHTML(stringValue)}</textarea>`
      : `<input id="${fieldId}" class="field-input editor-input" type="text" data-path="${pathAttribute(path)}" value="${escapeHTML(stringValue)}" autocomplete="off">`;
    const imageField = (path[0] === "media" && ["logo", "heroImage"].includes(key)) || (path[0] === "meta" && key === "ogImage");
    const uploadId = `${fieldId}-upload`;
    const uploadMarkup = imageField ? `<div class="upload-row"><label class="field-label" for="${uploadId}">Unggah gambar baru</label><input id="${uploadId}" class="media-input" type="file" accept="image/png,image/jpeg,image/webp" data-path="${pathAttribute(path)}"><span class="field-help">PNG, JPEG, WebP · maks. 5 MB. File disimpan lokal di folder media/.</span>${stringValue ? `<img class="media-preview" src="${escapeHTML(stringValue)}" alt="Pratinjau ${escapeHTML(label)}">` : ""}</div>` : "";
    return `<div class="field-group"><label class="field-label" for="${fieldId}">${escapeHTML(label)}</label>${inputMarkup}${uploadMarkup}</div>`;
  }

  function renderSection(section) {
    activeSection = section;
    nav.querySelectorAll("button").forEach((button) => {
      if (button.dataset.section === section) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    const value = content[section];
    editor.innerHTML = `<div class="editor-heading"><p class="admin-eyebrow">EDIT KONTEN</p><h1>${escapeHTML(sectionNames[section] || section)}</h1><p>Perbarui kolom berikut. Draf tidak dipublikasikan sampai tombol simpan ditekan.</p></div>${renderField(section, value, [section])}`;
  }

  function renderSections() {
    const sections = Object.keys(content);
    nav.innerHTML = sections.map((section) => `<button class="section-nav-item" type="button" data-section="${escapeHTML(section)}">${escapeHTML(sectionNames[section] || section)}</button>`).join("");
    if (nav.dataset.bound !== "true") {
      nav.dataset.bound = "true";
      nav.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-section]");
        if (button) renderSection(button.dataset.section);
      });
    }
    renderSection(sections[0]);
  }

  editor.addEventListener("input", (event) => {
    const target = event.target;
    if (!target.matches(".editor-input")) return;
    const path = JSON.parse(target.dataset.path);
    setPath(path, target.type === "checkbox" ? target.checked : target.value);
    dirty = true;
    showStatus("Ada perubahan draf yang belum dipublikasikan.");
  });

  editor.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const path = JSON.parse(button.dataset.path);
    if (button.dataset.action === "add") {
      const array = pathValue(path);
      array.push(templateForArray(path, array));
    } else if (button.dataset.action === "remove") {
      const index = path[path.length - 1];
      const array = path.slice(0, -1).reduce((value, part) => value[part], content);
      array.splice(index, 1);
    } else if (button.dataset.action === "move-up" || button.dataset.action === "move-down") {
      const index = path[path.length - 1];
      const array = path.slice(0, -1).reduce((value, part) => value[part], content);
      const destination = button.dataset.action === "move-up" ? index - 1 : index + 1;
      if (destination >= 0 && destination < array.length) {
        const [item] = array.splice(index, 1);
        array.splice(destination, 0, item);
      }
    }
    dirty = true;
    renderSection(activeSection);
    showStatus("Draf diperbarui. Simpan untuk memublikasikan.");
  });

  editor.addEventListener("change", async (event) => {
    const input = event.target;
    if (!input.matches(".media-input") || !input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      showStatus("Ukuran gambar melebihi batas 5 MB.", true);
      input.value = "";
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      showStatus("Format gambar yang didukung: PNG, JPEG, dan WebP.", true);
      input.value = "";
      return;
    }
    try {
      showStatus("Mengunggah gambar ke penyimpanan lokal…");
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("File gambar tidak dapat dibaca."));
        reader.readAsDataURL(file);
      });
      const response = await fetch("/api/admin/media", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify({ name: file.name, mimeType: file.type, data: String(dataUrl).split(",")[1] })
      });
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gambar tidak dapat disimpan.");
      setPath(JSON.parse(input.dataset.path), result.path);
      dirty = true;
      renderSection(activeSection);
      showStatus("Gambar tersimpan lokal. Simpan perubahan untuk memublikasikannya.");
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  async function loadContent() {
    const response = await fetch("/api/admin/content", { credentials: "same-origin", headers: { Accept: "application/json" } });
    if (response.status === 401) {
      window.location.assign("/admin/login");
      return null;
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Konten CMS gagal dimuat.");
    return result;
  }

  saveButton.addEventListener("click", async () => {
    saveButton.disabled = true;
    showStatus("Menyimpan dan memublikasikan konten…");
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify({ content, version })
      });
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      const result = await response.json();
      if (response.status === 409) {
        showStatus(result.error || "Konten sudah diperbarui di tab lain. Muat ulang lalu ulangi perubahan.", true);
        const fresh = await loadContent();
        if (fresh) {
          content = fresh.content;
          csrfToken = fresh.csrfToken;
          version = fresh.version;
          dirty = false;
          renderSections();
        }
        return;
      }
      if (!response.ok) throw new Error(result.error || "Konten tidak dapat disimpan.");
      content = result.content || content;
      version = result.version || version;
      dirty = false;
      showStatus("Berhasil disimpan dan dipublikasikan. Cadangan tersimpan di folder backups/.");
    } catch (error) {
      showStatus(error.message, true);
    } finally {
      saveButton.disabled = false;
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  previewButton.addEventListener("click", () => {
    previewPanel.hidden = false;
    if (!previewFrame.getAttribute("src")) previewFrame.src = "/";
    previewPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    if (previewReady) previewFrame.contentWindow.postMessage({ type: "udd-preview-content", content }, window.location.origin);
  });
  document.querySelector("#close-preview").addEventListener("click", () => { previewPanel.hidden = true; });
  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin || event.source !== previewFrame.contentWindow) return;
    if (event.data && event.data.type === "udd-preview-ready") {
      previewReady = true;
      previewFrame.contentWindow.postMessage({ type: "udd-preview-content", content }, window.location.origin);
    }
  });

  document.querySelector("#logout-button").addEventListener("click", async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin",
      headers: { "X-CSRF-Token": csrfToken }
    });
    window.location.assign("/admin/login");
  });

  loadContent()
    .then((result) => {
      if (!result) return;
      content = result.content;
      csrfToken = result.csrfToken;
      version = result.version;
      dirty = false;
      renderSections();
      showStatus("Konten termuat dari penyimpanan lokal.");
    })
    .catch((error) => showStatus(error.message, true));
}

if (!initLogin() && !initSetup()) initCMS();
