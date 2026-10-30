import { act, fireEvent, render, screen } from '@testing-library/react';
import { useApp } from '../app/store';
import { GateBanner } from './GateBanner';
import { initialTour, SQUARE } from './logic';
import { useTour } from './store';
import TourScreen from './TourScreen';

vi.mock('./TourScene', () => ({ TourScene: () => null }));
vi.mock('@react-three/fiber', () => ({ Canvas: () => null }));

beforeEach(() => {
  act(() => {
    useApp.setState({ screen: 'tour', gate: null, started: true });
    useTour.setState({ ...initialTour(), progress: 0, done: false });
  });
});

test('ở bến xe: Vẹt Xanh chào và có nút Đi tiếp', () => {
  render(<TourScreen />);
  expect(screen.getByText(/Mình là Vẹt Xanh/)).toBeTruthy();
  expect(screen.getByText(/học sinh lớp 1\/7/)).toBeTruthy();
  fireEvent.click(screen.getByText('Đi tiếp ▶'));
  expect(useTour.getState()).toMatchObject({ at: 1, phase: 'moving' });
  expect(screen.getByText(/Đang đi tới Trạm Soát Vé/)).toBeTruthy();
});

test('tới cổng 1: lời dẫn soát vé và nút Vào cổng', () => {
  act(() => useTour.setState({ at: 1, phase: 'atGate' }));
  render(<TourScreen />);
  expect(screen.getByText(/đưa bàn tay cho máy soát vé/)).toBeTruthy();
  expect(screen.queryByText('Đi tiếp ▶')).toBeNull();
  fireEvent.click(screen.getByText(/Vào cổng/));
  expect(useApp.getState()).toMatchObject({ screen: 'finger', gate: 'ticket' });
});

test('bản đồ nhảy tới Cổng 4 mà không đánh dấu các cổng trước', () => {
  render(<TourScreen />);
  fireEvent.click(screen.getByText(/Bản đồ/));
  fireEvent.click(screen.getByText('Bài 4: Hồ Ếch & Vòng Quay Ánh Nến'));
  expect(useTour.getState()).toMatchObject({ at: 4, phase: 'moving', passed: [] });
  act(() => useTour.getState().arrive());
  expect(screen.getByText(/Bạn nào đếm giỏi nhất/)).toBeTruthy();
});

test('bản đồ đánh dấu cổng đã qua', () => {
  act(() => useTour.setState({ passed: ['ticket', 'bunny'] }));
  render(<TourScreen />);
  fireEvent.click(screen.getByText(/Bản đồ/));
  const done = Array.from(document.querySelectorAll('.tour-map-item.done')).map((e) => e.textContent);
  expect(done).toHaveLength(2);
  expect(done[0]).toContain('Trạm Soát Vé');
  expect(done[1]).toContain('Đồng Cỏ Thỏ');
});

test('quảng trường: lời chúc mừng và hẹn gặp lại, không có bảng che, đi lại từ đầu', () => {
  act(() => useTour.setState({ at: SQUARE, phase: 'atGate', passed: ['ticket', 'flower', 'bunny', 'pond'] }));
  render(<TourScreen />);
  expect(screen.getByText(/Chúc mừng các bạn lớp 1\/7/)).toBeTruthy();
  expect(screen.getByText(/Hẹn gặp lại/)).toBeTruthy();
  expect(document.querySelector('.tour-square')).toBeNull(); // không còn bảng che giữa màn hình
  fireEvent.click(screen.getByText(/Đi lại từ đầu/));
  expect(useTour.getState()).toMatchObject({ at: 0, phase: 'idle', passed: [] });
});

test('dải Cổng 1 có 3 trong 8 đèn sáng khi đã đúng 3 câu', () => {
  act(() => useTour.setState({ progress: 3 }));
  render(<GateBanner gate="ticket" />);
  expect(document.querySelectorAll('.gate-light')).toHaveLength(8);
  expect(document.querySelectorAll('.gate-light.on')).toHaveLength(3);
  expect(screen.getByText('Cổng 1')).toBeTruthy();
});

test('dải các cổng khác không có đèn soát vé', () => {
  render(<GateBanner gate="flower" />);
  expect(document.querySelectorAll('.gate-light')).toHaveLength(0);
  expect(screen.getByText(/Vườn Hoa Bướm Xinh/)).toBeTruthy();
});
