import { useEffect, useRef } from 'react';
import type { HandTracker } from './useHandTracker';

// Các đoạn nối giữa điểm khớp để vẽ bộ xương bàn tay.
const BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

export const CAMERA_MESSAGES: Record<'denied' | 'nocamera' | 'error', string> = {
  denied: 'Chưa mở được camera. Hãy bấm biểu tượng camera trên thanh địa chỉ và chọn Cho phép.',
  nocamera: 'Không tìm thấy camera. Hãy cắm webcam rồi mở lại bài này. Bạn vẫn có thể trả lời bằng bàn phím số.',
  error: 'Camera đang gặp lỗi. Hãy đóng các chương trình khác đang dùng camera rồi mở lại bài này.',
};

/**
 * Vị trí và kích thước (px) của khung hình video khi vẽ kiểu object-fit: cover vào hộp boxW × boxH.
 * Phần tràn ra ngoài hộp bị cắt, nên x0/y0 có thể âm.
 */
export function coverRect(videoW: number, videoH: number, boxW: number, boxH: number) {
  const s = Math.max(boxW / videoW, boxH / videoH);
  const sw = videoW * s;
  const sh = videoH * s;
  return { x0: (boxW - sw) / 2, y0: (boxH - sh) / 2, sw, sh };
}

/** Khung hình camera lật như gương, có vẽ các điểm khớp tay. */
export function CameraView({ tracker }: { tracker: HandTracker }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const c = canvasRef.current;
      const v = tracker.videoRef.current;
      if (!c || !v) return;
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      const g = c.getContext('2d');
      if (!g) return;
      g.clearRect(0, 0, w, h);
      // Video hiển thị kiểu object-fit: cover (cắt bớt cạnh thừa), nên điểm khớp phải
      // được co giãn và dịch theo đúng phần hình đang thấy, nếu không sẽ lệch khỏi bàn tay.
      const { x0, y0, sw, sh } = coverRect(v.videoWidth || w, v.videoHeight || h, w, h);
      const X = (x: number) => x0 + x * sw;
      const Y = (y: number) => y0 + y * sh;
      const r = Math.max(3, Math.min(w, h) / 90);
      g.lineWidth = r * 0.8;
      g.strokeStyle = '#ffeb3b';
      g.fillStyle = '#ff5722';
      for (const hand of tracker.landmarksRef.current) {
        for (const [a, b] of BONES) {
          g.beginPath();
          g.moveTo(X(hand[a].x), Y(hand[a].y));
          g.lineTo(X(hand[b].x), Y(hand[b].y));
          g.stroke();
        }
        for (const p of hand) {
          g.beginPath();
          g.arc(X(p.x), Y(p.y), r, 0, Math.PI * 2);
          g.fill();
        }
      }
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [tracker.videoRef, tracker.landmarksRef]);

  const { status } = tracker;
  return (
    <div className="camera-view">
      <video ref={tracker.videoRef} playsInline muted />
      <canvas ref={canvasRef} />
      {status === 'loading' && <div className="camera-msg">Đang mở camera…</div>}
      {(status === 'denied' || status === 'nocamera' || status === 'error') && (
        <div className="camera-msg camera-error" role="alert">
          {CAMERA_MESSAGES[status]}
        </div>
      )}
    </div>
  );
}
