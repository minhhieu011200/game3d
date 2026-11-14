import { useApp } from '../../app/store';
import { useTour } from '../../tour/store';
import { countKind } from './logic';
import { ACTIONS, useZoo } from './store';

beforeEach(() => {
  useApp.setState({ gate: 'pond' });
  useTour.setState({ done: false, recapOpen: false });
  useZoo.getState().reset();
});

test('bấm Nhảy: 5 bạn ếch cùng lúc nhảy xuống hồ; bấm lần nữa không nhảy thêm', () => {
  useZoo.getState().act('frog');
  const c = countKind(useZoo.getState().objects, 'frog');
  expect(c.away).toBe(ACTIONS.frog.count);
  expect(c.stay).toBe(10 - ACTIONS.frog.count);
  useZoo.getState().act('frog');
  expect(countKind(useZoo.getState().objects, 'frog').away).toBe(ACTIONS.frog.count);
});

test('bấm Bay: 2 bạn cò cùng lúc bay lên trời', () => {
  useZoo.getState().act('stork');
  const c = countKind(useZoo.getState().objects, 'stork');
  expect(c.byZone.sky).toBe(2);
  expect(c.stay).toBe(8);
});

test('bấm Đáp án chỉ hiện đáp án của bến đó, không tính là qua cổng; đặt lại thì về như cũ', () => {
  useZoo.getState().act('frog');
  useZoo.getState().showAnswer('frog');
  expect(useZoo.getState().answered).toEqual({ frog: true, stork: false });
  expect(useTour.getState()).toMatchObject({ done: false, recapOpen: false });
  useZoo.getState().reset();
  expect(useZoo.getState()).toMatchObject({ acted: { frog: false, stork: false }, answered: { frog: false, stork: false } });
  expect(countKind(useZoo.getState().objects, 'frog').away).toBe(0);
});
