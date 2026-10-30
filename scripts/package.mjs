// Đóng gói bản chạy offline: TroChoiToan1/{start.bat, server.ps1, HUONG-DAN.txt, game/}
// Dùng: npm run package   (đã gồm bước build)
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'TroChoiToan1';
if (!existsSync('dist/index.html')) {
  console.error('Chưa có dist/. Hãy chạy "npm run build" trước.');
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
cpSync('dist', join(OUT, 'game'), { recursive: true });
cpSync('release/server.ps1', join(OUT, 'server.ps1'));
// .bat phải dùng xuống dòng kiểu Windows (CRLF)
const bat = readFileSync('release/start.bat', 'utf8').replace(/\r?\n/g, '\r\n');
writeFileSync(join(OUT, 'start.bat'), bat);
const guide = readFileSync('release/HUONG-DAN.txt', 'utf8').replace(/\r?\n/g, '\r\n');
writeFileSync(join(OUT, 'HUONG-DAN.txt'), '﻿' + guide);

// Bản phát hành không được gọi ra mạng: tìm địa chỉ http(s) lạ trong mã đã build.
const allowed = /^https?:\/\/(localhost|127\.0\.0\.1|www\.w3\.org|threejs\.org|github\.com|developers\.google\.com|polyhaven\.com|quaternius\.com|kenney\.nl|ro\.me|fonts\.google\.com|creativecommons\.org|cdn\.jsdelivr\.net\/npm\/@mediapipe|storage\.googleapis\.com\/mediapipe-models)/;
const suspicious = new Set();
function scan(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) scan(p);
    else if (/\.(js|html|css)$/.test(f)) {
      for (const m of readFileSync(p, 'utf8').matchAll(/https?:\/\/[a-zA-Z0-9.-]+\.[a-z]{2,}[^\s"'`)]*/g)) {
        if (!allowed.test(m[0])) suspicious.add(m[0].slice(0, 90));
      }
    }
  }
}
scan(join(OUT, 'game'));

function size(dir) {
  return readdirSync(dir).reduce((s, f) => {
    const p = join(dir, f);
    return s + (statSync(p).isDirectory() ? size(p) : statSync(p).size);
  }, 0);
}
const mb = (size(OUT) / 1e6).toFixed(1);
console.log(`Đã tạo ${OUT}/ (${mb} MB)`);
if (suspicious.size) {
  console.log('Địa chỉ mạng có trong mã (chỉ là chuỗi trong thư viện, kiểm tra lại nếu cần):');
  for (const u of suspicious) console.log('  ' + u);
}
