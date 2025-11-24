import { storage, getScript, addScript, setStorage } from './storage.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { oldName, newName, content } = req.body || {};

  if (!oldName || !newName || !content) {
    return res.status(400).json({ error: '❌ Thiếu dữ liệu bắt buộc' });
  }

  if (!storage[oldName]) return res.status(404).json({ error: '❌ Script không tồn tại' });

  if (!/^[a-zA-Z0-9\-]{1,50}$/.test(newName)) {
    return res.status(400).json({ error: '❌ Tên script chỉ chứa chữ cái, số, dấu "-"' });
  }

  try {
    // Nếu đổi tên mà trùng tên khác
    if (oldName !== newName && storage[newName]) {
      return res.status(409).json({ error: '❌ Tên mới đã được sử dụng' });
    }

    // Bảo vệ code bằng zero-width char
    const ZWJ = '\u200D';
    const invisibleCode = content.split('').map(c => ZWJ + c).join('');

    // Xóa cũ nếu đổi tên
    if (oldName !== newName) {
      delete storage[oldName];
    }

    // Lưu mới
    storage[newName] = {
      id: storage[oldName]?.id || crypto.randomUUID(),
      content: invisibleCode,
      createdAt: storage[oldName]?.createdAt || new Date().toISOString()
    };

    res.status(200).json({ message: '✅ Cập nhật thành công', name: newName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Lỗi server khi cập nhật' });
  }
}
