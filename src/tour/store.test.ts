import { act } from '@testing-library/react';
import { useApp } from '../app/store';
import { enterGate, leaveGate, passGate, reportRecap } from './gateBridge';
import { initialTour } from './logic';
import { useTour } from './store';

beforeEach(() => {
  act(() => {
    useApp.setState({ screen: 'tour', gate: null });
    useTour.setState({ ...initialTour(), progress: 0, done: false, recap: null, recapOpen: false, recaps: {} });
  });
});

function reachGate1() {
  useTour.getState().advance();
  useTour.getState().arrive();
}

test('vào cổng thì mở đúng trò và nhớ cổng', () => {
  reachGate1();
  enterGate();
  expect(useApp.getState()).toMatchObject({ screen: 'flower', gate: 'flower' });
  expect(useTour.getState().phase).toBe('playing');
});

test('qua cổng thì về đường đi và cổng đã qua', () => {
  reachGate1();
  enterGate();
  useTour.getState().setProgress(3);
  passGate();
  expect(useApp.getState()).toMatchObject({ screen: 'tour', gate: null });
  expect(useTour.getState()).toMatchObject({ at: 2, phase: 'moving', passed: ['flower'] });
});

test('về đường đi giữa chừng thì cổng chưa qua', () => {
  reachGate1();
  enterGate();
  leaveGate();
  expect(useApp.getState()).toMatchObject({ screen: 'tour', gate: null });
  expect(useTour.getState()).toMatchObject({ phase: 'atGate', passed: [] });
});

test('go() xóa cổng đang mở', () => {
  act(() => useApp.getState().openGate('flower', 'flower'));
  act(() => useApp.getState().go('about'));
  expect(useApp.getState().gate).toBeNull();
});

const RECAP = { columns: [{ rows: [{ a: 9, b: 1, done: true }] }] };

test('mở riêng lẻ (không từ cổng) thì reportRecap không ghi gì', () => {
  reportRecap(RECAP);
  expect(useTour.getState().recap).toBeNull();
});

test('trò chơi báo bảng khi chơi từ cổng; vào cổng lần sau thì bảng cũ bị xoá', () => {
  reachGate1();
  enterGate();
  reportRecap(RECAP);
  expect(useTour.getState().recap).toEqual(RECAP);
  passGate();
  act(() => useTour.getState().jumpTo(1));
  useTour.getState().arrive();
  enterGate();
  expect(useTour.getState().recap).toBeNull();
});

test('qua cổng thì lưu bảng phép tính của cổng đó (cho Quảng Trường); đi lại từ đầu thì xoá', () => {
  reachGate1();
  enterGate();
  reportRecap(RECAP);
  passGate();
  expect(useTour.getState().recaps).toEqual({ flower: RECAP });
  act(() => useTour.getState().reset());
  expect(useTour.getState().recaps).toEqual({});
});
