import { readFileSync } from 'node:fs';
import { MEDIAPIPE_VERSION, mediapipeSources } from './mediapipeSources';

const LOCAL = 'http://localhost:8080/mediapipe';

test('có mạng: thử web trước, dự phòng bằng bản trên máy', () => {
  const s = mediapipeSources(true, LOCAL);
  expect(s.map((x) => x.kind)).toEqual(['web', 'local']);
  expect(s[0].wasm).toContain(`tasks-vision@${MEDIAPIPE_VERSION}/wasm`);
  expect(s[1]).toEqual({ kind: 'local', wasm: LOCAL, model: `${LOCAL}/hand_landmarker.task` });
});

test('không có mạng: chỉ dùng bản trên máy', () => {
  expect(mediapipeSources(false, LOCAL).map((x) => x.kind)).toEqual(['local']);
});

test('phiên bản wasm trên web trùng với thư viện đã cài', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  expect(pkg.dependencies['@mediapipe/tasks-vision']).toBe(MEDIAPIPE_VERSION);
});
