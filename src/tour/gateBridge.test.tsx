import { act, fireEvent, render, screen } from '@testing-library/react';
import { useApp } from '../app/store';
import { PassGateButton, reportDone, reportProgress } from './gateBridge';
import { initialTour } from './logic';
import { useTour } from './store';

beforeEach(() => {
  act(() => {
    useApp.setState({ screen: 'flower', gate: null });
    useTour.setState({ ...initialTour(), progress: 0, done: false });
  });
});

test('mở riêng lẻ thì không có nút Qua cổng và không báo tiến độ', () => {
  render(<PassGateButton />);
  expect(screen.queryByText(/Qua cổng/)).toBeNull();
  reportProgress(2);
  reportDone();
  expect(useTour.getState()).toMatchObject({ progress: 0, done: false });
});

test('mở từ cổng thì có nút, bấm thì về đường đi', () => {
  act(() => {
    useTour.setState({ at: 2, phase: 'playing' });
    useApp.setState({ gate: 'flower' });
  });
  render(<PassGateButton />);
  reportProgress(2);
  reportDone();
  expect(useTour.getState()).toMatchObject({ progress: 2, done: true });
  fireEvent.click(screen.getByText(/Qua cổng/));
  expect(useApp.getState()).toMatchObject({ screen: 'tour', gate: null });
  expect(useTour.getState().passed).toEqual(['flower']);
});
