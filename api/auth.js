import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_FILE = path.join(__dirname, 'users.json');

// Hash password
function hashPassword(pw){
  return crypto.createHash('sha256').update(pw).digest('hex');
}

// Load users
async function loadUsers(){
  if(await fs.pathExists(USER_FILE)){
    return await fs.readJSON(USER_FILE);
  }
  return {};
}

// Save users
async function saveUsers(users){
  await fs.writeJSON(USER_FILE, users, {spaces:2});
}

export default async function handler(req, res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");

  if(req.method==='OPTIONS'){
    return res.status(200).end();
  }

  if(req.method !== 'POST'){
    return res.status(405).json({error:'Method not allowed'});
  }

  const { action, username, password } = req.body || {};

  if(!action || !username || !password){
    return res.status(400).json({error:"Thiếu thông tin"});
  }

  try {
    const users = await loadUsers();

    if(action==='register'){
      if(users[username]){
        return res.status(409).json({error:"Tên tài khoản đã tồn tại"});
      }
      users[username] = { password: hashPassword(password) };
      await saveUsers(users);
      return res.status(200).json({message:'Đăng ký thành công'});
    } else if(action==='login'){
      if(!users[username] || users[username].password!==hashPassword(password)){
        return res.status(401).json({error:"Tên tài khoản hoặc mật khẩu sai"});
      }
      return res.status(200).json({message:'Đăng nhập thành công'});
    } else {
      return res.status(400).json({error:"Action không hợp lệ"});
    }
  } catch(e){
    return res.status(500).json({error:e.message});
  }
}
