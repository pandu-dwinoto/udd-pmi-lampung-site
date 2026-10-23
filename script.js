"use strict";

let activeSiteContent;
let motionObserver;
let motionTimeout;
const SITE_ROOT = new URL("./", window.location.href);
const OFFICIAL_PMI_LOGO = new URL("assets/pmi-official-favicon.png", SITE_ROOT).pathname;
const siteGlyphs = {
  donor: '<svg viewBox="0 0 24 24"><path d="M12 2C9.2 6.1 5.5 10.1 5.5 14a6.5 6.5 0 0 0 13 0C18.5 10.1 14.8 6.1 12 2Z"/><path d="M9 15a3.2 3.2 0 0 0 3 2"/></svg>',
  request: '<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M8.5 10h7m-7 4h7m-7 4h4"/></svg>',
  location: '<svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 0 1-11.7 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z"/><path d="M9 8.5c.4 2.6 2 4.2 4.6 4.8l1-1.2 2 .9c-.2 1.5-1.2 2.2-2.7 2-3.6-.7-6-3-6.6-6.3-.2-1.4.6-2.3 2-2.5l1 2Z"/></svg>',
  app: '<svg viewBox="0 0 24 24"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10 5h4m-3 13h2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M7.5 3v4m9-4v4m-13 3.5h17m-12 4 2 2 4-4"/></svg>'
};
const siteIcon = (name) => Object.prototype.hasOwnProperty.call(siteGlyphs, name)
  ? siteGlyphs[name]
  : siteGlyphs.donor;

const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[character]);

