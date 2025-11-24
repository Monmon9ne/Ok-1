import { storage, setStorage, getScript } from './storage.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');

  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).json({ error:'Method not allowed' });

  const { name } = req.body || {};

  if(!name) return res.status(400).json({ error:'❌ Thiếu tên script' });
  if(!storage[name]) return res.status(404).json({ error:'❌ Script không tồn tại' });

  try {
    delete storage[name];
    res.status(200).json({ message:`✅ Script "${name}" đã bị xóa` });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error:'❌ Lỗi server khi xóa' });
  }
}
