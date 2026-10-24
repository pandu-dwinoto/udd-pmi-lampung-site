"use strict";

const http = require("node:http");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const zlib = require("node:zlib");
const { promisify } = require("node:util");

const scrypt = promisify(crypto.scrypt);
const ROOT = __dirname;
const CONTENT_FILE = path.join(ROOT, "content.json");
const BACKUP_DIR = path.join(ROOT, "backups");
const BACKUP_LIMIT = 20;
const PRIVATE_DIR = path.join(ROOT, "private");
const CREDENTIALS_FILE = path.join(PRIVATE_DIR, "admin-credentials.json");
const MEDIA_DIR = path.join(ROOT, "media");
const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 4173);
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const MAX_CONTENT_BYTES = 1024 * 1024;
const sessions = new Map();
const loginAttempts = new Map();

if (!Number.isInteger(PORT) || PORT < 1024 || PORT > 65535) {
  console.error("PORT harus berupa angka antara 1024 dan 65535.");
  process.exit(1);
}

const STATIC_FILES = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/script.js", ["script.js", "text/javascript; charset=utf-8"]],
  ["/halaman.html", ["halaman.html", "text/html; charset=utf-8"]],
  ["/halaman.css", ["halaman.css", "text/css; charset=utf-8"]],
  ["/halaman.js", ["halaman.js", "text/javascript; charset=utf-8"]],
  ["/admin.css", ["admin.css", "text/css; charset=utf-8"]],
  ["/admin.js", ["admin.js", "text/javascript; charset=utf-8"]],
  ["/admin/setup", ["admin-setup.html", "text/html; charset=utf-8"]],
  ["/admin/setup.html", ["admin-setup.html", "text/html; charset=utf-8"]],
  ["/admin/login", ["admin-login.html", "text/html; charset=utf-8"]],
  ["/admin/login.html", ["admin-login.html", "text/html; charset=utf-8"]],
  ["/robots.txt", ["robots.txt", "text/plain; charset=utf-8"]],
  ["/sitemap.xml", ["sitemap.xml", "application/xml; charset=utf-8"]],
  ["/assets/pmi-official-favicon.png", [path.join("assets", "pmi-official-favicon.png"), "image/png"]],
  ["/assets/favicon-32.png", [path.join("assets", "favicon-32.png"), "image/png"]],
  ["/assets/icon-192.png", [path.join("assets", "icon-192.png"), "image/png"]],
  ["/assets/apple-touch-icon.png", [path.join("assets", "apple-touch-icon.png"), "image/png"]],
  ["/favicon.ico", [path.join("assets", "favicon-32.png"), "image/png"]]
]);

function securityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'");
}

function isCompressible(contentType) {
  return /^text\//i.test(contentType) || /^application\/(?:json|xml|javascript|ld\+json)/i.test(contentType);
}

function clientAcceptsGzip(res) {
  const encoding = String((res.req && res.req.headers["accept-encoding"]) || "");
  return /\bgzip\b/i.test(encoding);
}

function send(res, status, body, contentType = "text/plain; charset=utf-8", extraHeaders = {}, cacheControl = "no-store") {
  securityHeaders(res);
  let payload = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
  const headers = { "Content-Type": contentType, "Cache-Control": cacheControl, ...extraHeaders };
  const ifNoneMatch = res.req && res.req.headers["if-none-match"];
  if (headers.ETag && ifNoneMatch === headers.ETag) {
    res.writeHead(304, headers);
    res.end();
    return;
  }
  if (payload.length > 1024 && isCompressible(contentType) && clientAcceptsGzip(res)) {
    payload = zlib.gzipSync(payload, { level: 6 });
    headers["Content-Encoding"] = "gzip";
    headers.Vary = headers.Vary ? `${headers.Vary}, Accept-Encoding` : "Accept-Encoding";
  }
  headers["Content-Length"] = payload.length;
  res.writeHead(status, headers);
  res.end(payload);
}

function sendJson(res, status, payload, extraHeaders = {}, cacheControl = "no-store") {
  send(res, status, JSON.stringify(payload), "application/json; charset=utf-8", extraHeaders, cacheControl);
}

function contentVersion(json) {
  return crypto.createHash("sha256").update(json).digest("hex").slice(0, 16);
}

