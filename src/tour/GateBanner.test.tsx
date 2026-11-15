import { fireEvent, render, screen } from '@testing-library/react';
import { GateBanner } from './GateBanner';

test('Cổng 2 có nút Phiếu bài tập, bấm vào thì hiện phiếu; bấm Đóng thì tắt', () => {
  render(<GateBanner gate="bunny" />);
  fireEvent.click(screen.getByText(/Phiếu bài tập/));
  expect(screen.getByAltText('Phiếu bài tập số 1').getAttribute('src')).toBe('./images/phieu-bai-tap-so-1.png');
  fireEvent.click(screen.getByText(/Đóng/));
  expect(screen.queryByAltText('Phiếu bài tập số 1')).toBeNull();
});

test('cổng chưa có phiếu thì không có nút', () => {
  render(<GateBanner gate="flower" />);
  expect(screen.queryByText(/Phiếu bài tập/)).toBeNull();
});

test('Cổng 4: phiếu bài tập vẽ như bảng tổng kết – có kết quả, có hình, chưa có đường nối', () => {
  render(<GateBanner gate="pond" />);
  fireEvent.click(screen.getByText(/Phiếu bài tập/));
  expect(screen.getByRole('dialog', { name: 'Phiếu bài tập số 3' })).toBeTruthy();
  expect(Array.from(document.querySelectorAll('.mt-res')).map((e) => e.textContent)).toEqual(['5', '8', '7']);
  expect(document.querySelectorAll('.mt-pic img')).toHaveLength(3);
  expect(document.querySelectorAll('.mt-lines line')).toHaveLength(0);
});
