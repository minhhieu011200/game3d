import { useEffect, useRef, useState } from 'react';
import type { HandLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { countFingers } from './fingerCount';
import { mediapipeSources, WEB_TIMEOUT_MS, type MediapipeSource } from './mediapipeSources';
import { FingerStabilizer } from './stabilizer';

export type CameraStatus = 'loading' | 'ready' | 'denied' | 'nocamera' | 'error';

export interface HandTrackerState {
  status: CameraStatus;
  /** Số ngón đã làm mượt; `null` = không thấy tay. */
  count: number | null;
  progress: number;
  handsSeen: number;
}

export interface HandTracker extends HandTrackerState {
  videoRef: React.RefObject<HTMLVideoElement>;
  /** Điểm khớp (toạ độ 0..1 trên khung hình) của lần nhận diện gần nhất, để vẽ. */
  landmarksRef: React.MutableRefObject<NormalizedLandmark[][]>;
  /** Bỏ khóa chốt, dùng khi sang câu hỏi mới. */
  resetHold(): void;
}

// Dùng chung một HandLandmarker cho cả phiên để không phải nạp lại mô hình ~8MB.
let landmarkerPromise: Promise<HandLandmarker> | null = null;

async function createFrom(source: MediapipeSource): Promise<HandLandmarker> {
  const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
  const fileset = await FilesetResolver.forVisionTasks(source.wasm);
  const options = (delegate: 'GPU' | 'CPU') => ({
    baseOptions: { modelAssetPath: source.model, delegate },
    runningMode: 'VIDEO' as const,
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  try {
    return await HandLandmarker.createFromOptions(fileset, options('GPU'));
  } catch {
    return await HandLandmarker.createFromOptions(fileset, options('CPU'));
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);
}

/** Có mạng thì tải MediaPipe từ web; lỗi, quá chậm hoặc mất mạng thì dùng bản đóng gói sẵn trên máy. */
async function createLandmarker(): Promise<HandLandmarker> {
  const sources = mediapipeSources(navigator.onLine, new URL('./mediapipe', document.baseURI).href);
  let lastError: unknown;
  for (const s of sources) {
    try {
      const lm = await withTimeout(createFrom(s), s.kind === 'web' ? WEB_TIMEOUT_MS : 60_000);
      mediapipeSourceUsed = s.kind;
      return lm;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

/** Nguồn MediaPipe đã dùng ('web' hay 'local'), để hiển thị và kiểm thử. */
export let mediapipeSourceUsed: MediapipeSource['kind'] | null = null;

function getLandmarker() {
  landmarkerPromise ??= createLandmarker().catch((e) => {
    landmarkerPromise = null;
    throw e;
  });
  return landmarkerPromise;
}

export function useHandTracker(opts: { holdMs?: number; onCommit?: (n: number) => void } = {}): HandTracker {
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarksRef = useRef<NormalizedLandmark[][]>([]);
  const stabilizer = useRef(new FingerStabilizer({ holdMs: opts.holdMs }));
  const onCommit = useRef(opts.onCommit);
  onCommit.current = opts.onCommit;
  const [state, setState] = useState<HandTrackerState>({ status: 'loading', count: null, progress: 0, handsSeen: 0 });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setState((s) => ({ ...s, status: 'nocamera' }));
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
      } catch (e) {
        const name = (e as DOMException).name;
        const status: CameraStatus =
          name === 'NotAllowedError' || name === 'SecurityError'
            ? 'denied'
            : name === 'NotFoundError' || name === 'OverconstrainedError'
              ? 'nocamera'
              : 'error';
        if (!cancelled) setState((s) => ({ ...s, status }));
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play().catch(() => undefined);

      let landmarker: HandLandmarker;
      try {
        landmarker = await getLandmarker();
      } catch {
        if (!cancelled) setState((s) => ({ ...s, status: 'error' }));
        return;
      }
      if (cancelled) return;
      setState((s) => ({ ...s, status: 'ready' }));

      let lastVideoTime = -1;
      let last = { count: null as number | null, progress: -1, hands: -1 };
      const loop = () => {
        if (cancelled) return;
        raf = requestAnimationFrame(loop);
        if (video.readyState < 2 || video.currentTime === lastVideoTime) return;
        lastVideoTime = video.currentTime;
        const now = performance.now();
        const result = landmarker.detectForVideo(video, now);
        landmarksRef.current = result.landmarks;
        const hands = result.worldLandmarks.length ? result.worldLandmarks : result.landmarks;
        const s = stabilizer.current.update(countFingers(hands), now);
        if (s.committed !== null) onCommit.current?.(s.committed);
        const progress = Math.round(s.progress * 20) / 20;
        if (s.stable !== last.count || progress !== last.progress || hands.length !== last.hands) {
          last = { count: s.stable, progress, hands: hands.length };
          setState((st) => ({ ...st, count: s.stable, progress, handsSeen: hands.length }));
        }
      };
      loop();
    }

    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      landmarksRef.current = [];
    };
  }, []);

  return {
    ...state,
    videoRef,
    landmarksRef,
    resetHold: () => stabilizer.current.reset(),
  };
}
