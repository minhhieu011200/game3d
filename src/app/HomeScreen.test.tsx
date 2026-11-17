import { fireEvent, render, screen } from '@testing-library/react';
import { HomeScreen } from './HomeScreen';

test('mở trò chơi: trang chào mừng → clip "Kìa con bướm vàng" → trang Vườn Thú Số Vui; quay lại không chiếu lại', () => {
  const { unmount } = render(<HomeScreen />);
  const img = screen.getByAltText(/Chào mừng các thầy cô/);
  const slide = img.parentElement!;
  // hiệu ứng của ảnh bên trong không làm tắt trang chào
  fireEvent.animationEnd(img);
  expect(slide.className).toContain('on');
  fireEvent.click(slide);
  expect(slide.className).toContain('leaving');
  fireEvent.animationEnd(slide);
  expect(screen.queryByAltText(/Chào mừng các thầy cô/)).toBeNull();
  // ảnh mờ xong thì chiếu clip
  const video = document.querySelector('video')!;
  expect(video.getAttribute('src')).toBe('./videos/kia-con-buom-vang.mp4');
  // Space để tạm dừng clip, không qua trang
  fireEvent.keyDown(window, { key: ' ' });
  expect(document.querySelector('video')).not.toBeNull();
  // clip hết (hoặc bấm Next của bút) thì sang trang Vườn Thú Số Vui
  fireEvent.ended(video);
  expect(document.querySelector('video')).toBeNull();
  expect(screen.getByText(/Bắt đầu/)).toBeTruthy();
  unmount();
  render(<HomeScreen />);
  expect(screen.queryByAltText(/Chào mừng các thầy cô/)).toBeNull();
});

test('đang chiếu clip: nút Next của bút trình chiếu (PageDown) qua luôn trang Vườn Thú Số Vui', async () => {
  // module đã đánh dấu chiếu rồi ở test trước, nên nạp lại bản mới
  vi.resetModules();
  const { HomeScreen: Fresh } = await import('./HomeScreen');
  render(<Fresh />);
  fireEvent.keyDown(window, { key: 'PageDown' });
  fireEvent.animationEnd(screen.getByAltText(/Chào mừng các thầy cô/).parentElement!);
  expect(document.querySelector('video')).not.toBeNull();
  fireEvent.keyDown(window, { key: 'PageDown' });
  expect(document.querySelector('video')).toBeNull();
});
