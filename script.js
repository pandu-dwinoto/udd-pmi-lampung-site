"use strict";

let activeSiteContent;
let motionObserver;
const revealAnimations = new Set();
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const SITE_ROOT = new URL("./", window.location.href);
const OFFICIAL_PMI_LOGO = new URL("assets/pmi-official-favicon.png", SITE_ROOT).pathname;
const siteGlyphs = {
  donor: '<svg viewBox="0 0 24 24"><path d="M12 2C9.2 6.1 5.5 10.1 5.5 14a6.5 6.5 0 0 0 13 0C18.5 10.1 14.8 6.1 12 2Z"/><path d="M9 15a3.2 3.2 0 0 0 3 2"/></svg>',
  request: '<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M8.5 10h7m-7 4h7m-7 4h4"/></svg>',
  location: '<svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 0 1-11.7 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z"/><path d="M9 8.5c.4 2.6 2 4.2 4.6 4.8l1-1.2 2 .9c-.2 1.5-1.2 2.2-2.7 2-3.6-.7-6-3-6.6-6.3-.2-1.4.6-2.3 2-2.5l1 2Z"/></svg>',
  call: '<svg viewBox="0 0 24 24"><path d="M6.6 3.5h3l1.5 4-2 1.8a15 15 0 0 0 5.6 5.6l1.8-2 4 1.5v3a2 2 0 0 1-2.2 2A16.7 16.7 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/></svg>',
  app: '<svg viewBox="0 0 24 24"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10 5h4m-3 13h2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M7.5 3v4m9-4v4m-13 3.5h17m-12 4 2 2 4-4"/></svg>'
};
const siteIcon = (name) => Object.prototype.hasOwnProperty.call(siteGlyphs, name)
  ? siteGlyphs[name]
  : siteGlyphs.donor;

const socialGlyph = (label) => {
  const name = String(label || "").toLowerCase();
  if (name.includes("saidonor")) return '<svg viewBox="0 0 24 24"><rect x="6.5" y="2.5" width="11" height="19" rx="2.3"/><path d="M10 5h4m-2 12.5h.01"/><path d="M12 9c-1.5 1.8-2.3 2.9-2.3 4a2.3 2.3 0 0 0 4.6 0c0-1.1-.8-2.2-2.3-4Z"/></svg>';
  if (name.includes("instagram")) return '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.7"/><circle cx="17.4" cy="6.7" r=".8" fill="currentColor" stroke="none"/></svg>';
  if (name.includes("youtube")) return '<svg viewBox="0 0 24 24"><path d="M21 12c0 2.4-.3 4.1-.7 5.1-.3.8-.9 1.4-1.7 1.7-1 .4-2.9.7-6.6.7s-5.6-.3-6.6-.7c-.8-.3-1.4-.9-1.7-1.7C3.3 16.1 3 14.4 3 12s.3-4.1.7-5.1c.3-.8.9-1.4 1.7-1.7 1-.4 2.9-.7 6.6-.7s5.6.3 6.6.7c.8.3 1.4.9 1.7 1.7.4 1 .7 2.7.7 5.1Z"/><path d="m10 8.7 5.1 3.3-5.1 3.3V8.7Z" fill="currentColor" stroke="none"/></svg>';
  return '<svg viewBox="0 0 24 24"><path d="M14.5 4.2c.7 1.7 1.8 2.8 3.7 3.1v3.2c-1.3 0-2.5-.4-3.7-1.2v5.2a5.1 5.1 0 1 1-4.5-5.1v3.1a2.1 2.1 0 1 0 1.5 2V4.2h3Z"/></svg>';
};

const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[character]);

const safeHref = (value) => {
  const href = String(value ?? "");
  if (/^#[\w-]*$/.test(href) || /^halaman\.html\?page=[a-z-]+$/i.test(href) || /^https:\/\/[^\s]+$/i.test(href) ||
      /^tel:\+?[\d\s().-]{3,}$/.test(href) || /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href)) return href;
  return "#";
};

const safeMediaPath = (value) => {
  const path = String(value ?? "");
  if (!(/^\/media\/[a-f0-9]{24}\.(?:png|jpg|webp)$/i.test(path) || path === "/assets/pmi-official-favicon.png")) return "";
  return new URL(path.slice(1), SITE_ROOT).pathname;
};

const linkMarkup = (item, className = "") => {
  const suffix = item.suffix ? `<span aria-hidden="true">${escapeHTML(item.suffix)}</span>` : "";
  const external = item.external === true;
  return `<a${className ? ` class="${escapeHTML(className)}"` : ""} href="${escapeHTML(safeHref(item.href))}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHTML(item.label)}${suffix}</a>`;
};

const setText = (element, value) => {
  if (element) element.textContent = value ?? "";
};

const setHTML = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) element.innerHTML = value;
};

function renderHero(content) {
  const hero = content.hero;
  setHTML('[data-render="hero-copy"]', `
    <p class="eyebrow"><span class="eyebrow-dot"></span>${escapeHTML(hero.eyebrow)}</p>
    <h1 id="hero-title">${escapeHTML(hero.titleFirst)}<br><span>${escapeHTML(hero.titleSecond)}</span></h1>
    <p class="hero-description">${escapeHTML(hero.description)}</p>
    <div class="hero-actions">
      ${linkMarkup(hero.primaryAction, "button button-primary")}
      ${linkMarkup(hero.secondaryAction, "text-link")}
    </div>
    <p class="verified-note">${escapeHTML(hero.note)}</p>
  `);
  const media = content.media || {};
  const heroImage = safeMediaPath(media.heroImage);
  const art = heroImage
    ? `<img class="hero-photo" src="${escapeHTML(heroImage)}" alt="">`
    : `<div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div><div class="art-spark spark-one" aria-hidden="true">✳</div><div class="art-spark spark-two" aria-hidden="true">✳</div><div class="art-drop"><svg viewBox="0 0 180 220" aria-hidden="true"><path d="M90 8C73 37 22 91 22 137a68 68 0 0 0 136 0C158 91 107 37 90 8Z"/><path class="drop-shine" d="M55 133c2-19 15-38 27-51"/></svg><span>${escapeHTML(hero.artLabel).replace(/\n/g, "<br>")}</span></div>`;
  setHTML('[data-render="hero-art"]', `
    <div class="art-image-slot" role="img" aria-label="${escapeHTML(heroImage ? media.heroImageAlt || hero.artDescription : hero.artDescription)}">${art}</div>
    ${hero.artCaptionTitle || hero.artCaptionDescription ? `<div class="art-caption"><span class="caption-icon" aria-hidden="true">♥</span><span><strong>${escapeHTML(hero.artCaptionTitle)}</strong><small>${escapeHTML(hero.artCaptionDescription)}</small></span></div>` : ""}
    ${hero.artIndex || hero.artLocation ? `<div class="art-index">${escapeHTML(hero.artIndex)} <i></i> ${escapeHTML(hero.artLocation)}</div>` : ""}
  `);
  setHTML('[data-render="hero-bottom"]', "");
}

function renderQuickAccess(content) {
  const quickAccess = content.quickAccess;
  if (!quickAccess) return;
  const items = Array.isArray(quickAccess.items) ? quickAccess.items : [];
  setHTML('[data-render="quick-access"]', `
    <div class="quick-access-heading"><div><p class="eyebrow">${escapeHTML(quickAccess.eyebrow)}</p><h2>${escapeHTML(quickAccess.title)}</h2></div>${quickAccess.introduction ? `<p>${escapeHTML(quickAccess.introduction)}</p>` : ""}</div>
    <div class="quick-access-grid">${items.map((item, index) => `
      <a class="quick-access-card" href="${escapeHTML(safeHref(item.href))}"${item.external ? ' target="_blank" rel="noopener noreferrer"' : ""}>
        <span class="quick-access-icon" aria-hidden="true">${siteIcon(item.icon)}</span>
        <span class="quick-access-copy"><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.description)}</span></span>
        <span class="quick-access-arrow" aria-hidden="true">↗</span>
      </a>`).join("")}</div>
  `);
}

function renderNotice(content) {
  const notice = content.notice;
  setHTML('[data-render="notice"]', `<div class="section-wrap notice-inner"><span class="notice-icon" aria-hidden="true">!</span><p><strong>${escapeHTML(notice.title)}</strong> ${escapeHTML(notice.description)}</p>${linkMarkup({ label: notice.linkLabel, href: notice.linkHref, suffix: notice.linkSuffix })}</div>`);
}

