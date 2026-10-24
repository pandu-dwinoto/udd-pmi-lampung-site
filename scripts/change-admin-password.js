"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { promisify } = require("node:util");
const readline = require("node:readline/promises");

const scrypt = promisify(crypto.scrypt);
const PRIVATE_DIR = path.join(__dirname, "..", "private");
const CREDENTIALS_FILE = path.join(PRIVATE_DIR, "admin-credentials.json");

function readHidden(prompt) {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    if (!input.isTTY || typeof input.setRawMode !== "function") {
      reject(new Error("Jalankan perintah ini dari terminal interaktif agar kata sandi tidak terlihat."));
      return;
    }
    process.stdout.write(prompt);
    input.setRawMode(true);
    input.resume();
    let value = "";
    const onData = (buffer) => {
      for (const character of buffer.toString("utf8")) {
        if (character === "\u0003") {
          input.setRawMode(false);
          input.pause();
          input.off("data", onData);
          reject(new Error("Dibatalkan."));
          return;
        }
        if (character === "\r" || character === "\n") {
          input.setRawMode(false);
          input.pause();
          input.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (character === "\u007f" || character === "\b") {
          value = Array.from(value).slice(0, -1).join("");
        } else if (character.charCodeAt(0) >= 32) {
          value += character;
        }
      }
    };
    input.on("data", onData);
  });
}

function passwordProblem(password) {
  if (password.length < 14 || password.length > 1024) return "Kata sandi harus 14–1024 karakter.";
  if (!/\S/.test(password)) return "Kata sandi tidak boleh hanya berisi spasi.";
  if (new Set(password).size < 8) return "Gunakan minimal 8 karakter berbeda.";
  return "";
}

async function main() {
  let credentials;
  try {
    credentials = JSON.parse(await fs.readFile(CREDENTIALS_FILE, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") throw new Error("Akun admin belum dibuat. Jalankan npm run setup-admin lebih dulu.");
    throw error;
  }

  console.log(`Akun: ${credentials.username}`);
  const current = await readHidden("Kata sandi saat ini: ");
  const salt = Buffer.from(credentials.salt, "hex");
  const expected = Buffer.from(credentials.hash, "hex");
  const actual = await scrypt(current, salt, expected.length);
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    throw new Error("Kata sandi saat ini tidak sesuai.");
  }

  const next = await readHidden("Kata sandi baru (min. 14 karakter): ");
  const problem = passwordProblem(next);
  if (problem) throw new Error(problem);
  const confirmation = await readHidden("Ulangi kata sandi baru: ");
  if (next !== confirmation) throw new Error("Kata sandi baru tidak sama.");

  const nextSalt = crypto.randomBytes(16);
  const nextHash = await scrypt(next, nextSalt, 64);
  const data = JSON.stringify({
    username: credentials.username,
    salt: nextSalt.toString("hex"),
    hash: nextHash.toString("hex"),
    createdAt: credentials.createdAt,
    updatedAt: new Date().toISOString()
  }, null, 2);
  await fs.writeFile(CREDENTIALS_FILE, `${data}\n`, { encoding: "utf8", mode: 0o600 });
  console.log("Kata sandi diperbarui. Sesi CMS yang sedang aktif otomatis tidak berlaku.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