function credentialStamp() {
  try {
    return fsSync.statSync(CREDENTIALS_FILE).mtimeMs;
  } catch {
    return 0;
  }
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requestCookie(req, name) {
  const cookies = String(req.headers.cookie || "").split(";");
  for (const cookie of cookies) {
    const separator = cookie.indexOf("=");
    if (separator < 0) continue;
    if (cookie.slice(0, separator).trim() === name) return decodeURIComponent(cookie.slice(separator + 1).trim());
  }
  return "";
}

function getSession(req) {
  const token = requestCookie(req, "udd_admin");
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now() || session.credentialStamp !== credentialStamp()) {
    sessions.delete(token);
    return null;
  }
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  return { token, ...session };
}

function sessionCookie(token) {
  return `udd_admin=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`;
}

function clearSessionCookie() {
  return "udd_admin=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0";
}

function originIsLocal(req) {
  const origin = req.headers.origin;
  if (typeof origin !== "string") return false;
  try {
    const parsed = new URL(origin);
    return parsed.protocol === "http:" &&
      ["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname) &&
      parsed.port === String(PORT);
  } catch {
    return false;
  }
}

async function readJsonBody(req, maxBytes = MAX_CONTENT_BYTES) {
  let total = 0;
  const chunks = [];
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      const error = new Error("Ukuran permintaan terlalu besar.");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Format JSON tidak valid.");
    error.status = 400;
    throw error;
  }
}

