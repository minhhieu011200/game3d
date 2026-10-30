import { act, fireEvent, render, screen } from '@testing-library/react';
import { initialTour } from '../tour/logic';
import { useTour } from '../tour/store';
import { App } from './App';
import { useApp } from './store';

vi.mock('../tour/TourScene', () => ({ TourScene: () => null }));
vi.mock('@react-three/fiber', () => ({ Canvas: () => <div>canh-3d</div> }));
vi.mock('../games/flower/FlowerGame', () => ({ default: () => <div>man-choi-bai-1</div> }));
vi.mock('../games/bunny/BunnyGame', () => ({ default: () => <div>man-choi-bai-2</div> }));
vi.mock('../games/finger/FingerGame', () => ({ default: () => <div>man-choi-bai-3</div> }));
vi.mock('../games/zoo/ZooGame', () => ({ default: () => <div>man-choi-bai-4</div> }));

beforeEach(() => {
  act(() => {
    useApp.setState({ screen: 'home', gate: null, started: false });
    useTour.setState({ ...initialTour(), progress: 0, done: false });
  });
});

test('bấm Bắt đầu thì vào màn đường đi, không còn 3 thẻ bài', async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Bắt đầu/));
  expect(await screen.findByText('Đi tiếp ▶')).toBeTruthy();
  expect(screen.queryByText('Bài 2: Thỏ nhảy tìm cà rốt')).toBeNull();
});

test.each([
  ['Bài 1: Vườn Hoa Bướm Xinh', 'man-choi-bai-1', 'Cổng 2'],
  ['Bài 2: Đồng Cỏ Thỏ Nhảy Cà Rốt', 'man-choi-bai-2', 'Cổng 3'],
  ['Bài 3: Trạm Soát Vé Bàn Tay Thần Kỳ', 'man-choi-bai-3', 'Cổng 1'],
  ['Bài 4: Hồ Ếch & Vòng Quay Ánh Nến', 'man-choi-bai-4', 'Cổng 4'],
])('Bản đồ → "%s" → Vào cổng, rồi về đường đi', async (item, marker, gateNo) => {
  act(() => useApp.setState({ screen: 'tour', started: true }));
  render(<App />);
  fireEvent.click(await screen.findByText(/Bản đồ/));
  fireEvent.click(screen.getByText(item));
  act(() => useTour.getState().arrive()); // camera tới cổng (cảnh 3D được thay bằng giả)
  fireEvent.click(screen.getByText(/Vào cổng/));
  expect(await screen.findByText(marker)).toBeTruthy();
  expect(screen.getByText(gateNo)).toBeTruthy(); // dải cổng
  fireEvent.click(screen.getByText(/Về đường đi/));
  expect(screen.queryByText(marker)).toBeNull();
  expect(await screen.findByText(/Vào cổng/)).toBeTruthy(); // vẫn đứng trước cổng, chưa qua
  expect(useTour.getState().passed).toEqual([]);
});
