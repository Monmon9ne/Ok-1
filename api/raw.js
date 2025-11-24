import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_FILE = path.join(__dirname, "..", "scripts.json");

async function loadStorage() {
  try {
    if (await fs.pathExists(STORAGE_FILE)) {
      return await fs.readJSON(STORAGE_FILE);
    }
  } catch (err) {
    console.error("Load error:", err.message);
  }
  return {};
}

export default async function handler(req, res) {
  const name = req.query.name;
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();

  if (!name) {
    return res.status(400).json({ error: "❌ Tên script không được để trống" });
  }

  if (!userAgent.includes("roblox")) {
    res.status(403).send(" ");
    return;
  }

  try {
    const storage = await loadStorage();

    if (!storage[name]) {
      return res.status(404).send("❌ Không tìm thấy script này");
    }

    const script = storage[name];
    const cleanCode = script.content.replace(/\u200D/g, '');
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(cleanCode);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("❌ Lỗi lấy script");
  }
}