function renderProfile(content) {
  const profile = content.profile;
  setHTML('[data-render="profile"]', `
    <div class="section-heading"><div><p class="eyebrow">${escapeHTML(profile.eyebrow)}</p><h2 id="profil-title">${escapeHTML(profile.titleFirst)}<br><span>${escapeHTML(profile.titleSecond)}</span></h2></div><p class="section-intro">${escapeHTML(profile.introduction)}</p></div>
    ${content.media.leadershipImage ? `<figure class="leadership-portrait"><img src="${escapeHTML(safeMediaPath(content.media.leadershipImage))}" alt="${escapeHTML(content.media.leadershipImageAlt)}" loading="lazy" width="88" height="104"><figcaption><span>PIMPINAN UDD PEMBINA</span><strong>${escapeHTML(profile.leadership?.[1]?.name || '')}</strong><p>${escapeHTML(profile.leadership?.[1]?.role || '')}</p></figcaption></figure>` : ''}
    <div class="profile-panel">
      <div class="profile-emblem"><img src="${escapeHTML(safeMediaPath(content.media && content.media.logo) || OFFICIAL_PMI_LOGO)}" alt="${escapeHTML((content.ui && content.ui.profileLogoAlt) || "Lambang Palang Merah Indonesia")}"></div>
      <div class="profile-text"><span class="tag">${escapeHTML(profile.tag)}</span><h3>${escapeHTML(profile.name)}<br>${escapeHTML(profile.location)}</h3><p>${escapeHTML(profile.description)}</p><span class="pending-inline"><span></span> ${escapeHTML(profile.confirmation)}</span></div>
      <div class="profile-side"><span class="side-number">${escapeHTML(profile.sideNumber)}</span><span class="side-rule"></span><span class="side-label">${escapeHTML(profile.sideLabel).replace(/\n/g, "<br>")}</span></div>
    </div>
    ${content.media.profileImage ? `<figure class="profile-showcase"><img src="${escapeHTML(safeMediaPath(content.media.profileImage))}" alt="${escapeHTML(content.media.profileImageAlt || "Ilustrasi suasana layanan UDD")}" loading="lazy"><figcaption>ILUSTRASI SUASANA PELAYANAN</figcaption></figure>` : ""}
    ${profileDetails(profile)}
  `);
}

function profileDetails(profile) {
  const functions = listOf(profile.functions);
  const leadership = listOf(profile.leadership);
  const legalBasis = listOf(profile.legalBasis);
  const cards = [];
  if (functions.length) {
    cards.push(`<section class="info-card profile-detail-card--wide"><h3>${escapeHTML(profile.functionsTitle)}</h3><ul class="check-list">${functions.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul></section>`);
  }
  if (leadership.length) {
    cards.push(`<section class="info-card"><h3>${escapeHTML(profile.leadershipTitle)}</h3><dl class="requirement-list requirement-list--stacked">${leadership.map((item) => `<div><dt>${escapeHTML(item.role)}</dt><dd>${escapeHTML(item.name)}</dd></div>`).join("")}</dl></section>`);
  }
  if (legalBasis.length) {
    cards.push(`<section class="info-card info-card--soft"><h3>${escapeHTML(profile.legalTitle)}</h3><ul class="dot-list">${legalBasis.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul></section>`);
  }
  return cards.length ? `<div class="info-grid info-grid--three profile-detail-grid">${cards.join("")}</div>` : "";
}

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

const stepList = (steps) => `<ol class="step-list">${listOf(steps).map((step, index) => `
  <li><span class="step-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><div><h4>${escapeHTML(step.title)}</h4><p>${escapeHTML(step.description)}</p></div></li>`).join("")}</ol>`;

const requestFlowList = (steps) => `<ol class="request-flow-list">${listOf(steps).map((step, index) => {
  const imagePath = safeMediaPath(step.image);
  return `<li>
    <span class="request-flow-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
    <div class="request-flow-card"><div class="request-flow-copy"><span class="request-flow-label">TAHAP ${String(index + 1).padStart(2, "0")}</span><h4>${escapeHTML(step.title)}</h4><p>${escapeHTML(step.description)}</p></div>${imagePath ? `<img class="request-flow-image" src="${escapeHTML(imagePath)}" alt="${escapeHTML(step.imageAlt || step.title)}" loading="lazy">` : ""}</div>
  </li>`;
}).join("")}</ol>`;

