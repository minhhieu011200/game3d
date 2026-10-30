import { act, fireEvent, render, screen } from '@testing-library/react';
import { useApp } from '../../app/store';
import FlowerGame from './FlowerGame';
import { QUESTIONS } from './questions';

beforeEach(() => {
  vi.useFakeTimers();
  act(() => useApp.setState({ screen: 'flower', gate: null }));
});
afterEach(() => vi.useRealTimers());

function solveAll() {
  for (const q of QUESTIONS) {
    for (let k = 0; k < q.b; k++) fireEvent.click(screen.getByLabelText(`Bông hoa ${q.a - k}`));
    fireEvent.click(screen.getByRole('button', { name: String(q.a - q.b) }));
    act(() => vi.advanceTimersByTime(3000));
  }
}

test('câu đầu là câu mẫu 6 − 1', () => {
  render(<FlowerGame />);
  expect(screen.getByText('Mẫu')).toBeTruthy();
  expect(screen.getAllByLabelText(/^Bông hoa \d$/)).toHaveLength(6);
});

test('bấm viên đá khi chưa bớt đủ hoa thì được nhắc', () => {
  render(<FlowerGame />);
  fireEvent.click(screen.getByRole('button', { name: '5' }));
  expect(screen.getByText('Hãy bớt đủ 1 bông trước nhé!')).toBeTruthy();
});

test('làm hết 5 câu thì thấy bảng tổng kết như trang sách', () => {
  render(<FlowerGame />);
  solveAll();
  expect(screen.getByText(/Hoàn thành Vườn Hoa/)).toBeTruthy();
  const lines = Array.from(document.querySelectorAll('.b1-summary .b1-line-eq')).map((e) => e.textContent);
  expect(lines).toEqual(['6 − 1 = 5', '6 − 2 = 4', '6 − 3 = 3', '6 − 4 = 2', '6 − 5 = 1']);
  expect(screen.queryByText(/Qua cổng/)).toBeNull(); // mở riêng lẻ thì không có nút Qua cổng
});

test('mở từ cổng thì bảng tổng kết có nút Qua cổng', () => {
  act(() => useApp.setState({ gate: 'flower' }));
  render(<FlowerGame />);
  solveAll();
  expect(screen.getByText(/Qua cổng/)).toBeTruthy();
});