function validateHref(value) {
  if (typeof value !== "string" || value.length > 2048) return false;
  if (value === "") return true;
  return /^#[\w-]*$/.test(value) ||
    /^halaman\.html\?page=[a-z-]+$/i.test(value) ||
    /^https:\/\/[^\s]+$/i.test(value) ||
    /^tel:\+?[\d\s().-]{3,}$/.test(value) ||
    /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateContent(content) {
  if (!content || typeof content !== "object" || Array.isArray(content)) return "Konten harus berupa objek JSON.";
  if (Buffer.byteLength(JSON.stringify(content), "utf8") > MAX_CONTENT_BYTES) return "Konten melebihi batas 1 MB.";
  if (!content.meta || typeof content.meta.title !== "string" || typeof content.meta.description !== "string") {
    return "Judul dan deskripsi SEO wajib tersedia.";
  }
  if (!Array.isArray(content.navigation) || !content.hero || !content.services ||
      !content.updates || !content.faq || !content.contact || !content.footer) {
    return "Struktur konten situs wajib lengkap.";
  }
  if (!/^#[0-9a-f]{6}$/i.test(content.meta.themeColor || "")) return "Warna tema harus berupa kode hex, misalnya #f8f5ef.";
  let reason = "";
  const visit = (value, key = "", depth = 0) => {
    if (reason) return;
    if (depth > 10) {
      reason = "Struktur konten terlalu dalam.";
      return;
    }
    if (typeof value === "string") {
      if (value.length > 20000) reason = "Salah satu teks melebihi batas 20.000 karakter.";
      if (key === "href" && !validateHref(value)) reason = "Salah satu tautan tidak diizinkan. Gunakan URL HTTPS, tautan bagian (#...), telepon (tel:), atau email (mailto:).";
      if (["logo", "heroImage", "ogImage", "image"].includes(key) && value !== "" &&
          !/^\/media\/[a-f0-9]{24}\.(?:png|jpg|webp)$/i.test(value) &&
          !(key === "logo" && value === "/assets/pmi-official-favicon.png")) {
        reason = "Gambar harus diunggah melalui editor media CMS.";
      }
      return;
    }
    if (Array.isArray(value)) {
      if (value.length > 100) {
        reason = "Daftar tidak boleh memiliki lebih dari 100 item.";
        return;
      }
      value.forEach((item) => visit(item, "", depth + 1));
      return;
    }
    if (value && typeof value === "object") {
      Object.entries(value).forEach(([childKey, childValue]) => visit(childValue, childKey, depth + 1));
    } else if (typeof value !== "boolean" && value !== null) {
      reason = "Jenis data konten tidak didukung.";
    }
  };
  visit(content);
  return reason;
}

async function backupContent() {
  await fs.mkdir(BACKUP_DIR, { recursive: true, mode: 0o700 });
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await fs.copyFile(CONTENT_FILE, path.join(BACKUP_DIR, `content-${stamp}.json`));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  let entries = [];
  try {
    entries = await fs.readdir(BACKUP_DIR);
  } catch {
    return;
  }
  const backups = entries.filter((name) => /^content-.*\.json$/.test(name)).sort();
  const excess = backups.length - BACKUP_LIMIT;
  for (let index = 0; index < excess; index += 1) {
    await fs.unlink(path.join(BACKUP_DIR, backups[index])).catch(() => {});
  }
}

async function saveContent(content) {
  const json = `${JSON.stringify(content, null, 2)}\n`;
  await backupContent();
  const temporaryFile = `${CONTENT_FILE}.${process.pid}.tmp`;
  await fs.writeFile(temporaryFile, json, { encoding: "utf8", mode: 0o644 });
  await fs.rename(temporaryFile, CONTENT_FILE);
  return json;
}

function passwordProblem(password) {
  if (typeof password !== "string") return "Kata sandi tidak valid.";
  if (password.length < 14 || password.length > 1024) return "Gunakan kata sandi baru dengan panjang 14–1024 karakter.";
  if (!/\S/.test(password)) return "Kata sandi tidak boleh hanya berisi spasi.";
  if (new Set(password).size < 8) return "Gunakan kata sandi dengan minimal 8 karakter berbeda.";
  return "";
}

function checkCsrf(req, session) {
  const token = req.headers["x-csrf-token"];
  return typeof token === "string" && safeEqual(token, session.csrfToken);
}

function attemptsFor(ip) {
  const now = Date.now();
  const attempts = (loginAttempts.get(ip) || []).filter((timestamp) => now - timestamp < 15 * 60 * 1000);
  loginAttempts.set(ip, attempts);
  return attempts;
}

async function sendStatic(res, filename, contentType, cacheControl = "no-cache") {
  try {
    const body = await fs.readFile(path.join(ROOT, filename));
    const etag = `"${crypto.createHash("sha1").update(body).digest("base64url")}"`;
    send(res, 200, body, contentType, { ETag: etag }, cacheControl);
  } catch (error) {
    if (error.code === "ENOENT") sendNotFound(res);
    else throw error;
  }
}

async function sendNotFound(res) {
  try {
    const body = await fs.readFile(path.join(ROOT, "404.html"));
    send(res, 404, body, "text/html; charset=utf-8");
  } catch {
    send(res, 404, "Tidak ditemukan.");
  }
}

async function credentialsExist() {
  try {
    await fs.access(CREDENTIALS_FILE);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function saveCredentials(username, password) {
  await fs.mkdir(PRIVATE_DIR, { recursive: true, mode: 0o700 });
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  const data = JSON.stringify({
    username,
    salt: salt.toString("hex"),
    hash: hash.toString("hex"),
    createdAt: new Date().toISOString()
  }, null, 2);
  const handle = await fs.open(CREDENTIALS_FILE, "wx", 0o600);
  try {
    await handle.writeFile(`${data}\n`, "utf8");
  } finally {
    await handle.close();
  }
}

function createSession(res) {
  const token = crypto.randomBytes(32).toString("base64url");
  const csrfToken = crypto.randomBytes(32).toString("base64url");
  sessions.set(token, { csrfToken, expiresAt: Date.now() + SESSION_TTL_MS, credentialStamp: credentialStamp() });
  return { csrfToken, cookie: sessionCookie(token) };
}

async function handleRequest(req, res) {
  const requestUrl = new URL(req.url, `http://${HOST}:${PORT}`);
  const pathname = requestUrl.pathname;
  const session = getSession(req);

  if (req.method === "GET" && pathname === "/admin") {
    if (!session) {
      send(res, 302, "", "text/plain; charset=utf-8", {
        Location: await credentialsExist() ? "/admin/login" : "/admin/setup"
      });
      return;
    }
    await sendStatic(res, "admin.html", "text/html; charset=utf-8", "no-store");
    return;
  }

  if (req.method === "GET" && pathname === "/admin/setup") {
    if (session) {
      send(res, 302, "", "text/plain; charset=utf-8", { Location: "/admin" });
      return;
    }
    if (await credentialsExist()) {
      send(res, 302, "", "text/plain; charset=utf-8", { Location: "/admin/login" });
      return;
    }
    await sendStatic(res, "admin-setup.html", "text/html; charset=utf-8");
    return;
  }

  if (req.method === "GET" && pathname === "/api/content") {
    try {
      const raw = await fs.readFile(CONTENT_FILE, "utf8");
      JSON.parse(raw);
      send(res, 200, raw, "application/json; charset=utf-8", { ETag: `"${contentVersion(raw)}"` }, "no-cache");
    } catch (error) {
      console.error("Gagal membaca konten publik:", error.message);
      sendJson(res, 500, { error: "Konten situs belum dapat dimuat." });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/login") {
    if (!originIsLocal(req)) {
      sendJson(res, 403, { error: "Permintaan login ditolak." });
      return;
    }
    const ip = req.socket.remoteAddress || "local";
    const attempts = attemptsFor(ip);
    if (attempts.length >= 5) {
      sendJson(res, 429, { error: "Terlalu banyak percobaan. Tunggu 15 menit lalu coba kembali." });
      return;
    }
    let body;
    try {
      body = await readJsonBody(req, 16 * 1024);
    } catch (error) {
      sendJson(res, error.status || 400, { error: error.message });
      return;
    }
    let credentials;
    try {
      credentials = JSON.parse(await fs.readFile(CREDENTIALS_FILE, "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") {
        sendJson(res, 503, { error: "Akun admin belum dibuat. Jalankan npm run setup-admin terlebih dahulu." });
      } else {
        console.error("Gagal membaca konfigurasi akun CMS:", error.message);
        sendJson(res, 500, { error: "Konfigurasi akun CMS tidak dapat dibaca." });
      }
      return;
    }
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    let passwordMatches = false;
    try {
      const salt = Buffer.from(credentials.salt, "hex");
      const expected = Buffer.from(credentials.hash, "hex");
      const actual = await scrypt(password, salt, expected.length);
      passwordMatches = safeEqual(actual, expected);
    } catch {
      passwordMatches = false;
    }
    if (!safeEqual(username, credentials.username) || !passwordMatches) {
      attempts.push(Date.now());
      loginAttempts.set(ip, attempts);
      sendJson(res, 401, { error: "Nama pengguna atau kata sandi tidak sesuai." });
      return;
    }
    loginAttempts.delete(ip);
    const newSession = createSession(res);
    sendJson(res, 200, { ok: true }, { "Set-Cookie": newSession.cookie });
    return;
  }

  if (req.method === "POST" && pathname === "/api/setup-admin") {
    if (!originIsLocal(req)) {
      sendJson(res, 403, { error: "Setup akun hanya dapat dilakukan dari komputer ini." });
      return;
    }
    let body;
    try {
      body = await readJsonBody(req, 16 * 1024);
    } catch (error) {
      sendJson(res, error.status || 400, { error: error.message });
      return;
    }
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!/^[A-Za-z0-9._-]{3,64}$/.test(username)) {
      sendJson(res, 400, { error: "Nama pengguna harus 3–64 karakter: huruf, angka, titik, garis bawah, atau tanda hubung." });
      return;
    }
    const passwordIssue = passwordProblem(password);
    if (passwordIssue) {
      sendJson(res, 400, { error: passwordIssue });
      return;
    }
    try {
      if (await credentialsExist()) {
        sendJson(res, 409, { error: "Akun CMS sudah dibuat. Silakan masuk." });
        return;
      }
      await saveCredentials(username, password);
    } catch (error) {
      if (error.code === "EEXIST") {
        sendJson(res, 409, { error: "Akun CMS sudah dibuat. Silakan masuk." });
        return;
      }
      console.error("Gagal membuat akun CMS:", error.message);
      sendJson(res, 500, { error: "Akun CMS tidak dapat dibuat." });
      return;
    }
    const newSession = createSession(res);
    sendJson(res, 201, { ok: true }, { "Set-Cookie": newSession.cookie });
    return;
  }

  if (req.method === "GET" && pathname === "/api/admin/content") {
    if (!session) {
      sendJson(res, 401, { error: "Sesi editor berakhir. Silakan masuk kembali." });
      return;
    }
    try {
      const raw = await fs.readFile(CONTENT_FILE, "utf8");
      sendJson(res, 200, { content: JSON.parse(raw), csrfToken: session.csrfToken, version: contentVersion(raw) });
    } catch (error) {
      console.error("Gagal membaca konten CMS:", error.message);
      sendJson(res, 500, { error: "Konten tidak dapat dibaca." });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/content") {
    if (!session) {
      sendJson(res, 401, { error: "Sesi editor berakhir. Silakan masuk kembali." });
      return;
    }
    if (!originIsLocal(req) || !checkCsrf(req, session)) {
      sendJson(res, 403, { error: "Token keamanan tidak valid. Muat ulang editor lalu coba lagi." });
      return;
    }
    try {
      const body = await readJsonBody(req);
      const currentRaw = await fs.readFile(CONTENT_FILE, "utf8");
      const currentVersion = contentVersion(currentRaw);
      if (typeof body.version !== "string" || body.version !== currentVersion) {
        sendJson(res, 409, {
          error: "Konten sudah diperbarui di tab atau proses lain. Editor dimuat ulang; ulangi perubahan Anda lalu simpan kembali.",
          version: currentVersion
        });
        return;
      }
      const reason = validateContent(body.content);
      if (reason) {
        sendJson(res, 400, { error: reason });
        return;
      }
      const savedJson = await saveContent(body.content);
      sendJson(res, 200, {
        ok: true,
        content: body.content,
        savedAt: new Date().toISOString(),
        version: contentVersion(savedJson)
      });
    } catch (error) {
      console.error("Gagal menyimpan konten:", error.message);
      sendJson(res, error.status || 500, { error: error.status ? error.message : "Gagal menyimpan konten. File lama tetap dipertahankan." });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/media") {
    if (!session) {
      sendJson(res, 401, { error: "Sesi editor berakhir. Silakan masuk kembali." });
      return;
    }
    if (!originIsLocal(req) || !checkCsrf(req, session)) {
      sendJson(res, 403, { error: "Token keamanan tidak valid." });
      return;
    }
    try {
      const body = await readJsonBody(req, 7 * 1024 * 1024);
      const formats = {
        "image/png": { extension: "png", matches: (data) => data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
        "image/jpeg": { extension: "jpg", matches: (data) => data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff },
        "image/webp": { extension: "webp", matches: (data) => data.length >= 12 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP" }
      };
      const format = formats[body.mimeType];
      if (!format || typeof body.data !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/.test(body.data)) {
        sendJson(res, 400, { error: "Unggah PNG, JPEG, atau WebP yang valid." });
        return;
      }
      const data = Buffer.from(body.data, "base64");
      if (data.length === 0 || data.length > 5 * 1024 * 1024 || !format.matches(data)) {
        sendJson(res, 400, { error: "File gambar tidak valid atau melebihi 5 MB." });
        return;
      }
      await fs.mkdir(MEDIA_DIR, { recursive: true });
      const filename = `${crypto.randomBytes(12).toString("hex")}.${format.extension}`;
      await fs.writeFile(path.join(MEDIA_DIR, filename), data, { flag: "wx", mode: 0o644 });
      sendJson(res, 201, { path: `/media/${filename}` });
    } catch (error) {
      console.error("Gagal menyimpan media:", error.message);
      sendJson(res, error.status || 500, { error: error.status ? error.message : "File media gagal disimpan." });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/logout") {
    if (!session || !originIsLocal(req) || !checkCsrf(req, session)) {
      sendJson(res, 403, { error: "Sesi atau token keamanan tidak valid." });
      return;
    }
    sessions.delete(session.token);
    sendJson(res, 200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
    return;
  }

  if (req.method === "GET" && pathname.startsWith("/media/")) {
    const match = /^\/media\/([a-f0-9]{24}\.(?:png|jpg|webp))$/i.exec(pathname);
    if (!match) {
      send(res, 404, "Tidak ditemukan.");
      return;
    }
    const extension = path.extname(match[1]);
    const types = { ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" };
    await sendStatic(res, path.join("media", match[1]), types[extension], "public, max-age=31536000, immutable");
    return;
  }

  const staticFile = STATIC_FILES.get(pathname);
  if (req.method === "GET" && staticFile) {
    const filename = staticFile[0];
    const cacheControl = filename.startsWith("admin")
      ? "no-store"
      : /\.(?:png|jpg|jpeg|webp|ico)$/i.test(filename)
        ? "public, max-age=31536000, immutable"
        : "no-cache";
    await sendStatic(res, filename, staticFile[1], cacheControl);
    return;
  }

  if (req.method === "GET" && pathname === "/admin/") {
    send(res, 301, "", "text/plain; charset=utf-8", { Location: "/admin" });
    return;
  }

  if (req.method === "GET" && String(req.headers.accept || "").includes("text/html")) {
    await sendNotFound(res);
    return;
  }

  send(res, 404, "Tidak ditemukan.");
}

setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(token);
  }
  for (const [ip, attempts] of loginAttempts) {
    if (attempts.every((timestamp) => now - timestamp >= 15 * 60 * 1000)) loginAttempts.delete(ip);
  }
}, 60 * 1000).unref();

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    console.error("Request gagal:", error.message);
    if (!res.headersSent) send(res, 500, "Terjadi kesalahan pada server lokal.");
    else res.end();
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Situs UDD PMI Lampung tersedia di http://${HOST}:${PORT}`);
  console.log(`CMS editor: http://${HOST}:${PORT}/admin`);
  console.log("Server hanya menerima koneksi dari komputer ini (localhost).");
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