function renderDonor(content) {
  const donor = content.donor;
  const section = document.querySelector('[data-render="donor"]');
  if (!section) return;
  section.hidden = !donor;
  if (!donor) return;
  if (donor.confirmationNote) {
    const actions = listOf(donor.actions);
    section.innerHTML = `
      <div class="section-heading"><div><p class="eyebrow">${escapeHTML(donor.eyebrow)}</p><h2 id="donor-title">${escapeHTML(donor.titleFirst)}<br><span>${escapeHTML(donor.titleSecond)}</span></h2></div>${donor.introduction ? `<p class="section-intro">${escapeHTML(donor.introduction)}</p>` : ""}</div>
      <section class="info-card info-card--soft info-confirmation">
        <h3>${escapeHTML(donor.confirmationTitle)}</h3>
        <p>${escapeHTML(donor.confirmationNote)}</p>
        ${actions.length ? `<div class="section-actions">${actions.map((item, index) => linkMarkup(item, index === 0 ? "button button-primary" : "text-link")).join("")}</div>` : ""}
      </section>
    `;
    return;
  }
  const requirements = listOf(donor.requirements);
  const deferrals = listOf(donor.deferrals);
  const tips = listOf(donor.tips);
  const schedule = listOf(donor.schedule);
  const actions = listOf(donor.actions);
  section.innerHTML = `
    <div class="section-heading"><div><p class="eyebrow">${escapeHTML(donor.eyebrow)}</p><h2 id="donor-title">${escapeHTML(donor.titleFirst)}<br><span>${escapeHTML(donor.titleSecond)}</span></h2></div>${donor.introduction ? `<p class="section-intro">${escapeHTML(donor.introduction)}</p>` : ""}</div>
    <div class="info-grid">
      <section class="info-card donor-prep-card" aria-labelledby="donor-requirements-title">
        <h3 id="donor-requirements-title">${escapeHTML(donor.requirementsTitle)}</h3>
        <dl class="requirement-list">${requirements.map((item) => `<div><dt>${escapeHTML(item.label)}</dt><dd>${escapeHTML(item.value)}</dd></div>`).join("")}</dl>
      </section>
      <section class="info-card info-card--soft donor-eligibility-card" aria-labelledby="donor-deferral-title">
        <h3 id="donor-deferral-title">${escapeHTML(donor.deferralsTitle)}</h3>
        <ul class="dot-list">${deferrals.map((item) => typeof item === "string" ? `<li>${escapeHTML(item)}</li>` : `<li><strong>${escapeHTML(item.label)}</strong><span>${escapeHTML(item.text)}</span></li>`).join("")}</ul>
        ${donor.deferralsNote ? `<p class="info-note">${escapeHTML(donor.deferralsNote)}</p>` : ""}
      </section>
    </div>
    <section class="steps-block" aria-labelledby="donor-steps-title">
      <h3 id="donor-steps-title">${escapeHTML(donor.stepsTitle)}</h3>
      ${stepList(donor.steps)}
    </section>
    <div class="info-grid info-grid--three">
      ${tips.map((tip, index) => `<section class="info-card donor-support-card donor-support-card--${index + 1}"><span class="donor-card-kicker">${index === 0 ? "SESUDAH DONOR" : "CATATAN PENTING"}</span><h3>${escapeHTML(tip.title)}</h3><ul class="check-list">${listOf(tip.items).map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul></section>`).join("")}
      ${schedule.length ? `<section class="info-card info-card--soft donor-service-card"><span class="donor-card-kicker">JAM &amp; LOKASI</span><h3>${escapeHTML(donor.scheduleTitle)}</h3><dl class="requirement-list requirement-list--stacked">${schedule.map((item) => `<div><dd><span><strong>Permintaan darah</strong> 24 jam setiap hari.</span><span><strong>Donor darah</strong> setiap hari pukul 07.30–21.00 WIB.</span><span><strong>Alamat</strong> ${escapeHTML(item.address || "")}</span></dd></div>`).join("")}</dl></section>` : ""}
    </div>
    ${listOf(donor.education).length ? `<section class="donor-education" aria-labelledby="donor-education-title"><h3 id="donor-education-title">${escapeHTML(donor.educationTitle)}</h3><div class="education-grid">${donor.education.map(item=>`<details><summary>${escapeHTML(item.title)}<span aria-hidden="true">+</span></summary><p>${escapeHTML(item.description)}</p></details>`).join('')}</div><p class="education-source">${escapeHTML(donor.educationSource)} <a href="https://jdih.kemkes.go.id/storage/documents/pdfs/2015permenkes091.pdf" target="_blank" rel="noopener noreferrer">Baca peraturan (PDF) ↗</a></p></section>` : ''}
    ${actions.length ? `<div class="section-actions">${actions.map((item, index) => linkMarkup(item, index === 0 ? "button button-primary" : "text-link")).join("")}</div>` : ""}
  `;
}

function renderBloodRequest(content) {
  const request = content.bloodRequest;
  const section = document.querySelector('[data-render="blood-request"]');
  if (!section) return;
  const wrapper = section.closest("section");
  if (wrapper) wrapper.hidden = !request;
  if (!request) return;
  if (request.confirmationNote) {
    const actions = listOf(request.actions);
    section.innerHTML = `
      <div class="section-heading"><div><p class="eyebrow">${escapeHTML(request.eyebrow)}</p><h2 id="permintaan-darah-title">${escapeHTML(request.titleFirst)}<br><span>${escapeHTML(request.titleSecond)}</span></h2></div>${request.introduction ? `<p class="section-intro">${escapeHTML(request.introduction)}</p>` : ""}</div>
      <section class="info-card info-card--soft info-confirmation">
        <h3>${escapeHTML(request.confirmationTitle)}</h3>
        <p>${escapeHTML(request.confirmationNote)}</p>
        ${actions.length ? `<div class="section-actions">${actions.map((item, index) => linkMarkup(item, index === 0 ? "button button-primary" : "text-link")).join("")}</div>` : ""}
      </section>
    `;
    return;
  }
  const components = listOf(request.components);
  const bppdPoints = listOf(request.bppdPoints);
  const urgentActions = listOf(request.urgentActions);
  section.innerHTML = `
    <div class="section-heading"><div><p class="eyebrow">${escapeHTML(request.eyebrow)}</p><h2 id="permintaan-darah-title">${escapeHTML(request.titleFirst)}<br><span>${escapeHTML(request.titleSecond)}</span></h2></div>${request.introduction ? `<p class="section-intro">${escapeHTML(request.introduction)}</p>` : ""}</div>
    <div class="request-layout">
      <section class="steps-block steps-block--card" aria-labelledby="request-steps-title">
        <h3 id="request-steps-title">${escapeHTML(request.stepsTitle)}</h3>
        ${requestFlowList(request.steps)}
      </section>
    </div>
    <div class="request-support" aria-label="Informasi pendukung permintaan darah">
        <section class="info-card info-card--urgent" aria-labelledby="request-urgent-title">
          <div class="urgent-heading"><span class="urgent-pulse" aria-hidden="true"></span><div><h3 id="request-urgent-title">Jika kebutuhan mendesak</h3></div></div>
          <p class="urgent-description">${escapeHTML(request.urgentDescription)}</p>
          <div class="urgent-actions">${urgentActions.map((item, index) => `
            <a class="urgent-action" href="${escapeHTML(safeHref(item.href))}"${item.external === true ? ' target="_blank" rel="noopener noreferrer"' : ""}>
              <span class="urgent-action-icon" aria-hidden="true">${siteIcon(index === 0 ? "call" : "whatsapp")}</span>
              <span class="urgent-action-copy"><strong>${escapeHTML(item.label)}</strong><small>${escapeHTML(item.description || "Hubungi kanal resmi UDD.")}</small></span>
              <span class="urgent-action-arrow" aria-hidden="true">${escapeHTML(item.suffix || "→")}</span>
            </a>`).join("")}</div>
        </section>
        ${components.length ? `<section class="info-card"><h3>${escapeHTML(request.componentsTitle)}</h3><ul class="dot-list">${components.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>${request.componentsNote ? `<p class="info-note">${escapeHTML(request.componentsNote)}</p>` : ""}</section>` : ""}
    </div>
    <section class="info-card info-card--bppd" aria-labelledby="request-bppd-title">
      <p class="bppd-kicker">INFORMASI BIAYA</p>
      <h3 id="request-bppd-title">${escapeHTML(request.bppdTitle)}</h3>
      <p class="bppd-description">${escapeHTML(request.bppdDescription)}</p>
      ${bppdPoints.length ? `<ol class="bppd-list">${bppdPoints.map((item, index) => {
        const point = typeof item === "string" ? { title: `Informasi ${index + 1}`, description: item } : item;
        return `<li><span class="bppd-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHTML(point.title)}</strong><p>${escapeHTML(point.description)}</p></div></li>`;
      }).join("")}</ol>` : ""}
      ${request.bppdReference ? `<p class="bppd-reference">${escapeHTML(request.bppdReference)}</p>` : ""}
    </section>
  `;
}

function renderGallery(content) {
  const gallery = content.gallery;
  if (!gallery) return;
  const items = Array.isArray(gallery.items) ? gallery.items : [];
  setHTML('[data-render="gallery"]', `
    <div class="gallery-heading">
      <div><p class="eyebrow">${escapeHTML(gallery.eyebrow)}</p><h2 id="dokumentasi-title">${escapeHTML(gallery.title)}</h2></div>
      <p>${escapeHTML(gallery.introduction)}</p>
    </div>
    <div class="gallery-grid">${items.map((item, index) => {
      const image = safeMediaPath(item.image);
      const href = safeHref(item.sourceUrl);
      if (!image) return "";
      return `
        <figure class="gallery-card">
          <a class="gallery-image-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(item.sourceLabel || "Lihat unggahan sumber")}: ${escapeHTML(item.title)}">
            <img src="${escapeHTML(image)}" alt="${escapeHTML(item.alt)}" loading="lazy" decoding="async">
            <span class="gallery-image-index">0${index + 1}</span><span class="gallery-image-arrow" aria-hidden="true">↗</span>
          </a>
          <figcaption><span class="gallery-date">${escapeHTML(item.date)}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p>
            <a class="gallery-source" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.sourceLabel || "Lihat unggahan sumber")} <span aria-hidden="true">↗</span></a>
          </figcaption>
        </figure>`;
    }).join("")}</div>
  `);
}

function renderServices(content) {
  const services = content.services;
  const items = Array.isArray(services.items) ? services.items : [];
  setHTML('[data-render="services"]', `
    <div class="section-heading services-heading"><div><p class="eyebrow">${escapeHTML(services.eyebrow)}</p><h2 id="layanan-title">${escapeHTML(services.titleFirst)}<br><span>${escapeHTML(services.titleSecond)}</span></h2></div>${services.introduction ? `<p class="section-intro">${escapeHTML(services.introduction)}</p>` : ""}</div>
    <div class="service-grid">${items.map((item) => `
      <article class="service-card${item.accent ? " card-accent" : ""}">
        <span class="card-number">${escapeHTML(item.number)}</span><span class="card-icon" aria-hidden="true">${siteIcon(item.icon)}</span>
        ${item.image && safeMediaPath(item.image) ? `<img class="service-image" src="${escapeHTML(safeMediaPath(item.image))}" alt="${escapeHTML(item.imageAlt || item.title)}" loading="lazy">` : ""}
        <h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p>
        ${linkMarkup({ label: item.linkLabel, href: item.href, external: item.external, suffix: item.external ? "↗" : "→" }, "service-link")}
      </article>`).join("")}
    </div>
  `);
}

