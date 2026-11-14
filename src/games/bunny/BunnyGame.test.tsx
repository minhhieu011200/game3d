import { act, render, screen } from '@testing-library/react';
import { useApp } from '../../app/store';
import { useTour } from '../../tour/store';
import BunnyGame from './BunnyGame';
import { useBunny } from './store';

beforeEach(() => {
  act(() => {
    useApp.setState({ screen: 'bunny', gate: 'bunny' });
    useTour.setState({ recap: null });
  });
});

test('mở từ cổng thì báo bảng 7 ô của làn, cùng số mục tiêu', () => {
  render(<BunnyGame />);
  const col = useTour.getState().recap!.columns;
  expect(col).toHaveLength(1);
  expect(col[0].rows).toHaveLength(7);
  expect(col[0].target).toBe(useBunny.getState().levels[0].target);
  expect(col[0].rows.every((r) => !r.done)).toBe(true);
});

test('trả lời đúng ô đầu thì bảng cập nhật; chuyển sang 2 đội thì có 2 cột', () => {
  render(<BunnyGame />);
  act(() => useBunny.getState().answer(0, true)); // ô đầu luôn bằng mục tiêu
  expect(useTour.getState().recap!.columns[0].rows[0]).toMatchObject({ done: true, highlight: true });
  act(() => useBunny.getState().setMode('teams'));
  expect(useTour.getState().recap!.columns.map((c) => c.title)).toEqual(['Đội Đỏ', 'Đội Xanh']);
});

test('chơi từ cổng thì không hiện bảng kết thúc riêng (popup bảng phép tính thay cho nó)', () => {
  render(<BunnyGame />);
  act(() => {
    const s = useBunny.getState();
    useBunny.setState({ winner: 0, lanes: s.lanes.map((l) => ({ ...l, phase: 'arrived' as const })) });
  });
  expect(screen.queryByText(/Hoan hô/)).toBeNull();
});
