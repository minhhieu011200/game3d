// Nơi tải MediaPipe JS (file .wasm và mô hình bàn tay .task).
// Có mạng: tải từ web trước. Không có mạng, hoặc web lỗi/chậm: dùng bản đóng gói trong public/mediapipe/.

/** Phải trùng phiên bản @mediapipe/tasks-vision trong package.json. */
export const MEDIAPIPE_VERSION = '0.10.14';
export const WEB_WASM = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
export const WEB_MODEL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
/** Web chậm hơn mức này thì bỏ, chuyển sang bản trên máy. */
export const WEB_TIMEOUT_MS = 10_000;

export interface MediapipeSource {
  kind: 'web' | 'local';
  wasm: string;
  model: string;
}

export function mediapipeSources(online: boolean, localBase: string): MediapipeSource[] {
  const local: MediapipeSource = { kind: 'local', wasm: localBase, model: `${localBase}/hand_landmarker.task` };
  return online ? [{ kind: 'web', wasm: WEB_WASM, model: WEB_MODEL }, local] : [local];
}