function renderApp(content) {
  const app = content.app;
  const ui = content.ui || {};
  const features = Array.isArray(app.features) ? app.features : [];
  const featureIcons = [
    '<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.2-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.8-7 10-7 10Z"/><path d="M8 12h2l1.2-2.2 1.6 4.4 1.2-2.2H16"/></svg>',
    '<svg viewBox="0 0 24 24"><rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 8h8M8 12h3"/><circle cx="15.5" cy="15.5" r="2.5"/><path d="M15.5 14.2v2.6m-1.3-1.3h2.6"/></svg>',
    '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M7.5 3v4m9-4v4m-13 3.5h17"/><path d="m9.5 15 1.7 1.7 3.7-3.8"/></svg>',
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.7 1.6M9 2h6M12 2v3"/><path d="M18 5l1.5-1.5"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4m-9 4h6m-6 3h3"/><path d="m13 17 1.7 1.7 3.8-3.9"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v16H7.5A3.5 3.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 6h8m-8 4h7"/><path d="m12.5 14 .8 1.4 1.6.3-1.1 1.2.2 1.6-1.5-.7-1.5.7.2-1.6-1.1-1.2 1.6-.3z"/></svg>'
  ];
  const releaseItems = Array.isArray(app.releaseItems) ? app.releaseItems : [];
  const contacts = Array.isArray(app.contacts) ? app.contacts : [];
  const dataCollected = Array.isArray(app.dataCollected) ? app.dataCollected : [];
  const dataSafetyClaims = Array.isArray(app.dataSafetyClaims) ? app.dataSafetyClaims : [];
  const privacyPurposes = Array.isArray(app.privacyPurposes) ? app.privacyPurposes : [];
  const privacyOtherClaims = Array.isArray(app.privacyOtherClaims) ? app.privacyOtherClaims : [];
  const discrepancies = Array.isArray(app.discrepancies) ? app.discrepancies : [];
  const references = Array.isArray(app.references) ? app.references : [];
  const screenshots = Array.isArray(app.screenshots) ? app.screenshots : [];
  const simpleList = (items) => `<ul>${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;
  const screenshotGallery = screenshots.length ? `
    <section class="app-screenshots" aria-labelledby="app-screenshots-title">
      <div class="app-screenshots-heading"><div><p class="eyebrow">${escapeHTML(ui.screenshotsEyebrow)}</p><h3 id="app-screenshots-title">${escapeHTML(app.screenshotsTitle)}</h3></div><span>${screenshots.length} ${escapeHTML(ui.screenshotsCount)}</span></div>
      <p class="app-screenshots-note">${escapeHTML(app.screenshotsNote)}</p>
      <p class="app-screenshots-hint">${escapeHTML(ui.screenshotsHint)} <span aria-hidden="true">→</span></p>
      <div class="app-screenshot-grid" role="region" aria-label="${escapeHTML(ui.screenshotsRegionLabel)}" tabindex="0">${screenshots.map((item) => {
        const imagePath = safeMediaPath(item.src);
        return imagePath ? `<figure class="app-screenshot-card"><div class="app-screenshot-image"><div class="app-phone" aria-hidden="true"><span class="app-phone-earpiece"></span><img src="${escapeHTML(imagePath)}" alt="" loading="lazy" decoding="async"></div><span class="sr-only">${escapeHTML(item.alt)}</span></div><figcaption><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.description)}</span></figcaption></figure>` : "";
      }).join("")}</div>
    </section>` : "";

  setHTML('[data-render="app"]', `
    <div class="app-heading">
      <div><p class="eyebrow">${escapeHTML(app.eyebrow)}</p><h2 id="saidonor-title">${escapeHTML(app.titleFirst)}<br><span>${escapeHTML(app.titleSecond)}</span></h2></div>
      <div class="app-heading-action">${linkMarkup({ label: app.playStoreLabel, href: app.playStoreUrl, external: true }, "button button-primary")}</div>
    </div>
    <div class="app-lead">
      <div><p class="app-developer">${escapeHTML(app.developer)}</p><p>${escapeHTML(app.introduction)}</p></div>
      ${app.integration ? `<p class="app-integration">${escapeHTML(app.integration)}</p>` : ""}
    </div>
    <p class="app-snapshot"><span>${escapeHTML(app.snapshotLabel)}</span> ${escapeHTML(app.snapshot)}</p>
    ${screenshotGallery}
    <h3 class="app-subheading">${escapeHTML(app.featuresLabel)}</h3>
    <div class="app-feature-grid">${features.map((feature, index) => `
      <article class="app-feature-card"><div class="app-feature-top"><span class="app-feature-icon app-feature-icon--${index + 1}" aria-hidden="true">${featureIcons[index] || featureIcons[featureIcons.length - 1]}</span><span class="app-feature-number">${String(index + 1).padStart(2, "0")}</span></div><h4>${escapeHTML(feature.title)}</h4><p>${escapeHTML(feature.description)}</p></article>
    `).join("")}</div>
    <div class="app-detail-grid">
      <section class="app-detail-card"><p class="eyebrow">${escapeHTML(app.releaseLabel)}</p><h3>${escapeHTML(app.releaseVersion)}</h3>${simpleList(releaseItems)}</section>
      <section class="app-detail-card"><p class="eyebrow">${escapeHTML(app.contactLabel)}</p><dl>${contacts.map((item) => `<div><dt>${escapeHTML(item.label)}</dt><dd>${item.href ? linkMarkup({ label: item.value, href: item.href, external: item.href.startsWith("https://") }) : escapeHTML(item.value)}</dd></div>`).join("")}</dl></section>
    </div>
    <details class="app-privacy">
      <summary><span><span class="eyebrow">${escapeHTML(app.privacyLabel)}</span><strong>${escapeHTML(app.privacyIntro)}</strong></span><span class="faq-plus" aria-hidden="true"></span></summary>
      <div class="app-privacy-content">
        ${dataSafetyClaims.length ? `<h3>${escapeHTML(ui.privacyDataSafetyHeading || "Pengungkapan Keamanan Data di Google Play")}</h3>${simpleList(dataSafetyClaims)}` : ""}
        ${dataCollected.length ? `<h3>${escapeHTML(ui.privacyDataCollectedHeading || "Data yang dicantumkan")}</h3><div class="app-data-grid">${dataCollected.map((item) => `<article><h4>${escapeHTML(item.category)}</h4><p>${escapeHTML(item.details)}</p></article>`).join("")}</div>` : ""}
        ${privacyPurposes.length ? `<h3>${escapeHTML(ui.privacyPurposesHeading || "Tujuan penggunaan data")}</h3>${simpleList(privacyPurposes)}` : ""}
        ${privacyOtherClaims.length ? `<h3>${escapeHTML(ui.privacyProtectionHeading || "Perlindungan data")}</h3>${simpleList(privacyOtherClaims)}` : ""}
        ${discrepancies.length ? `<h3>${escapeHTML(app.discrepancyLabel)}</h3><ul class="app-discrepancies">${discrepancies.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>` : ""}
        <div class="app-policy-links">${linkMarkup({ label: app.privacyPolicyLabel, href: app.privacyPolicyUrl, external: true }, "text-link")}${linkMarkup({ label: app.dataSafetyLabel, href: app.dataSafetyUrl, external: true }, "text-link")}</div>
      </div>
    </details>
    ${app.sourceNote ? `<p class="app-source-note">${escapeHTML(app.sourceNote)}</p>` : ""}
    ${references.length ? `<div class="source-links" aria-label="${escapeHTML(ui.sourceLinksLabel || "Tautan SaiDonor")}"><span>${escapeHTML(ui.sourceLinksLabel || "TAUTAN SAIDONOR")}</span>${references.map((item) => linkMarkup({ ...item, external: true })).join("")}</div>` : ""}
  `);
}

function renderUpdates(content) {
  const updates = content.updates;
  const entries = Array.isArray(updates.entries) ? updates.entries : [];
  const updatesContent = entries.length
    ? `<div class="news-grid">${entries.map((entry) => `
        <article class="news-card">
          <div class="news-meta"><span class="news-category">${escapeHTML(entry.category)}</span><time${entry.datetime ? ` datetime="${escapeHTML(entry.datetime)}"` : ""}>${escapeHTML(entry.date)}</time>${entry.source ? `<span class="news-source">Sumber: ${escapeHTML(entry.source)}</span>` : ""}</div>
          <h3>${escapeHTML(entry.title)}</h3>
          <p>${escapeHTML(entry.summary)}</p>
          ${entry.href ? linkMarkup({ label: entry.linkLabel || "Informasi selengkapnya", href: entry.href, external: entry.external, suffix: entry.external ? "↗" : "" }, "text-link") : ""}
        </article>`).join("")}</div>`
    : `<div class="empty-update"><div class="empty-symbol" aria-hidden="true">${escapeHTML(updates.emptyIcon)}</div><div><h3>${escapeHTML(updates.emptyTitle)}</h3><p>${escapeHTML(updates.emptyDescription)}</p></div></div>`;
  const references = (Array.isArray(updates.references) ? updates.references : []).map((item) => `<a class="social-channel" href="${escapeHTML(safeHref(item.href))}" target="_blank" rel="noopener noreferrer"><span class="social-channel-icon" aria-hidden="true">${socialGlyph(item.label)}</span><span>${escapeHTML(item.label)}</span><i aria-hidden="true">↗</i></a>`).join("");
  setHTML('[data-render="updates"]', `
    <div class="updates-top"><div><p class="eyebrow">${escapeHTML(updates.eyebrow)}</p><h2 id="informasi-title">${escapeHTML(updates.titleFirst)}<br><span>${escapeHTML(updates.titleSecond)}</span></h2></div></div>
    ${updatesContent}
    ${updates.footnote ? `<p class="update-footnote">${escapeHTML(updates.footnote)}</p>` : ""}
    <div class="source-links" aria-label="${escapeHTML(updates.referencesLabel)}"><span>${escapeHTML(updates.referencesLabel)}</span><div class="social-channel-list">${references}</div></div>
  `);
}

function renderFAQ(content) {
  const faq = content.faq;
  const items = Array.isArray(faq.items) ? faq.items : [];
  setHTML('[data-render="faq"]', `
    <div class="faq-intro"><p class="eyebrow">${escapeHTML(faq.eyebrow)}</p><h2 id="faq-title">${escapeHTML(faq.titleFirst)}<br><span>${escapeHTML(faq.titleSecond)}</span></h2><p>${escapeHTML(faq.introduction)}</p>${linkMarkup({ label: faq.contactLabel, href: faq.contactHref, suffix: "→" }, "text-link")}</div>
    <div class="faq-list">${items.map((item) => `<details><summary><span>${escapeHTML(item.question)}</span><span class="faq-plus" aria-hidden="true"></span></summary><p>${escapeHTML(item.answer)}</p></details>`).join("")}</div>
  `);
}

function renderContact(content) {
  const contact = content.contact;
  const ui = content.ui || {};
  const items = Array.isArray(contact.items) ? contact.items : [];
  const social = contact.social || {};
  const socialChannels = Array.isArray(social.channels) ? social.channels : [];
  const socialContent = Array.isArray(social.contentItems) ? social.contentItems : [];
  const channelIcon = (href) => {
    const address = String(href || "");
    if (address.includes("instagram.com")) return "instagram";
    if (address.includes("tiktok.com")) return "tiktok";
    if (address.includes("facebook.com")) return "facebook";
    if (address.includes("youtube.com")) return "youtube";
    if (address.includes("wa.me")) return "whatsapp";
    if (address.includes("linktr.ee")) return "linktree";
    if (address.includes("google.com/maps")) return "maps";
    return "link";
  };
  const channelGlyphs = {
    instagram: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle class="glyph-fill" cx="17.7" cy="6.5" r="1"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24"><path d="M14 3v11.2a4.2 4.2 0 1 1-3.5-4.1"/><path d="M14 3c.5 3.2 2.4 5 5.5 5.4"/></svg>',
    facebook: '<svg viewBox="0 0 24 24"><path class="glyph-fill" d="M13.7 21v-8h2.8l.4-3.1h-3.2v-2c0-.9.3-1.5 1.6-1.5H17V3.6c-.7-.1-1.6-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.5v2H7v3.1h3V21z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24"><path d="M21 8.1a2.7 2.7 0 0 0-1.9-1.9C17.4 5.7 12 5.7 12 5.7s-5.4 0-7.1.5A2.7 2.7 0 0 0 3 8.1a28 28 0 0 0-.5 3.9 28 28 0 0 0 .5 3.9 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.1.5 7.1.5s5.4 0 7.1-.5a2.7 2.7 0 0 0 1.9-1.9 28 28 0 0 0 .5-3.9 28 28 0 0 0-.5-3.9Z"/><path class="glyph-fill" d="m10 15.2 5.2-3.2L10 8.8z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24"><path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L4 20l1.1-4a8.2 8.2 0 1 1 15.1-4.3Z"/><path d="M9 8.3c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.2.2-.2.4 0 .6a7.2 7.2 0 0 0 2.3 2c.3.2.5.1.7-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.2.4.4 0 .3-.1 1.1-.7 1.6-.5.5-1.2.6-1.6.6s-1.7-.3-3.3-1.3c-2-1.3-3.2-3.3-3.3-3.5-.1-.2-.8-1-.8-2 0-.9.5-1.4.7-1.7Z"/></svg>',
    linktree: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.2"/><circle cx="6" cy="11" r="2.2"/><circle cx="18" cy="11" r="2.2"/><circle cx="12" cy="17" r="2.2"/><path d="m10.4 6.6-2.8 2.8m6-2.8 2.8 2.8m-8.8 3.2 2.8 2.8m6-2.8-2.8 2.8M12 19.2V22"/></svg>',
    maps: '<svg viewBox="0 0 24 24"><path d="M19 10.2c0 5-7 11-7 11s-7-6-7-11a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10 13.5 8.3 15a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0m2.7 3.5 1.7-1.5a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0M8.5 12h7"/></svg>'
  };
  const contentGlyphs = {
    education: '<svg viewBox="0 0 24 24"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v16H7.5A3.5 3.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 6h8m-8 4h7"/><path d="m13 15 .8 1.4 1.6.3-1.1 1.2.2 1.6-1.5-.7-1.5.7.2-1.6-1.1-1.2 1.6-.3z"/></svg>',
    requirements: '<svg viewBox="0 0 24 24"><path d="M8 4.5h8M9 3h6a1 1 0 0 1 1 1v2H8V4a1 1 0 0 1 1-1ZM6 5.5H4v16h16v-16h-2"/><path d="m8 12 1.5 1.5L12 11m1 1h3m-8 5 1.5 1.5L12 17m1 1h3"/></svg>',
    facts: '<svg viewBox="0 0 24 24"><circle cx="9" cy="12" r="6.5"/><circle cx="15" cy="12" r="6.5"/><path d="M7.5 12h3m-1.5-1.5v3m4.5-.5h3"/></svg>',
    app: '<svg viewBox="0 0 24 24"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M9 6h6m-6 3h6"/><circle cx="12" cy="17.5" r=".7" class="content-icon-fill"/></svg>',
    stock: '<svg viewBox="0 0 24 24"><path d="M12 2.5s-6.5 7.2-6.5 12a6.5 6.5 0 0 0 13 0c0-4.8-6.5-12-6.5-12Z"/><path d="M9 15.5a3 3 0 0 0 3 3"/></svg>',
    profile: '<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V8l7-4 7 4v13"/><path d="M9 21v-6h6v6M8 10h.1m3.9 0h.1m3.9 0h.1"/></svg>',
    facility: '<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V6l7-3 7 3v15M8 9h.1m3.9 0h.1m3.9 0h.1M8 13h.1m3.9 0h.1m3.9 0h.1"/><path d="M10 21v-4h4v4"/></svg>',
    activity: '<svg viewBox="0 0 24 24"><path d="M20.5 8.8c0 5.6-8.5 11-8.5 11s-8.5-5.4-8.5-11A4.5 4.5 0 0 1 12 6.3a4.5 4.5 0 0 1 8.5 2.5Z"/><path d="M8 12h2l1.2-2 1.6 4 1.2-2H16"/></svg>',
    award: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="6.5"/><path d="m8 14-1 8 5-2.5 5 2.5-1-8"/><path d="m12 5.5 1.1 2.2 2.4.4-1.8 1.7.4 2.4-2.1-1.1-2.1 1.1.4-2.4-1.8-1.7 2.4-.4z"/></svg>',
    delivery: '<svg viewBox="0 0 24 24"><path d="M2.5 5h12v12h-12zM14.5 9h4l3 3v5h-7"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M5 8h6m-6 3h4"/></svg>'
  };
  const contactGlyphs = {
    call: '<svg viewBox="0 0 24 24"><path d="M6.6 3.5h3l1.5 4-2 1.8a15 15 0 0 0 5.6 5.6l1.8-2 4 1.5v3a2 2 0 0 1-2.2 2A16.7 16.7 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/></svg>',
    address: '<svg viewBox="0 0 24 24"><path d="M19 10.2c0 5-7 11-7 11s-7-6-7-11a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24"><path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L4 20l1.1-4a8.2 8.2 0 1 1 15.1-4.3Z"/><path d="M9 8.3c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.2.2-.2.4 0 .6a7.2 7.2 0 0 0 2.3 2c.3.2.5.1.7-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.2.4.4 0 .3-.1 1.1-.7 1.6-.5.5-1.2.6-1.6.6s-1.7-.3-3.3-1.3c-2-1.3-3.2-3.3-3.3-3.5-.1-.2-.8-1-.8-2 0-.9.5-1.4.7-1.7Z"/></svg>',
    hours: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.7 1.6M9 2h6M12 2v3"/></svg>'
  };
  const contactIcon = (label) => {
    const text = String(label || "").toLowerCase();
    if (text.includes("whatsapp")) return "whatsapp";
    if (text.includes("alamat")) return "address";
    if (text.includes("jam")) return "hours";
    return "call";
  };
  const contentIcon = (item) => {
    const text = `${item.title || ""} ${item.category || ""}`.toLowerCase();
    if (text.includes("stok") || text.includes("persediaan")) return "stock";
    if (text.includes("syarat") || text.includes("ketentuan")) return "requirements";
    if (text.includes("mitos") || text.includes("fakta")) return "facts";
    if (text.includes("aplikasi") || text.includes("donorku")) return "app";
    if (text.includes("company profile")) return "profile";
    if (text.includes("pojok baca") || text.includes("caffe donor")) return "facility";
    if (text.includes("pengiriman bantuan")) return "delivery";
    if (text.includes("apresiasi") || text.includes("pengundian") || text.includes("award")) return "award";
    if (text.includes("siger donor") || text.includes("kegiatan")) return "activity";
    return "education";
  };
  setHTML("#kontak", `
    <div class="contact-card">
      <div class="contact-copy"><p class="eyebrow">${escapeHTML(contact.eyebrow)}</p><h2 id="kontak-title">${escapeHTML(contact.titleFirst)}<br><span>${escapeHTML(contact.titleSecond)}</span></h2><p>${escapeHTML(contact.introduction)}</p></div>
      <div class="contact-details">${items.map((item) => {
        const icon = contactIcon(item.label);
        return `<div class="contact-item contact-item--${icon}">
          <span class="contact-item-icon" aria-hidden="true">${contactGlyphs[icon]}</span>
          <div class="contact-item-copy"><span class="contact-item-label">${escapeHTML(item.label)}</span>
          <strong>${item.href ? `<a href="${escapeHTML(safeHref(item.href))}"${String(item.href).startsWith("https://") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHTML(item.value)}</a>` : escapeHTML(item.value)}</strong></div>
        </div>`;
      }).join("")}<p class="contact-footnote"><span class="contact-footnote-text">${escapeHTML(contact.footnote)}</span></p></div>
    </div>
    ${contact.locationImage && safeMediaPath(contact.locationImage) ? `<figure class="location-showcase"><img src="${escapeHTML(safeMediaPath(contact.locationImage))}" alt="${escapeHTML(contact.locationImageAlt || "Ilustrasi area layanan UDD")}" loading="lazy"><figcaption><span>ILUSTRASI AREA LAYANAN</span><p>${escapeHTML(contact.locationImageNote || "")}</p></figcaption></figure>` : ""}
    <section class="social-directory" aria-label="${escapeHTML(social.title)}">
      <div class="social-directory-heading"><div><p class="eyebrow">${escapeHTML(social.eyebrow)}</p><h3>${escapeHTML(social.title)}</h3><p>${escapeHTML(social.description)}</p></div><span class="social-directory-count">${socialChannels.length} ${escapeHTML(ui.socialChannelsCount || "TAUTAN")}</span></div>
      <div class="contact-social-links">${socialChannels.map((item) => {
        const icon = channelIcon(item.href);
        const description = String(item.description || "");
        const related = description.toLowerCase().includes("bukan akun khusus udd") ||
          description.toLowerCase().includes("bukan kanal khusus udd");
        return `<a class="channel-card channel-card--${icon}${related ? " channel-card--related" : ""}" href="${escapeHTML(safeHref(item.href))}" target="_blank" rel="noopener noreferrer">
          <span class="channel-icon" aria-hidden="true">${channelGlyphs[icon]}</span>
          <span class="channel-copy"><span class="channel-label">${escapeHTML(item.label)}${related ? ` <i>${escapeHTML(ui.relatedAccountLabel || "Akun terkait")}</i>` : ""}</span>
          <strong>${escapeHTML(item.value)} <span aria-hidden="true">↗</span></strong><small>${escapeHTML(description)}</small></span>
        </a>`;
      }).join("")}</div>
      <details class="social-content-details">
        <summary><span>${escapeHTML(social.contentLabel)}</span><span>${socialContent.length} ${escapeHTML(ui.socialContentCount || "pilihan")} <i class="faq-plus" aria-hidden="true"></i></span></summary>
        <div class="contact-social-content">${socialContent.map((item) => {
          const icon = contentIcon(item);
          return `<article class="social-content-card social-content-card--${icon}">
            <div class="social-content-art" aria-hidden="true"><span>${contentGlyphs[icon]}</span><i></i></div>
            <span class="social-content-meta">${escapeHTML(item.platform)} · ${escapeHTML(item.category)}</span>
            <h4>${escapeHTML(item.title)}</h4><p>${escapeHTML(item.description)}</p>
            <a href="${escapeHTML(safeHref(item.href))}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.linkLabel)} <span aria-hidden="true">↗</span></a>
          </article>`;
        }).join("")}</div>
      </details>
      ${social.profileSummary || social.checkedAt ? `<p class="contact-social-note">${escapeHTML(social.profileSummary)} ${escapeHTML(social.checkedAt)}</p>` : ""}
    </section>
  `);
}

function renderFooter(content) {
  const footer = content.footer;
  const ui = content.ui || {};
  const footerDescription = footer.descriptionFirst || footer.descriptionSecond
    ? `<strong>${escapeHTML(footer.descriptionFirst || "")}</strong>${footer.descriptionSecond ? `<span>${escapeHTML(footer.descriptionSecond)}</span>` : ""}`
    : "";
  setHTML('[data-render="footer"]', `
    <div class="section-wrap footer-main">
      ${footerDescription ? `<p>${footerDescription}</p>` : ""}
      <nav class="footer-navigation" aria-label="${escapeHTML(ui.footerNavLabel || "Jelajahi situs")}">
        <div class="footer-nav-group">
          <span>${escapeHTML(ui.footerServicesLabel || "Layanan")}</span>
          <a href="#donor">Informasi donor</a>
          <a href="#permintaan-darah">Permintaan darah</a>
          <a href="#saidonor">Aplikasi SaiDonor</a>
        </div>
        <div class="footer-nav-group">
          <span>${escapeHTML(ui.footerInfoLabel || "Informasi")}</span>
          <a href="#profil">Profil UDD</a>
          <a href="#informasi">Kabar &amp; kegiatan</a>
          <a href="#faq">Pertanyaan umum</a>
          <a href="#kontak">Lokasi &amp; kontak</a>
          <a href="halaman.html?page=privasi">Kebijakan privasi</a>
          <a href="halaman.html?page=peta-situs">Peta situs</a>
        </div>
      </nav>
      <a class="back-top" href="#beranda">${escapeHTML(footer.backToTop)} <span aria-hidden="true">↑</span></a>
    </div>
    <div class="section-wrap footer-bottom"><span class="footer-copyright">${escapeHTML(footer.copyrightPrefix)}${new Date().getFullYear()}${escapeHTML(footer.copyrightSuffix)}</span>${footer.note ? `<span class="footer-note">${escapeHTML(footer.note)}</span>` : ""}</div>
  `);
}

function renderStructuredData(content) {
  const existing = document.getElementById("dynamic-structured-data");
  if (existing) existing.remove();
  const questions = content.faq && Array.isArray(content.faq.items) ? content.faq.items : [];
  if (!questions.length) return;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": { "@type": "Answer", "text": item.answer }
    }))
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "dynamic-structured-data";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

function renderBrandMark(content) {
  const mark = document.querySelector("#header-brand-mark");
  if (!mark) return;
  const logoPath = content.media && safeMediaPath(content.media.logo);
  mark.innerHTML = logoPath
    ? `<img class="brand-photo" src="${escapeHTML(logoPath)}" alt="">`
    : `<img class="brand-photo" src="${OFFICIAL_PMI_LOGO}" alt="">`;
}

function initializeNavigation(content) {
  const nav = document.querySelector("#site-nav");
  const toggle = document.querySelector(".menu-toggle");
  const links = Array.isArray(content.navigation) ? content.navigation : [];
  if (!nav || !toggle) return;
  nav.innerHTML = links.map((item) => linkMarkup(item, item.cta ? "nav-cta" : "")).join("");

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", activeSiteContent.ui.menuOpen);
    const hiddenLabel = toggle.querySelector(".sr-only");
    if (hiddenLabel) hiddenLabel.textContent = activeSiteContent.ui.menuOpen;
    nav.classList.remove("is-open");
  };

  toggle.setAttribute("aria-label", content.ui.menuOpen);
  if (toggle.dataset.bound === "true") return;
  toggle.dataset.bound = "true";
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? activeSiteContent.ui.menuOpen : activeSiteContent.ui.menuClose);
    const hiddenLabel = toggle.querySelector(".sr-only");
    if (hiddenLabel) hiddenLabel.textContent = isOpen ? activeSiteContent.ui.menuOpen : activeSiteContent.ui.menuClose;
    nav.classList.toggle("is-open", !isOpen);
  });
  nav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (toggle.getAttribute("aria-expanded") !== "true") return;
    closeMenu();
    toggle.focus();
  });
  window.addEventListener("resize", () => {
    if (toggle.getAttribute("aria-expanded") === "true" && window.matchMedia("(min-width: 621px)").matches) closeMenu();
  });
}

function initializeMotion() {
  if (motionObserver) motionObserver.disconnect();
  revealAnimations.forEach(animation => animation.cancel());
  revealAnimations.clear();
  document.body.classList.remove("motion-ready");
  if (motionPreference.matches || !("IntersectionObserver" in window) || !Element.prototype.animate) return;

  const elements = document.querySelectorAll(
    ".section-heading, .guide-heading, .service-finder, .quick-access-card, .profile-panel, .leadership-portrait, .gallery-card, .service-card, .info-card, .steps-block, .donor-section .step-list li, .donor-prep-card .requirement-list > div, .donor-eligibility-card .dot-list li, .guide-panels, .visit-card, .donor-education, .app-lead, .app-feature-card, .news-card, .faq-list details, .contact-card"
  );
  if (!elements.length) return;

  motionObserver = new IntersectionObserver((entries, observer) => {
    let stagger = 0;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (motionPreference.matches || entry.target.getBoundingClientRect().bottom < 0) return;
      const animation = entry.target.animate([
        { opacity: .25, transform: 'translateY(22px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 640, delay: (stagger++ % 3) * 65, easing: 'cubic-bezier(.2,.75,.25,1)' });
      revealAnimations.add(animation);
      animation.onfinish = animation.oncancel = () => revealAnimations.delete(animation);
    });
  }, { rootMargin: "0px 0px -24px 0px", threshold: 0 });
  elements.forEach(element => motionObserver.observe(element));
}
motionPreference.addEventListener('change', initializeMotion);

function renderMobileActions(content) {
  const contact = content.contact || {};
  const items = Array.isArray(contact.items) ? contact.items : [];
  const findItem = (needle) => items.find((item) => String(item.label || "").toLowerCase().includes(needle));
  const phone = findItem("telepon udd") || findItem("call center");
  const whatsapp = findItem("whatsapp");
  const location = content.quickAccess && Array.isArray(content.quickAccess.items)
    ? content.quickAccess.items.find((item) => String(item.title || "").toLowerCase().includes("lokasi"))
    : null;
  const actions = [
    phone && { label: "Telepon", href: phone.href, icon: siteGlyphs.call },
    whatsapp && { label: "WhatsApp", href: whatsapp.href, icon: siteGlyphs.whatsapp },
    location && { label: "Lokasi", href: location.href, icon: siteGlyphs.location }
  ].filter(Boolean);
  setHTML('[data-render="mobile-actions"]', actions.length ? `
    <nav class="mobile-action-inner" aria-label="Aksi cepat">
      ${actions.map((action, index) => `<a class="mobile-action mobile-action--${index === 1 ? "accent" : "default"}" href="${escapeHTML(safeHref(action.href))}">
        <span class="mobile-action-icon" aria-hidden="true">${action.icon}</span><span>${escapeHTML(action.label)}</span>
      </a>`).join("")}
    </nav>` : "");
}

function renderVisitorGuide(content) {
  document.querySelector('.visitor-guide')?.remove();
  const guide = document.createElement('section');
  guide.className = 'visitor-guide section-wrap';
  guide.id = 'panduan';
  guide.setAttribute('aria-labelledby', 'guide-title');
  const journeys = [
    {label:'Donor pertama', title:'Langkah pertama Anda berarti.', intro:'Kenali prosesnya, persiapkan diri, lalu datang dengan lebih tenang.', steps:[['Persiapkan diri', 'Baca persiapan donor dan siapkan identitas diri.'], ['Sampaikan kondisi kesehatan', 'Isi kuesioner dengan jujur. Petugas akan menilai kelayakan donor.'], ['Ikuti arahan petugas', 'Pahami penjelasan sebelum memberikan persetujuan donor.']], href:'#donor', action:'Pelajari panduan donor'},
    {label:'Donor kembali', title:'Lanjutkan kebiasaan baik Anda.', intro:'Rencanakan kunjungan berikutnya dengan informasi yang Anda butuhkan.', steps:[['Lihat catatan donor', 'Periksa riwayat dan pengingat pada aplikasi SaiDonor.'], ['Konfirmasikan waktu', 'Tanyakan waktu donor berikutnya kepada petugas sesuai kondisi Anda.'], ['Siapkan kartu dan identitas', 'Sampaikan perubahan kesehatan atau obat sejak donor terakhir.']], href:'#saidonor', action:'Kenali aplikasi SaiDonor'},
    {label:'Keluarga pasien', title:'Informasi jelas saat dibutuhkan.', intro:'Mulai dari fasilitas kesehatan yang merawat pasien untuk mengatur kebutuhan transfusi.', steps:[['Hubungi tim yang merawat', 'Kebutuhan transfusi dan jenis komponen ditetapkan dokter.'], ['Koordinasikan permintaan', 'Fasilitas kesehatan menyiapkan permintaan dan sampel sesuai prosedur.'], ['Konfirmasikan proses', 'Tanyakan ketersediaan, pemeriksaan, dan perkiraan waktu kepada petugas.']], href:'#permintaan-darah', action:'Lihat alur permintaan darah'}
  ];
  const location = (content.quickAccess?.items || []).find(item => item.icon === 'location');
  const schedule = content.donor?.schedule || [];
  guide.innerHTML = `<div class="guide-heading"><p class="eyebrow">SETIAP KEBAIKAN PUNYA LANGKAH PERTAMA</p><h2 id="guide-title">Panduan untuk <span>Anda.</span></h2></div><div class="guide-tabs" role="tablist" aria-label="Pilih kebutuhan Anda">${journeys.map((item,i)=>`<button type="button" role="tab" id="guide-tab-${i}" aria-controls="guide-panel-${i}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${escapeHTML(item.label)}</button>`).join('')}</div><div class="guide-layout"><div class="guide-panels">${journeys.map((item,i)=>`<div role="tabpanel" id="guide-panel-${i}" aria-labelledby="guide-tab-${i}" tabindex="0" ${i?'hidden':''}><span class="guide-index" aria-hidden="true">0${i+1} / PANDUAN</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.intro)}</p><ol class="guide-steps">${item.steps.map(([title,description])=>`<li><strong>${escapeHTML(title)}</strong><p>${escapeHTML(description)}</p></li>`).join('')}</ol>${linkMarkup({label:item.action,href:item.href,suffix:'→'},'button button-primary')}</div>`).join('')}</div><aside class="visit-card"><span class="visit-icon" aria-hidden="true">${siteIcon('location')}</span><p class="eyebrow">LOKASI & JAM LAYANAN</p><h3>Kunjungi UDD Pembina<br><span>di Bandar Lampung.</span></h3>${schedule.map(item=>`<div class="visit-schedule"><div class="visit-detail"><strong>Jam layanan</strong><p>Permintaan darah: 24 jam setiap hari.<br>Donor darah: setiap hari pukul 07.30–21.00 WIB.</p></div><div class="visit-detail"><strong>Alamat layanan</strong><p>${escapeHTML(item.address || '')}</p></div></div>`).join('')}${location?linkMarkup({label:'Buka petunjuk arah',href:location.href,external:true,suffix:'↗'},'button button-light'):''}<a class="visit-contact" href="#kontak">Lihat kontak UDD →</a></aside></div>`;
  const tabs = Array.from(guide.querySelectorAll('[role="tab"]'));
  const select = index => {
    tabs.forEach((tab,i) => { tab.setAttribute('aria-selected', String(i===index)); tab.tabIndex = i===index?0:-1; guide.querySelector(`#guide-panel-${i}`).hidden = i!==index; });
  };
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>select(index));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight') next=(index+1)%tabs.length;
      if(event.key==='ArrowLeft') next=(index+tabs.length-1)%tabs.length;
      if(event.key==='Home') next=0;
      if(event.key==='End') next=tabs.length-1;
      if(next===undefined) return;
      event.preventDefault(); select(next); tabs[next].focus();
    });
  });
  document.querySelector('.notice-band').after(guide);
}

