import {
  advance,
  arrive,
  canAdvance,
  cameraT,
  current,
  enter,
  initialTour,
  isGate,
  jumpTo,
  leave,
  pass,
  reset,
  SQUARE,
  STATIONS,
} from './logic';

test('thứ tự và tên cổng theo câu chuyện', () => {
  const gates = STATIONS.filter(isGate).map((s) => [s.title, s.lesson, s.screen]);
  expect(gates).toEqual([
    ['Trạm Soát Vé Bàn Tay Thần Kỳ', 3, 'finger'],
    ['Vườn Hoa Bướm Xinh', 1, 'flower'],
    ['Đồng Cỏ Thỏ Nhảy Cà Rốt', 2, 'bunny'],
    ['Hồ Ếch & Vòng Quay Ánh Nến', 4, 'zoo'],
  ]);
  expect(STATIONS[0].id).toBe('start');
  expect(STATIONS[SQUARE].title).toBe('Quảng Trường Huy Hiệu');
  // các trạm nằm theo thứ tự trên đường
  STATIONS.slice(1).forEach((s, i) => expect(s.t).toBeGreaterThan(STATIONS[i].t));
});

test('đi tới cổng 1, vào chơi rồi qua cổng', () => {
  let s = initialTour();
  expect(canAdvance(s)).toBe(true);
  s = advance(s);
  expect(s).toMatchObject({ at: 1, phase: 'moving' });
  s = arrive(s);
  expect(s.phase).toBe('atGate');
  expect(canAdvance(s)).toBe(false); // chưa qua cổng thì không đi tiếp được
  s = enter(s);
  expect(s.phase).toBe('playing');
  s = pass(s);
  // qua cổng thì đi luôn tới trước cổng 2, không phải bấm "Đi tiếp"
  expect(s).toMatchObject({ at: 2, phase: 'moving', passed: ['ticket'] });
  expect(cameraT(s)).toBeGreaterThan(STATIONS[1].t);
  expect(cameraT(s)).toBeLessThan(current(s).t);
  s = arrive(s);
  expect(current(s).id).toBe('flower');
});

test('rời trò chơi giữa chừng thì không đánh dấu đã qua', () => {
  let s = enter(arrive(advance(initialTour())));
  s = leave(s);
  expect(s).toMatchObject({ at: 1, phase: 'atGate', passed: [] });
  expect(cameraT(s)).toBeLessThan(current(s).t);
});

test('qua cổng ngay khi đứng trước cổng (giáo viên cho qua)', () => {
  const s = pass(arrive(advance(initialTour())));
  expect(s.passed).toEqual(['ticket']);
});

test('bản đồ nhảy tới cổng 4 không đánh dấu các cổng trước', () => {
  let s = jumpTo(initialTour(), 4);
  expect(s).toMatchObject({ at: 4, phase: 'moving', passed: [] });
  s = arrive(s);
  expect(current(s).id).toBe('pond');
  expect(jumpTo(s, 0)).toBe(s); // không về bến xe bằng bản đồ
});

test('đi hết 4 cổng thì tới quảng trường, và đi lại từ đầu', () => {
  let s = initialTour();
  s = arrive(advance(s));
  for (let i = 0; i < 4; i++) s = arrive(pass(enter(s)));
  expect(s.passed).toEqual(['ticket', 'flower', 'bunny', 'pond']);
  // qua cổng 4 là tới thẳng quảng trường
  expect(s.at).toBe(SQUARE);
  expect(canAdvance(s)).toBe(false);
  expect(enter(s)).toBe(s);
  expect(reset()).toEqual(initialTour());
});

test('cổng đã qua thì đi tiếp được ngay khi đứng trước nó', () => {
  let s = initialTour();
  s = pass(enter(arrive(advance(s))));
  s = arrive(jumpTo(s, 1));
  expect(canAdvance(s)).toBe(true);
  expect(pass(s).passed).toEqual(['ticket']); // không lặp
});
