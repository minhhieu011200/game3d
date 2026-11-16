import { fireEvent, render, screen } from '@testing-library/react';
import { HomeScreen } from './HomeScreen';

test('mở trò chơi: trang chào mừng hiện trước, bấm thì mờ dần rồi còn trang Vườn Thú Số Vui; quay lại không chiếu lại', () => {
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
  expect(screen.getByText(/Bắt đầu/)).toBeTruthy();
  unmount();
  render(<HomeScreen />);
  expect(screen.queryByAltText(/Chào mừng các thầy cô/)).toBeNull();
});