function refineExperience() {
  document.querySelector('.service-finder')?.remove();
  const finder = document.createElement('section');
  finder.className = 'service-finder';
  finder.setAttribute('aria-labelledby', 'finder-title');
  finder.innerHTML = `<div class="finder-copy"><p class="eyebrow">PUSAT INFORMASI UDD</p><h2 id="finder-title">Temukan informasi<br>layanan darah.</h2><p>Cari panduan donor, informasi permintaan darah, serta lokasi dan kontak UDD Pembina PMI Provinsi Lampung.</p></div><div class="finder-search"><label for="service-search">Cari informasi layanan</label><div class="finder-field"><input id="service-search" type="search" placeholder="Contoh: syarat donor, BPPD, lokasi" autocomplete="off" aria-controls="finder-results"><span aria-hidden="true">⌕</span></div><p class="finder-status" role="status" aria-live="polite"></p><ul id="finder-results"></ul><div class="finder-suggestions"><a href="#donor">Panduan donor darah ↗</a><a href="#permintaan-darah">Permintaan darah pasien ↗</a><a href="#kontak">Lokasi dan kontak UDD ↗</a></div></div>`;
  const searchItems = [
    {title:'Persiapan dan kelayakan donor',text:'syarat usia berat badan hemoglobin obat kesehatan pertama kali',href:'#donor'},
    {title:'Permintaan darah dan BPPD',text:'pasien biaya harga transfusi crossmatch stok komponen rumah sakit',href:'#permintaan-darah'},
    {title:'Lokasi, waktu layanan, dan kontak',text:'alamat jam buka jadwal telepon whatsapp hubungi',href:'#kontak'},
    {title:'Aplikasi SaiDonor',text:'aplikasi stok kartu donor android unduh',href:'#saidonor'},
    ...activeSiteContent.faq.items.map((item,index) => ({title:item.question,text:item.answer,href:`#faq-answer-${index}`}))
  ];
  finder.querySelector('input').addEventListener('input', event => {
    const query = event.target.value.trim().toLocaleLowerCase('id');
    const matches = query ? searchItems.filter(item => query.split(/\s+/).every(term => `${item.title} ${item.text}`.toLocaleLowerCase('id').includes(term))).slice(0,5) : [];
    finder.querySelector('.finder-status').textContent = query ? (matches.length ? `${matches.length} informasi ditemukan` : 'Belum ditemukan. Coba kata lain atau hubungi UDD.') : '';
    finder.querySelector('ul').innerHTML = matches.map(item => `<li><a href="${escapeHTML(item.href)}">${escapeHTML(item.title)}<span aria-hidden="true">→</span></a></li>`).join('');
  });
  document.querySelectorAll('.faq-list details').forEach((item,index) => { item.id=`faq-answer-${index}`; });
  if (/^#faq-answer-\d+$/.test(window.location.hash)) {
    const linkedAnswer = document.getElementById(window.location.hash.slice(1));
    if (linkedAnswer) linkedAnswer.open = true;
  }
  finder.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#faq-answer-"]');
    if (!link) return;
    const answer = document.getElementById(link.hash.slice(1));
    if (answer) { answer.open = true; answer.querySelector('summary').focus({preventScroll:true}); }
  });
  document.querySelectorAll('.editorial-details').forEach(wrapper => {
    Array.from(wrapper.children).filter(node => node.tagName !== 'SUMMARY').forEach(node => wrapper.before(node));
    wrapper.remove();
  });
  const main = document.querySelector('main');
  ['beranda', 'donor', 'permintaan-darah', 'informasi', 'dokumentasi', 'saidonor', 'profil', 'faq', 'kontak'].forEach((id) => {
    const section = document.getElementById(id);
    if (section) main.append(section);
  });
  const hero = document.getElementById('beranda');
  hero.after(document.querySelector('.quick-access'));
  document.querySelector('.quick-access').prepend(finder);
  document.querySelector('.quick-access').after(document.querySelector('.notice-band'));
  document.querySelector('.notice-band').after(document.getElementById('layanan'));
  const fold = (selector, title) => {
    const nodes = Array.from(document.querySelectorAll(selector));
    if (!nodes.length) return;
    const details = document.createElement('details');
    details.className = 'editorial-details';
    const summary = document.createElement('summary');
    summary.textContent = title;
    details.append(summary);
    nodes[0].before(details);
    nodes.forEach(node => details.append(node));
  };
  fold('.app-detail-grid', 'Versi dan dukungan aplikasi');
  fold('.social-directory', 'Jelajahi seluruh kanal resmi UDD');
  fold('.profile-detail-grid', 'Lingkup layanan, pimpinan, dan dasar penyelenggaraan');
  document.querySelectorAll('.eyebrow').forEach(node => {
    node.textContent = node.textContent.replace(/^\d{2}\s*\/\s*/, '');
  });
}

