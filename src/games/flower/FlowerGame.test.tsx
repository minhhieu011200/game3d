import { act, fireEvent, render, screen } from '@testing-library/react';
import { useApp } from '../../app/store';
import FlowerGame from './FlowerGame';
import { QUESTIONS } from './questions';
import { useTour } from '../../tour/store';

beforeEach(() => {
  act(() => useApp.setState({ screen: 'flower', gate: null }));
});

const stage = () => document.querySelector('.b1') as HTMLElement;
const tap = (n = 1) => {
  for (let i = 0; i < n; i++) fireEvent.click(stage());
};
const redCount = () => document.querySelectorAll('.b1-garden .b1-flower.red').length;
/** Phép tính đang hiện; `null` khi chưa tới bước hiện phép tính (vẫn giữ chỗ nhưng ẩn). */
const eq = () => {
  const row = document.querySelector('.b1-row') as HTMLElement | null;
  return row && row.style.visibility !== 'hidden' ? row.querySelector('.b1-eq')!.textContent : null;
};

test('lúc đầu chỉ có 6 bông hoa vàng, chưa có phép tính, không có viên đá số hay gợi ý', () => {
  render(<FlowerGame />);
  expect(screen.getAllByLabelText(/^Bông hoa \d$/)).toHaveLength(6);
  expect(redCount()).toBe(0);
  expect(eq()).toBeNull();
  expect(document.querySelector('.b1-stones')).toBeNull();
  expect(document.querySelector('.b1-hint')).toBeNull();
});

test('mỗi lần bấm hiện một bước: bướm đậu → phép tính → kết quả → câu sau', () => {
  render(<FlowerGame />);
  tap(); // bướm bay vào 1 bông
  expect(redCount()).toBe(1);
  expect(eq()).toBeNull();
  tap(); // hiện phép tính
  expect(eq()).toBe('6 − 1 = ?');
  expect(screen.getByText('Mẫu')).toBeTruthy();
  tap(); // hiện kết quả
  expect(eq()).toBe('6 − 1 = 5');
  tap(); // sang câu 6 − 2: lại 6 bông vàng
  expect(redCount()).toBe(0);
  expect(eq()).toBeNull();
  tap();
  expect(redCount()).toBe(2);
});

test('bấm hết 5 câu thì thấy bảng tổng kết như trang sách', () => {
  render(<FlowerGame />);
  tap(QUESTIONS.length * 4);
  expect(screen.getByText(/Hoàn thành Vườn Hoa/)).toBeTruthy();
  const lines = Array.from(document.querySelectorAll('.b1-summary .b1-line-eq')).map((e) => e.textContent);
  expect(lines).toEqual(['6 − 1 = 5', '6 − 2 = 4', '6 − 3 = 3', '6 − 4 = 2', '6 − 5 = 1']);
  expect(screen.queryByText(/Qua cổng/)).toBeNull(); // mở riêng lẻ thì không có nút Qua cổng
  fireEvent.click(screen.getByText(/Chơi lại/));
  expect(screen.queryByText(/Hoàn thành Vườn Hoa/)).toBeNull();
  expect(redCount()).toBe(0);
});

test('mở từ cổng thì không hiện bảng tổng kết riêng (popup bảng phép tính thay cho nó)', () => {
  act(() => useApp.setState({ gate: 'flower' }));
  render(<FlowerGame />);
  tap(QUESTIONS.length * 4);
  expect(screen.queryByText(/Hoàn thành Vườn Hoa/)).toBeNull();
});

test('mở từ cổng thì báo bảng phép tính: hiện kết quả câu đầu thì dòng 6 − 1 xong', () => {
  act(() => {
    useApp.setState({ gate: 'flower' });
    useTour.setState({ recap: null });
  });
  render(<FlowerGame />);
  expect(useTour.getState().recap?.columns[0].rows.map((r) => r.done)).toEqual([false, false, false, false, false]);
  tap(3);
  const rows = useTour.getState().recap!.columns[0].rows;
  expect(rows[0]).toMatchObject({ a: 6, b: 1, done: true });
  expect(rows.slice(1).every((r) => !r.done)).toBe(true);
});

test('mở riêng lẻ thì không báo bảng', () => {
  act(() => useTour.setState({ recap: null }));
  render(<FlowerGame />);
  expect(useTour.getState().recap).toBeNull();
});

test('bấm phím Next như PowerPoint (mũi tên phải, Page Down, cách, Enter) cũng hiện bước tiếp theo', () => {
  render(<FlowerGame />);
  fireEvent.keyDown(window, { key: 'ArrowRight' });
  expect(redCount()).toBe(1);
  fireEvent.keyDown(window, { key: 'PageDown' });
  expect(eq()).toBe('6 − 1 = ?');
  fireEvent.keyDown(window, { key: ' ' });
  expect(eq()).toBe('6 − 1 = 5');
  fireEvent.keyDown(window, { key: 'Enter' });
  expect(redCount()).toBe(0); // sang câu 6 − 2
  fireEvent.keyDown(window, { key: 'a' });
  expect(redCount()).toBe(0); // phím khác không làm gì
});