const safeHref = (value) => {
  const href = String(value ?? "");
  if (/^#[\w-]*$/.test(href) || /^https:\/\/[^\s]+$/i.test(href) ||
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
    <p class="verified-note"><span aria-hidden="true">ⓘ</span> ${escapeHTML(hero.note)}</p>
  `);
  const media = content.media || {};
  const heroImage = safeMediaPath(media.heroImage);
  const art = heroImage
    ? `<img class="hero-photo" src="${escapeHTML(heroImage)}" alt="">`
    : `<div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div><div class="art-spark spark-one" aria-hidden="true">✳</div><div class="art-spark spark-two" aria-hidden="true">✳</div><div class="art-drop"><svg viewBox="0 0 180 220" aria-hidden="true"><path d="M90 8C73 37 22 91 22 137a68 68 0 0 0 136 0C158 91 107 37 90 8Z"/><path class="drop-shine" d="M55 133c2-19 15-38 27-51"/></svg><span>${escapeHTML(hero.artLabel).replace(/\n/g, "<br>")}</span></div>`;
  setHTML('[data-render="hero-art"]', `
    <div class="art-image-slot" role="img" aria-label="${escapeHTML(heroImage ? media.heroImageAlt || hero.artDescription : hero.artDescription)}">${art}</div>
    <div class="art-caption"><span class="caption-icon" aria-hidden="true">♥</span><span><strong>${escapeHTML(hero.artCaptionTitle)}</strong><small>${escapeHTML(hero.artCaptionDescription)}</small></span></div>
    ${hero.artIndex || hero.artLocation ? `<div class="art-index">${escapeHTML(hero.artIndex)} <i></i> ${escapeHTML(hero.artLocation)}</div>` : ""}
  `);
  setHTML('[data-render="hero-bottom"]', `<span>${escapeHTML(hero.footerLabel)}</span><span class="bottom-line"></span><span>${escapeHTML(hero.footerTopics)}</span>`);
}

function renderQuickAccess(content) {
  const quickAccess = content.quickAccess;
  if (!quickAccess) return;
  const items = Array.isArray(quickAccess.items) ? quickAccess.items : [];
  setHTML('[data-render="quick-access"]', `
    <div class="quick-access-heading"><div><p class="eyebrow">${escapeHTML(quickAccess.eyebrow)}</p><h2>${escapeHTML(quickAccess.title)}</h2></div><p>${escapeHTML(quickAccess.introduction)}</p></div>
    <div class="quick-access-grid">${items.map((item, index) => `
      <a class="quick-access-card" href="${escapeHTML(safeHref(item.href))}"${item.external ? ' target="_blank" rel="noopener noreferrer"' : ""}>
        <span class="quick-access-number">0${index + 1}</span><span class="quick-access-icon" aria-hidden="true">${siteIcon(item.icon)}</span>
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
    <div class="profile-panel">
      <div class="profile-emblem"><img src="${escapeHTML(safeMediaPath(content.media && content.media.logo) || OFFICIAL_PMI_LOGO)}" alt="Lambang Palang Merah Indonesia"></div>
      <div class="profile-text"><span class="tag">${escapeHTML(profile.tag)}</span><h3>${escapeHTML(profile.name)}<br>${escapeHTML(profile.location)}</h3><p>${escapeHTML(profile.description)}</p><span class="pending-inline"><span></span> ${escapeHTML(profile.confirmation)}</span></div>
      <div class="profile-side"><span class="side-number">${escapeHTML(profile.sideNumber)}</span><span class="side-rule"></span><span class="side-label">${escapeHTML(profile.sideLabel).replace(/\n/g, "<br>")}</span></div>
    </div>
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

function renderDonor(content) {
  const donor = content.donor;
  const section = document.querySelector('[data-render="donor"]');
  if (!section) return;
  section.hidden = !donor;
  if (!donor) return;
  if (donor.confirmationNote) {
    const actions = listOf(donor.actions);
    section.innerHTML = `
      <div class="section-heading"><div><p class="eyebrow">${escapeHTML(donor.eyebrow)}</p><h2 id="donor-title">${escapeHTML(donor.titleFirst)}<br><span>${escapeHTML(donor.titleSecond)}</span></h2></div><p class="section-intro">${escapeHTML(donor.introduction)}</p></div>
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
    <div class="section-heading"><div><p class="eyebrow">${escapeHTML(donor.eyebrow)}</p><h2 id="donor-title">${escapeHTML(donor.titleFirst)}<br><span>${escapeHTML(donor.titleSecond)}</span></h2></div><p class="section-intro">${escapeHTML(donor.introduction)}</p></div>
    <div class="info-grid">
      <section class="info-card" aria-labelledby="donor-requirements-title">
        <h3 id="donor-requirements-title">${escapeHTML(donor.requirementsTitle)}</h3>
        <dl class="requirement-list">${requirements.map((item) => `<div><dt>${escapeHTML(item.label)}</dt><dd>${escapeHTML(item.value)}</dd></div>`).join("")}</dl>
      </section>
      <section class="info-card info-card--soft" aria-labelledby="donor-deferral-title">
        <h3 id="donor-deferral-title">${escapeHTML(donor.deferralsTitle)}</h3>
        <ul class="dot-list">${deferrals.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        ${donor.deferralsNote ? `<p class="info-note">${escapeHTML(donor.deferralsNote)}</p>` : ""}
      </section>
    </div>
    <section class="steps-block" aria-labelledby="donor-steps-title">
      <h3 id="donor-steps-title">${escapeHTML(donor.stepsTitle)}</h3>
      ${stepList(donor.steps)}
    </section>
    <div class="info-grid info-grid--three">
      ${tips.map((tip) => `<section class="info-card"><h3>${escapeHTML(tip.title)}</h3><ul class="check-list">${listOf(tip.items).map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul></section>`).join("")}
      ${schedule.length ? `<section class="info-card info-card--soft"><h3>${escapeHTML(donor.scheduleTitle)}</h3><dl class="requirement-list requirement-list--stacked">${schedule.map((item) => `<div><dt>${escapeHTML(item.place)}</dt><dd>${escapeHTML(item.detail)}</dd></div>`).join("")}</dl></section>` : ""}
    </div>
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
      <div class="section-heading"><div><p class="eyebrow">${escapeHTML(request.eyebrow)}</p><h2 id="permintaan-darah-title">${escapeHTML(request.titleFirst)}<br><span>${escapeHTML(request.titleSecond)}</span></h2></div><p class="section-intro">${escapeHTML(request.introduction)}</p></div>
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
    <div class="section-heading"><div><p class="eyebrow">${escapeHTML(request.eyebrow)}</p><h2 id="permintaan-darah-title">${escapeHTML(request.titleFirst)}<br><span>${escapeHTML(request.titleSecond)}</span></h2></div><p class="section-intro">${escapeHTML(request.introduction)}</p></div>
    <div class="request-layout">
      <section class="steps-block steps-block--card" aria-labelledby="request-steps-title">
        <h3 id="request-steps-title">${escapeHTML(request.stepsTitle)}</h3>
        ${stepList(request.steps)}
      </section>
      <div class="request-side">
        <section class="info-card info-card--urgent" aria-labelledby="request-urgent-title">
          <h3 id="request-urgent-title">${escapeHTML(request.urgentTitle)}</h3>
          <p>${escapeHTML(request.urgentDescription)}</p>
          <div class="urgent-actions">${urgentActions.map((item, index) => linkMarkup(item, index === 0 ? "button button-light" : "urgent-link")).join("")}</div>
        </section>
        ${components.length ? `<section class="info-card"><h3>${escapeHTML(request.componentsTitle)}</h3><ul class="dot-list">${components.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>${request.componentsNote ? `<p class="info-note">${escapeHTML(request.componentsNote)}</p>` : ""}</section>` : ""}
      </div>
    </div>
    <section class="info-card info-card--bppd" aria-labelledby="request-bppd-title">
      <h3 id="request-bppd-title">${escapeHTML(request.bppdTitle)}</h3>
      <p>${escapeHTML(request.bppdDescription)}</p>
      ${bppdPoints.length ? `<ul class="check-list">${bppdPoints.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>` : ""}
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
    <div class="section-heading services-heading"><div><p class="eyebrow">${escapeHTML(services.eyebrow)}</p><h2 id="layanan-title">${escapeHTML(services.titleFirst)}<br><span>${escapeHTML(services.titleSecond)}</span></h2></div><p class="section-intro">${escapeHTML(services.introduction)}</p></div>
    <div class="service-grid">${items.map((item) => `
      <article class="service-card${item.accent ? " card-accent" : ""}">
        <span class="card-number">${escapeHTML(item.number)}</span><span class="card-icon" aria-hidden="true">${siteIcon(item.icon)}</span>
        <h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p>
        ${linkMarkup({ label: item.linkLabel, href: item.href, external: item.external }, "")}
      </article>`).join("")}
    </div>
  `);
}

function renderApp(content) {
  const app = content.app;
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
      <div class="app-screenshots-heading"><div><p class="eyebrow">TAMPILAN APLIKASI</p><h3 id="app-screenshots-title">${escapeHTML(app.screenshotsTitle)}</h3></div><span>${screenshots.length} layar</span></div>
      <p class="app-screenshots-note">${escapeHTML(app.screenshotsNote)}</p>
      <p class="app-screenshots-hint">Geser untuk melihat semua tampilan <span aria-hidden="true">→</span></p>
      <div class="app-screenshot-grid" role="region" aria-label="Cuplikan layar aplikasi SaiDonor" tabindex="0">${screenshots.map((item) => {
        const imagePath = safeMediaPath(item.src);
        return imagePath ? `<figure class="app-screenshot-card"><div class="app-screenshot-image"><div class="app-phone" aria-hidden="true"><span class="app-phone-earpiece"></span><img src="${escapeHTML(imagePath)}" alt=""></div><span class="sr-only">${escapeHTML(item.alt)}</span></div><figcaption><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.description)}</span></figcaption></figure>` : "";
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
        ${dataSafetyClaims.length ? `<h3>Pengungkapan Keamanan Data di Google Play</h3>${simpleList(dataSafetyClaims)}` : ""}
        ${dataCollected.length ? `<h3>Data yang dicantumkan</h3><div class="app-data-grid">${dataCollected.map((item) => `<article><h4>${escapeHTML(item.category)}</h4><p>${escapeHTML(item.details)}</p></article>`).join("")}</div>` : ""}
        ${privacyPurposes.length ? `<h3>Tujuan penggunaan data</h3>${simpleList(privacyPurposes)}` : ""}
        ${privacyOtherClaims.length ? `<h3>Perlindungan data</h3>${simpleList(privacyOtherClaims)}` : ""}
        ${discrepancies.length ? `<h3>${escapeHTML(app.discrepancyLabel)}</h3><ul class="app-discrepancies">${discrepancies.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>` : ""}
        <div class="app-policy-links">${linkMarkup({ label: app.privacyPolicyLabel, href: app.privacyPolicyUrl, external: true }, "text-link")}${linkMarkup({ label: app.dataSafetyLabel, href: app.dataSafetyUrl, external: true }, "text-link")}</div>
      </div>
    </details>
    ${app.sourceNote ? `<p class="app-source-note">${escapeHTML(app.sourceNote)}</p>` : ""}
    ${references.length ? `<div class="source-links" aria-label="Referensi SaiDonor"><span>TAUTAN SAIDONOR</span>${references.map((item) => linkMarkup({ ...item, external: true })).join("")}</div>` : ""}
  `);
}

function renderUpdates(content) {
  const updates = content.updates;
  const entries = Array.isArray(updates.entries) ? updates.entries : [];
  const updatesContent = entries.length
    ? `<div class="news-grid">${entries.map((entry) => `
        <article class="news-card">
          <span class="news-category">${escapeHTML(entry.category)}</span>
          <time>${escapeHTML(entry.date)}</time>
          <h3>${escapeHTML(entry.title)}</h3>
          <p>${escapeHTML(entry.summary)}</p>
          ${entry.href ? linkMarkup({ label: entry.linkLabel || "Informasi selengkapnya", href: entry.href, external: entry.external }, "text-link") : ""}
        </article>`).join("")}</div>`
    : `<div class="empty-update"><div class="empty-symbol" aria-hidden="true">${escapeHTML(updates.emptyIcon)}</div><div><h3>${escapeHTML(updates.emptyTitle)}</h3><p>${escapeHTML(updates.emptyDescription)}</p></div></div>`;
  const references = (Array.isArray(updates.references) ? updates.references : []).map((item) => linkMarkup({ ...item, external: true })).join("");
  setHTML('[data-render="updates"]', `
    <div class="updates-top"><div><p class="eyebrow">${escapeHTML(updates.eyebrow)}</p><h2 id="informasi-title">${escapeHTML(updates.titleFirst)}<br><span>${escapeHTML(updates.titleSecond)}</span></h2></div><span class="updates-label"><span></span> ${escapeHTML(updates.status)}</span></div>
    ${updatesContent}
    <p class="update-footnote">${escapeHTML(updates.footnote)}</p>
    <div class="source-links" aria-label="${escapeHTML(updates.referencesLabel)}"><span>${escapeHTML(updates.referencesLabel)}</span>${references}</div>
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
          <strong>${item.href ? `<a href="${escapeHTML(safeHref(item.href))}">${escapeHTML(item.value)}</a>` : escapeHTML(item.value)}</strong></div>
        </div>`;
      }).join("")}<p class="contact-footnote"><span aria-hidden="true">i</span>${escapeHTML(contact.footnote)}</p></div>
    </div>
    <section class="social-directory" aria-label="${escapeHTML(social.title)}">
      <div class="social-directory-heading"><div><p class="eyebrow">${escapeHTML(social.eyebrow)}</p><h3>${escapeHTML(social.title)}</h3><p>${escapeHTML(social.description)}</p></div><span class="social-directory-count">${socialChannels.length} TAUTAN</span></div>
      <div class="contact-social-links">${socialChannels.map((item) => {
        const icon = channelIcon(item.href);
        const description = String(item.description || "");
        const related = description.toLowerCase().includes("bukan akun khusus udd") ||
          description.toLowerCase().includes("bukan kanal khusus udd");
        return `<a class="channel-card channel-card--${icon}${related ? " channel-card--related" : ""}" href="${escapeHTML(safeHref(item.href))}" target="_blank" rel="noopener noreferrer">
          <span class="channel-icon" aria-hidden="true">${channelGlyphs[icon]}</span>
          <span class="channel-copy"><span class="channel-label">${escapeHTML(item.label)}${related ? ' <i>Akun terkait</i>' : ""}</span>
          <strong>${escapeHTML(item.value)} <span aria-hidden="true">↗</span></strong><small>${escapeHTML(description)}</small></span>
        </a>`;
      }).join("")}</div>
      <details class="social-content-details">
        <summary><span>${escapeHTML(social.contentLabel)}</span><span>${socialContent.length} pilihan <i class="faq-plus" aria-hidden="true"></i></span></summary>
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
  const footerDescription = [footer.descriptionFirst, footer.descriptionSecond]
    .filter(Boolean)
    .map(escapeHTML)
    .join("<br>");
  setHTML('[data-render="footer"]', `
    <div class="section-wrap footer-main">
      ${footerDescription ? `<p>${footerDescription}</p>` : ""}
      <nav class="footer-navigation" aria-label="Jelajahi situs">
        <div class="footer-nav-group">
          <span>Layanan</span>
          <a href="#donor">Informasi donor</a>
          <a href="#permintaan-darah">Permintaan darah</a>
          <a href="#saidonor">Aplikasi SaiDonor</a>
        </div>
        <div class="footer-nav-group">
          <span>Informasi</span>
          <a href="#profil">Profil UDD</a>
          <a href="#informasi">Kabar &amp; kegiatan</a>
          <a href="#faq">Pertanyaan umum</a>
          <a href="#kontak">Lokasi &amp; kontak</a>
        </div>
      </nav>
      <a class="back-top" href="#beranda">${escapeHTML(footer.backToTop)} <span aria-hidden="true">↑</span></a>
    </div>
    <div class="section-wrap footer-bottom"><span>${escapeHTML(footer.copyrightPrefix)}${new Date().getFullYear()}${escapeHTML(footer.copyrightSuffix)}</span>${footer.note ? `<span>${escapeHTML(footer.note)}</span>` : ""}</div>
  `);
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
    if (event.key === "Escape") {
      closeMenu();
      toggle.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 621px)").matches) closeMenu();
  });
}