function renderSite(content) {
  activeSiteContent = content;
  document.documentElement.lang = content.language || "id";
  document.querySelectorAll("[data-content]").forEach((element) => {
    const value = String(element.getAttribute("data-content")).split(".").reduce((current, key) => current && current[key], content);
    setText(element, value);
  });
  document.querySelectorAll("[data-content-aria]").forEach((element) => {
    const value = String(element.getAttribute("data-content-aria")).split(".").reduce((current, key) => current && current[key], content);
    if (value) element.setAttribute("aria-label", value);
  });
  document.title = content.meta.title;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = content.meta.description;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = content.meta.themeColor;

  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogTitle) ogTitle.content = content.meta.ogTitle || content.meta.title;
  if (ogDescription) ogDescription.content = content.meta.ogDescription || content.meta.description;
  if (ogImage) {
    const imagePath = safeMediaPath(content.meta.ogImage || (content.media && content.media.heroImage));
    ogImage.content = imagePath ? new URL(imagePath, window.location.origin).href : "";
  }

  initializeNavigation(content);
  renderHero(content);
  renderQuickAccess(content);
  renderNotice(content);
  renderProfile(content);
  renderGallery(content);
  renderServices(content);
  renderDonor(content);
  renderBloodRequest(content);
  renderApp(content);
  renderUpdates(content);
  renderFAQ(content);
  renderContact(content);
  renderMobileActions(content);
  renderFooter(content);
  renderBrandMark(content);
  renderStructuredData(content);
  refineExperience();
  renderVisitorGuide(content);
  initializeMotion();
  const anchorTarget = document.getElementById(window.location.hash.slice(1));
  if (anchorTarget) window.requestAnimationFrame(() => anchorTarget.scrollIntoView({ block: 'start' }));
}

const localServer = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
const contentUrl = localServer ? "/api/content" : new URL("content.json?v=20261024-1107", SITE_ROOT).href;

fetch(contentUrl, { headers: { Accept: "application/json" } })
  .then((response) => {
    if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
    return response.json();
  })
  .then((content) => {
    renderSite(content);
    window.addEventListener("message", (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === "udd-preview-content" && event.data.content) {
        renderSite(event.data.content);
      }
    });
    if (window.parent !== window) window.parent.postMessage({ type: "udd-preview-ready" }, window.location.origin);
  })
  .catch((error) => {
    console.error(error);
    const message = document.createElement("p");
    message.setAttribute("role", "alert");
    message.textContent = "Konten situs belum dapat dimuat. Pastikan server situs aktif atau content.json tersedia.";
    document.querySelector("main").replaceChildren(message);
  });
