import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { BunnyBoard, spot } from './BunnyBoard';
import { Hud } from './BunnyGame';
import type { Level, Mode } from './levels';
import { initialRace, type RaceState } from './logic';
import { useBunny } from './store';

vi.mock('../../audio/AudioManager', () => ({ audio: { say: vi.fn(), stop: vi.fn() }, sfx: vi.fn() }));

// Mỗi làn 3 ô, mục tiêu 4. Làn Đỏ: 5−1 (đúng), 6−3 (sai), 8−4 (đúng). Làn Xanh: 7−3, 9−5 (đúng), 9−6 (sai).
const RED: Level = { target: 4, tiles: [{ id: 't0', a: 5, b: 1 }, { id: 't1', a: 6, b: 3 }, { id: 't2', a: 8, b: 4 }] };
const BLUE: Level = { target: 4, tiles: [{ id: 't0', a: 7, b: 3 }, { id: 't1', a: 9, b: 5 }, { id: 't2', a: 9, b: 6 }] };

function setup(mode: Mode, patch: (s: RaceState) => Partial<RaceState> = () => ({})) {
  const levels = mode === 'teams' ? [RED, BLUE] : [RED];
  const base = initialRace(levels, mode);
  act(() => useBunny.setState({ ...base, ...patch(base), levels, targets: [4, 4], startedAt: 0, times: levels.map(() => null) }));
  return render(
    <>
      <BunnyBoard />
      <Hud />
    </>,
  );
}

const lanes = () => screen.getAllByTestId('lane');

describe('vị trí', () => {
  test('hai đội: Đỏ ở nửa trái đi sang phải, Xanh ở nửa phải đi sang trái, cà rốt ở giữa', () => {
    const n = 7;
    const red = [-1, 0, 3, 6, 7].map((p) => spot('teams', 0, p, n).x);
    const blue = [-1, 0, 3, 6, 7].map((p) => spot('teams', 1, p, n).x);
    expect(red).toEqual([...red].sort((a, b) => a - b));
    expect(blue).toEqual([...blue].sort((a, b) => b - a));
    expect(Math.max(...red)).toBeLessThan(50);
    expect(Math.min(...blue)).toBeGreaterThan(50);
    // hai thỏ cùng đứng ngang hàng ở vạch xuất phát
    expect(spot('teams', 0, -1, n).y).toBe(spot('teams', 1, -1, n).y);
  });
});

