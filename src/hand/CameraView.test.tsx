import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { CameraView, coverRect } from './CameraView';

test('webcam 16:9 trong khung 4:3: cắt hai bên, điểm giữa vẫn ở giữa', () => {
  const r = coverRect(1280, 720, 400, 300);
  expect(r.sh).toBeCloseTo(300);
  expect(r.sw).toBeCloseTo(533.33, 1);
  expect(r.x0).toBeCloseTo(-66.67, 1);
  expect(r.y0).toBeCloseTo(0);
  expect(r.x0 + 0.5 * r.sw).toBeCloseTo(200); // tâm khung hình trùng tâm hộp
});

test('webcam 4:3 trong khung 4:3: không cắt', () => {
  expect(coverRect(640, 480, 400, 300)).toEqual({ x0: 0, y0: 0, sw: 400, sh: 300 });
});
import type { HandTracker } from './useHandTracker';

function tracker(status: HandTracker['status']): HandTracker {
  return {
    status,
    count: null,
    progress: 0,
    handsSeen: 0,
    videoRef: createRef(),
    landmarksRef: { current: [] },
    resetHold: () => {},
  };
}

test('bị từ chối quyền thì hiện hướng dẫn tiếng Việt đúng như spec', () => {
  render(<CameraView tracker={tracker('denied')} />);
  expect(screen.getByRole('alert').textContent).toBe(
    'Chưa mở được camera. Hãy bấm biểu tượng camera trên thanh địa chỉ và chọn Cho phép.',
  );
});

test('không có camera thì báo không tìm thấy camera', () => {
  render(<CameraView tracker={tracker('nocamera')} />);
  expect(screen.getByRole('alert').textContent).toContain('Không tìm thấy camera');
});
