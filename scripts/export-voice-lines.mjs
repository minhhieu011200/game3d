// Xuất bảng lời đọc ra scripts/voice-lines.json để tạo giọng đọc,
// và kiểm tra mọi khóa đều có file trong public/audio/voice/.
// Dùng: node scripts/export-voice-lines.mjs [--check]
import { writeFileSync, existsSync } from 'node:fs';
import { build } from 'vite';

const out = await build({
  logLevel: 'silent',
  configFile: false,
  build: {
    write: false,
    lib: { entry: 'src/audio/voiceLines.ts', formats: ['es'], fileName: 'voice' },
  },
});
const code = out[0].output[0].code;
const mod = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const lines = mod.voiceLines;

if (process.argv.includes('--check')) {
  const missing = Object.keys(lines).filter((k) => !existsSync(`public/audio/voice/${k}.mp3`));
  if (missing.length) {
    console.error(`Thiếu ${missing.length} file giọng đọc:\n  ` + missing.join('\n  '));
    process.exit(1);
  }
  console.log(`Đủ ${Object.keys(lines).length} file giọng đọc.`);
} else {
  writeFileSync('scripts/voice-lines.json', JSON.stringify(lines, null, 2) + '\n');
  console.log(`Đã xuất ${Object.keys(lines).length} câu vào scripts/voice-lines.json`);
}
