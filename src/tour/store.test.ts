import { act } from '@testing-library/react';
import { useApp } from '../app/store';
import { enterGate, leaveGate, passGate } from './gateBridge';
import { initialTour } from './logic';
import { useTour } from './store';

beforeEach(() => {
  act(() => {
    useApp.setState({ screen: 'tour', gate: null });
    useTour.setState({ ...initialTour(), progress: 0, done: false });
  });
});

function reachGate1() {
  useTour.getState().advance();
  useTour.getState().arrive();
}

test('vào cổng thì mở đúng trò và nhớ cổng', () => {
  reachGate1();
  enterGate();
  expect(useApp.getState()).toMatchObject({ screen: 'finger', gate: 'ticket' });
  expect(useTour.getState().phase).toBe('playing');
});

test('qua cổng thì về đường đi và cổng đã qua', () => {
  reachGate1();
  enterGate();
  useTour.getState().setProgress(3);
  passGate();
  expect(useApp.getState()).toMatchObject({ screen: 'tour', gate: null });
  expect(useTour.getState()).toMatchObject({ at: 2, phase: 'moving', passed: ['ticket'] });
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
