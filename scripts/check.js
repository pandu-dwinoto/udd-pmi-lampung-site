"use strict";

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function syntaxCheck(relativePath) {
  try {
    execFileSync(process.execPath, ["--check", path.join(ROOT, relativePath)], { stdio: "pipe" });
  } catch (error) {
    fail(`${relativePath}: ${String(error.stderr || error.message).trim()}`);
  }
}

const scripts = [
  "server.js",
  "script.js",
  "admin.js",
  "setup-admin.js",
  ...fs.readdirSync(path.join(ROOT, "scripts"))
    .filter((name) => name.endsWith(".js"))
    .map((name) => path.join("scripts", name))
];
scripts.forEach(syntaxCheck);

let content;
try {
  content = JSON.parse(read("content.json"));
} catch (error) {
  fail(`content.json tidak valid: ${error.message}`);
}

const indexHtml = read("index.html");
const scriptJs = read("script.js");

const versionPatterns = [
  ["index.html styles.css", indexHtml.match(/styles\.css\?v=([^"]+)/)],
  ["index.html script.js", indexHtml.match(/script\.js\?v=([^"]+)/)],
  ["script.js content.json", scriptJs.match(/content\.json\?v=([^"]+)/)]
];
const versions = versionPatterns.map(([label, match]) => {
  if (!match) {
    fail(`${label}: token versi ?v= tidak ditemukan.`);
    return "";
  }
  return match[1];
});
if (new Set(versions.filter(Boolean)).size > 1) {
  fail(`Token versi tidak seragam: ${versions.join(", ")}. Jalankan "npm run bump".`);
}

if (content) {
  for (const key of ["meta", "media", "brand", "navigation", "hero", "quickAccess", "notice", "profile", "gallery", "services", "donor", "bloodRequest", "app", "updates", "faq", "contact", "footer", "ui"]) {
    if (!content[key]) fail(`content.json: bagian "${key}" hilang.`);
  }
  if (!Array.isArray(content.faq?.items) || content.faq.items.length < 6) {
    fail("content.json: FAQ minimal 6 pertanyaan.");
  }
  if (content.donor?.confirmationNote) fail("content.json: bagian donor masih memakai mode placeholder.");
  if (content.bloodRequest?.confirmationNote) fail("content.json: bagian permintaan darah masih memakai mode placeholder.");
  if (!Array.isArray(content.donor?.requirements) || !content.donor.requirements.length) fail("content.json: persiapan donor kosong.");
  if (!Array.isArray(content.bloodRequest?.steps) || !content.bloodRequest.steps.length) fail("content.json: alur permintaan darah kosong.");
  if (!Array.isArray(content.profile?.functions) || !content.profile.functions.length) fail("content.json: lingkup layanan profil kosong.");
  if (!Array.isArray(content.profile?.leadership) || !content.profile.leadership.length) fail("content.json: data pimpinan kosong.");

  const linkPattern = /^(#[\w-]*|halaman\.html\?page=[a-z-]+|https:\/\/[^\s]+|tel:\+?[\d\s().-]{3,}|mailto:[^\s@]+@[^\s@]+\.[^\s@]+)$/i;
  const mediaPattern = /^\/media\/[a-f0-9]{24}\.(?:png|jpg|webp)$/i;
  const assetPattern = /^\/assets\/[a-z0-9._-]+$/i;
  const placeholders = ["Perlu konfirmasi", "belum dikonfirmasi", "TODO", "Lorem ipsum"];

  const visit = (value, key = "") => {
    if (typeof value === "string") {
      if (placeholders.some((placeholder) => value.includes(placeholder))) {
        fail(`content.json: teks placeholder pada "${key}": ${value.slice(0, 60)}`);
      }
      if (key === "href" && value !== "" && !linkPattern.test(value)) {
        fail(`content.json: tautan tidak valid (${key}): ${value}`);
      }
      if (mediaPattern.test(value) && !fs.existsSync(path.join(ROOT, value.slice(1)))) {
        fail(`content.json: berkas media tidak ada: ${value}`);
      }
      if (assetPattern.test(value) && !fs.existsSync(path.join(ROOT, value.slice(1)))) {
        fail(`content.json: berkas aset tidak ada: ${value}`);
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, key));
      return;
    }
    if (value && typeof value === "object") {
      Object.entries(value).forEach(([childKey, childValue]) => visit(childValue, childKey));
    }
  };
  visit(content);

  if (!mediaPattern.test(content.meta?.ogImage || "")) {
    fail("content.json: ogImage harus memakai berkas /media/ dari CMS.");
  }
}

if (failures.length) {
  console.error("Pemeriksaan gagal:");
  failures.forEach((message) => console.error(` - ${message}`));
  process.exit(1);
}

console.log("Pemeriksaan berhasil: sintaks JS, content.json, tautan, media, dan token versi valid.");