describe('bố cục', () => {
  test('chơi một mình: một làn, đủ ô', () => {
    setup('solo');
    expect(lanes()).toHaveLength(1);
    expect(within(lanes()[0]).getAllByTestId('paw')).toHaveLength(3);
    expect(screen.getByText(/Cà rốt: 0\/2/)).toBeTruthy();
  });

  test('hai đội: hai làn có tên đội, mỗi làn bảng cà rốt riêng', () => {
    setup('teams');
    expect(lanes()).toHaveLength(2);
    expect(within(lanes()[0]).getByText('Đội Đỏ')).toBeTruthy();
    expect(within(lanes()[1]).getByText('Đội Xanh')).toBeTruthy();
    expect(within(lanes()[0]).getByText(/🥕 0\/2/)).toBeTruthy();
    expect(within(lanes()[1]).getByText(/🥕 0\/2/)).toBeTruthy();
  });

  test('thỏ trắng, hai đội chỉ khác màu mũ', () => {
    setup('teams');
    const [red, blue] = lanes().map((l) => l.querySelector('svg.rabbit2d')!);
    const strip = (svg: Element) => svg.innerHTML.replace(/#e8414f|#b52b38|#2f80ed|#1f5fbf/g, 'HAT');
    expect(strip(red)).toBe(strip(blue));
    expect(red.innerHTML).toContain('#e8414f');
    expect(blue.innerHTML).toContain('#2f80ed');
  });

  test('cà rốt chỉ có ở hàng rào, không cắm dọc đường', () => {
    const { container } = setup('teams');
    const carrots = container.querySelectorAll('img[src*="carrot"]');
    expect(carrots.length).toBeGreaterThan(0);
    const garden = screen.getByTestId('garden');
    carrots.forEach((c) => expect(garden.contains(c)).toBe(true));
  });
});

describe('trạng thái ô', () => {
  test('ô kế tiếp hỏi "Bằng 4?"; ô đã qua hiện kết quả', () => {
    setup('solo', (s) => ({ lanes: [{ ...s.lanes[0], pos: 1, marks: ['correct', 'skipped', 'unknown'], carrots: 1 }] }));
    const paws = within(lanes()[0]).getAllByTestId('paw');
    expect(paws[0].className).toMatch(/correct/);
    expect(paws[0].textContent).toMatch(/5 − 1 = 4/);
    expect(paws[1].className).toMatch(/skipped/);
    expect(paws[1].textContent).toMatch(/6 − 3 = 3/);
    expect(paws[2].className).toMatch(/next/);
    expect(within(paws[2]).getByText(/Bằng/)).toBeTruthy();
    expect(paws[2].textContent).not.toMatch(/=/);
  });

  test('ô vừa nhầm thì rung đỏ', () => {
    setup('solo', (s) => ({ lanes: [{ ...s.lanes[0], wrongId: 't1' }] }));
    const body = within(lanes()[0]).getAllByTestId('paw')[1].querySelector('.paw-body')!;
    expect(body.className).toMatch(/wrong/);
    expect(body.className).toMatch(/shake/);
  });
});

describe('nút Đúng / Sai', () => {
  test('hai đội cùng có nút ngay từ đầu, mỗi đội ở ô kế tiếp của mình', () => {
    setup('teams');
    for (const lane of lanes()) {
      expect(within(lane).getAllByText(/Đúng/)).toHaveLength(1);
      expect(within(within(lane).getAllByTestId('paw')[0]).getByText(/Sai/)).toBeTruthy();
    }
  });

  test('bấm Đúng ở làn Đỏ rồi Đúng ở làn Xanh: cả hai thỏ lên ô đầu', () => {
    setup('teams');
    fireEvent.click(within(lanes()[0]).getByText(/Đúng/));
    fireEvent.click(within(lanes()[1]).getByText(/Đúng/));
    expect(useBunny.getState().lanes.map((l) => l.pos)).toEqual([0, 0]);
  });

  test('bấm Sai ở ô bằng mục tiêu: thỏ về vạch xuất phát', () => {
    setup('solo');
    fireEvent.click(screen.getByText(/Sai/));
    const lane = useBunny.getState().lanes[0];
    expect(lane.mistakes).toBe(1);
    expect(lane.pos).toBe(-1);
    expect(lane.phase).toBe('idle');
  });

  test('thỏ đang nhảy thì làn đó không có nút, làn kia vẫn có', () => {
    // hoạt ảnh chưa xong: thỏ còn trên không
    const animate = vi.fn(() => ({ onfinish: null, cancel: vi.fn() }));
    Object.assign(HTMLElement.prototype, { animate, getAnimations: () => [] });
    try {
      setup('teams');
      fireEvent.click(within(lanes()[0]).getByText(/Đúng/));
      expect(animate).toHaveBeenCalled();
      expect(useBunny.getState().lanes[0].phase).toBe('hopping');
      expect(within(lanes()[0]).queryByText(/Đúng/)).toBeNull();
      expect(within(lanes()[1]).getByText(/Đúng/)).toBeTruthy();
    } finally {
      delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
      delete (HTMLElement.prototype as Partial<HTMLElement>).getAnimations;
    }
  });
});

describe('màn kết thúc', () => {
  test('một mình: số cà rốt, số lần nhầm, thời gian và nút chơi màn mới', () => {
    setup('solo', (s) => ({ winner: 0, lanes: [{ ...s.lanes[0], pos: 3, carrots: 2, mistakes: 1, phase: 'arrived' }] }));
    act(() => useBunny.setState({ times: [65000] }));
    expect(screen.getByText(/Thời gian: 1:05/)).toBeTruthy();
    expect(screen.getByText(/Nhặt được 2 củ cà rốt/)).toBeTruthy();
    expect(screen.getByText(/nhầm 1 lần/)).toBeTruthy();
    fireEvent.click(screen.getByText(/Chơi màn mới/));
    expect(useBunny.getState().winner).toBeNull();
    expect(useBunny.getState().mode).toBe('solo');
  });

  test('hai đội: một đội về trước thì chưa hiện màn kết thúc, đội kia vẫn có nút', () => {
    setup('teams', (s) => ({ winner: 1, lanes: [s.lanes[0], { ...s.lanes[1], pos: 3, phase: 'arrived' }] }));
    act(() => useBunny.setState({ times: [null, 42000] }));
    expect(screen.queryByText(/thắng!/)).toBeNull();
    expect(lanes()[1].querySelector('.b2-team-name')!.textContent).toMatch(/🥇\s*Đội Xanh/);
    expect(within(lanes()[1]).getByTestId('clock').textContent).toMatch(/0:42/);
    expect(within(lanes()[0]).getByText(/Đúng/)).toBeTruthy();
  });

  test('hai đội về hết: ghi đội thắng và thời gian từng đội', () => {
    setup('teams', (s) => ({ winner: 1, lanes: s.lanes.map((l) => ({ ...l, pos: 3, phase: 'arrived' as const })) }));
    act(() => useBunny.setState({ times: [75000, 42000] }));
    expect(screen.getByText(/Đội Xanh thắng!/)).toBeTruthy();
    const rows = document.querySelectorAll('.b2-results tr');
    expect(rows[0].textContent).toMatch(/Đội Xanh.*0:42/);
    expect(rows[1].textContent).toMatch(/Đội Đỏ.*1:15/);
  });

  test('mỗi đội có nút chọn số riêng', () => {
    setup('teams');
    fireEvent.click(within(lanes()[1]).getByRole('button', { name: '7' }));
    const s = useBunny.getState();
    expect(s.targets).toEqual([4, 7]);
    expect(s.levels.map((lv) => lv.target)).toEqual([4, 7]);
    expect(screen.getByText(/Đội Xanh tìm bằng/).textContent).toMatch(/7/);
  });
});

describe('chọn chế độ', () => {
  test('bấm "2 đội" thì có hai làn, bấm "1 người" thì về một làn', () => {
    setup('solo');
    fireEvent.click(screen.getByText(/2 đội/));
    expect(lanes()).toHaveLength(2);
    fireEvent.click(screen.getByText(/1 người/));
    expect(lanes()).toHaveLength(1);
  });
});
