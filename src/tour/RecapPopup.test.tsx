import { act, fireEvent, render, screen } from '@testing-library/react';
import { useApp } from '../app/store';
import { GateBanner } from './GateBanner';
import { reportDone, reportRecap } from './gateBridge';
import { initialTour } from './logic';
import { RecapPopup } from './RecapPopup';
import { useTour } from './store';

/** Bài 3 hiện bảng hàng dọc: đọc từng cột thành ["9−1=8", đã làm?]. */
const rowTexts = () => {
  const [as, bs, res] = Array.from(document.querySelectorAll('.rp-vt tr')).map((tr) => Array.from(tr.querySelectorAll('td')));
  return res.map((td, i) => [`${as[i].textContent}−${bs[i].textContent}=${td.textContent}`, td.classList.contains('done')]);
};

beforeEach(() => {
  act(() => {
    useApp.setState({ screen: 'finger', gate: 'ticket' });
    useTour.setState({ ...initialTour(), at: 3, phase: 'playing', progress: 0, done: false, recap: null, recapOpen: false });
  });
});

function show() {
  return render(
    <>
      <GateBanner gate="ticket" />
      <RecapPopup gate="ticket" />
    </>,
  );
}

test('đang chơi thì chưa có popup', () => {
  show();
  expect(screen.queryByRole('dialog')).toBeNull();
});

test('chơi xong thì popup tự hiện bảng hàng dọc như SGK với đủ phép tính đã làm', () => {
  show();
  act(() => {
    reportRecap({ columns: [{ rows: [1, 2, 3, 4, 5, 6, 7, 8].map((b) => ({ a: 9, b, done: true })) }] });
    reportDone();
  });
  expect(screen.getByText(/Cùng đọc lại các phép tính/)).toBeTruthy();
  expect(screen.getByText(/Cổng 3 · Trạm Soát Vé/)).toBeTruthy();
  expect(rowTexts()[0]).toEqual(['9−1=8', true]);
  expect(rowTexts()).toHaveLength(8);
});

test('bấm Qua cổng ở dải cổng khi mới làm 2 câu: popup có ✔ và "?"; Chơi tiếp thì đóng lại', () => {
  show();
  act(() => reportRecap({ columns: [{ rows: [1, 2, 3, 4, 5, 6, 7, 8].map((b) => ({ a: 9, b, done: b <= 2 })) }] }));
  fireEvent.click(screen.getByText(/Qua cổng/));
  expect(rowTexts().slice(0, 3)).toEqual([
    ['9−1=8', true],
    ['9−2=7', true],
    ['9−3=?', false],
  ]);
  expect(useTour.getState().phase).toBe('playing'); // chưa qua cổng
  fireEvent.click(screen.getByText(/Chơi tiếp/));
  expect(screen.queryByRole('dialog')).toBeNull();
});

test('Qua cổng trong popup thì về đường đi, đi luôn tới cổng sau', () => {
  show();
  act(() => useTour.getState().setRecapOpen(true));
  fireEvent.click(screen.getAllByText(/Qua cổng/)[1]);
  expect(useApp.getState()).toMatchObject({ screen: 'tour', gate: null });
  expect(useTour.getState()).toMatchObject({ at: 4, phase: 'moving', passed: ['ticket'], recapOpen: false });
});

test('chưa có dữ liệu thì popup dùng bảng mặc định toàn "?"', () => {
  show();
  act(() => useTour.getState().setRecapOpen(true));
  expect(rowTexts().every(([, done]) => !done)).toBe(true);
  expect(rowTexts()).toHaveLength(8);
});

test('bấm vào phép "?" thì hiện đáp án đúng, phép khác vẫn "?"', () => {
  show();
  act(() => useTour.getState().setRecapOpen(true));
  fireEvent.click(screen.getByLabelText('Xem đáp án 9 trừ 3'));
  const r = rowTexts();
  expect(r[2][0]).toBe('9−3=6');
  expect(document.querySelectorAll('.rp-vt td.revealed')).toHaveLength(1);
  expect(r[3][0]).toBe('9−4=?');
});

test('Bài 1: popup hiện dòng hoa như bảng Hoàn thành Vườn Hoa, bấm "?" thì hiện đáp án', () => {
  act(() => {
    useApp.setState({ screen: 'flower', gate: 'flower' });
    useTour.setState({ at: 1, recapOpen: true, recap: { columns: [{ rows: [1, 2, 3, 4, 5].map((b) => ({ a: 6, b, done: b <= 2 })) }] } });
  });
  render(<RecapPopup gate="flower" />);
  const lines = Array.from(document.querySelectorAll('.rp-flower .b1-line'));
  expect(lines).toHaveLength(5);
  expect(lines[1].querySelectorAll('.b1-flower-svg')).toHaveLength(6);
  expect(lines.map((l) => l.querySelector('.b1-line-eq')!.textContent)).toEqual(['6 − 1 = 5', '6 − 2 = 4', '6 − 3 = ?', '6 − 4 = ?', '6 − 5 = ?']);
  fireEvent.click(screen.getByLabelText('Xem đáp án 6 trừ 3'));
  expect(lines[2].querySelector('.b1-line-eq')!.textContent).toBe('6 − 3 = 3');
});

test('Bài 2: ô bằng mục tiêu có 🥕, ô khác mục tiêu có ✘ (không phải ✔)', () => {
  act(() => {
    useApp.setState({ screen: 'bunny', gate: 'bunny' });
    useTour.setState({
      at: 2,
      recapOpen: true,
      recap: { columns: [{ target: 4, rows: [{ a: 5, b: 1, done: true, highlight: true }, { a: 9, b: 6, done: true, highlight: false }, { a: 8, b: 4, done: false, highlight: false }] }] },
    });
  });
  render(<RecapPopup gate="bunny" />);
  const marks = Array.from(document.querySelectorAll('.rp-row')).map((e) => e.querySelector('.rp-mark')!.textContent);
  expect(marks).toEqual(['🥕', '✘', '']);
  expect(document.body.textContent).not.toContain('✔');
});
