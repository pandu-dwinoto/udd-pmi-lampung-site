"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const now = new Date();
const pad = (value) => String(value).padStart(2, "0");
const token = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;

function update(relativePath, replacements) {
  const filePath = path.join(ROOT, relativePath);
  const original = fs.readFileSync(filePath, "utf8");
  let next = original;
  for (const [pattern, replacement] of replacements) {
    next = next.replace(pattern, replacement);
  }
  if (next === original) {
    console.log(`${relativePath}: token sudah versi terbaru.`);
    return;
  }
  fs.writeFileSync(filePath, next, "utf8");
  console.log(`${relativePath}: diperbarui.`);
}

update("index.html", [
  [/(styles\.css\?v=)[^"]+/g, `$1${token}`],
  [/(script\.js\?v=)[^"]+/g, `$1${token}`]
]);

update("script.js", [
  [/(content\.json\?v=)[^"]+/g, `$1${token}`]
]);

const sitemapPath = path.join(ROOT, "sitemap.xml");
const sitemap = fs.readFileSync(sitemapPath, "utf8");
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
fs.writeFileSync(sitemapPath, sitemap.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${today}</lastmod>`), "utf8");

console.log(`Token versi: ${token}`);
console.log(`Sitemap lastmod: ${today}`);