function initializeMotion() {
  if (motionObserver) motionObserver.disconnect();
  window.clearTimeout(motionTimeout);
  document.body.classList.remove("motion-ready");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  const elements = document.querySelectorAll(
    ".quick-access-card, .profile-panel, .gallery-card, .service-card, .info-card, .steps-block, .app-lead, .app-feature-card, .app-detail-card, .news-card, .empty-update, .faq-list details, .contact-card, .social-directory"
  );
  if (!elements.length) return;

  motionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.removeAttribute("data-reveal-pending");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  elements.forEach((element, index) => {
    element.setAttribute("data-reveal-item", "");
    element.setAttribute("data-reveal-pending", "");
    element.style.setProperty("--reveal-delay", `${(index % 3) * 55}ms`);
    motionObserver.observe(element);
  });
  document.body.classList.add("motion-ready");
  motionTimeout = window.setTimeout(() => {
    document.querySelectorAll("[data-reveal-pending]").forEach((element) => {
      element.removeAttribute("data-reveal-pending");
    });
    if (motionObserver) motionObserver.disconnect();
  }, 1600);
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
  renderFooter(content);
  renderBrandMark(content);
  initializeMotion();
}

const localServer = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
const contentUrl = localServer ? "/api/content" : new URL("content.json?v=20261023-2254", SITE_ROOT).href;

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
