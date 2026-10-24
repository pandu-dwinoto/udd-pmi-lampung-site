"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { promisify } = require("node:util");
const readline = require("node:readline/promises");

const scrypt = promisify(crypto.scrypt);
const PRIVATE_DIR = path.join(__dirname, "private");
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
          reject(new Error("Setup dibatalkan."));
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

async function main() {
  try {
    await fs.access(CREDENTIALS_FILE);
    throw new Error("Akun admin sudah dibuat. Jangan menimpa kredensial secara tidak sengaja.");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
  let username;
  try {
    username = (await terminal.question("Nama pengguna editor (min. 3 karakter): ")).trim();
  } finally {
    terminal.close();
  }
  if (!/^[A-Za-z0-9._-]{3,64}$/.test(username)) {
    throw new Error("Nama pengguna harus 3-64 karakter: huruf, angka, titik, garis bawah, atau tanda hubung.");
  }

  const password = await readHidden("Kata sandi (min. 14 karakter, tidak ditampilkan): ");
  const confirmation = await readHidden("Ulangi kata sandi: ");
  if (password.length < 14 || password.length > 1024) throw new Error("Kata sandi harus 14-1024 karakter.");
  if (!/\S/.test(password)) throw new Error("Kata sandi tidak boleh hanya berisi spasi.");
  if (new Set(password).size < 8) throw new Error("Gunakan minimal 8 karakter berbeda.");
  if (password !== confirmation) throw new Error("Kata sandi tidak sama.");

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
  console.log("Akun CMS tersimpan di private/admin-credentials.json; kata sandi hanya disimpan sebagai hash.");
  console.log("Simpan kata sandi di pengelola sandi Anda. Jangan unggah folder private/ ke publik.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
