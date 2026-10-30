// Luật của chuyến tham quan "Vườn Thú Số Vui": các trạm trên đường đi, cổng nào đã qua, đang làm gì.
// Hàm thuần, không đụng tới cảnh 3D hay âm thanh.

/** Tên lớp ghi trên cổng chào. */
export const CLASS_NAME = '1/7';

export type GateId = 'ticket' | 'flower' | 'bunny' | 'pond';
export type GameScreen = 'finger' | 'flower' | 'bunny' | 'zoo';

export interface Station {
  id: GateId | 'start' | 'square';
  title: string;
  /** Số bài trong SGK (trang 72–73); trạm không phải cổng thì `null`. */
  lesson: number | null;
  /** Trò chơi mở ra khi vào cổng. */
  screen: GameScreen | null;
  /** Lời Vẹt Xanh nói khi tới trạm (cũng là khóa giọng đọc). */
  voiceKey: string;
  speech: string;
  /** Vị trí trên đường đi, 0 … 1. */
  t: number;
  color: string;
  emoji: string;
}

export const STATIONS: readonly Station[] = [
  {
    id: 'start',
    title: 'Bến xe buýt',
    lesson: null,
    screen: null,
    voiceKey: 'tour.welcome',
    speech: `Chào mừng thầy cô và các em học sinh lớp ${CLASS_NAME} đến Khu vui chơi sở thú! Mình là Vẹt Xanh, hướng dẫn viên. Cùng mình đi tham quan nhé!`,
    t: 0.02,
    color: '#ff9f43',
    emoji: '🚌',
  },
  {
    id: 'ticket',
    title: 'Trạm Soát Vé Bàn Tay Thần Kỳ',
    lesson: 3,
    screen: 'finger',
    voiceKey: 'tour.gate.1',
    speech: 'Muốn vào vườn thú, các bạn phải đưa bàn tay cho máy soát vé kiểm tra! Giơ đúng số ngón tay thì đèn sẽ sáng.',
    t: 0.245,
    color: '#2ecc71',
    emoji: '✋',
  },
  {
    id: 'flower',
    title: 'Vườn Hoa Bướm Xinh',
    lesson: 1,
    screen: 'flower',
    voiceKey: 'tour.gate.2',
    speech: 'Khu vườn có sáu bông hoa vàng. Đàn bướm đói đang bay tới hút mật! Các bạn đếm xem còn lại mấy bông nhé.',
    t: 0.4,
    color: '#f5b700',
    emoji: '🌼',
  },
  {
    id: 'bunny',
    title: 'Đồng Cỏ Thỏ Nhảy Cà Rốt',
    lesson: 2,
    screen: 'bunny',
    voiceKey: 'tour.gate.3',
    speech: 'Bạn Thỏ bị lạc rồi! Hãy tìm những phép trừ có kết quả bằng bốn để giúp Thỏ về tới vườn cà rốt.',
    t: 0.6,
    color: '#ff7f2a',
    emoji: '🐰',
  },
  {
    id: 'pond',
    title: 'Hồ Ếch & Vòng Quay Ánh Nến',
    lesson: 4,
    screen: 'zoo',
    voiceKey: 'tour.gate.4',
    speech: 'Khu cuối cùng có hồ ếch, đàn cò và vòng quay ánh nến. Bạn nào đếm giỏi nhất nào?',
    t: 0.8,
    color: '#3498db',
    emoji: '🐸',
  },
  {
    id: 'square',
    title: 'Quảng Trường Huy Hiệu',
    lesson: null,
    screen: null,
    voiceKey: 'tour.square',
    speech: `Hoan hô! Chúc mừng các bạn lớp ${CLASS_NAME} đã đi hết vườn thú và nhận huy chương Nhà thám hiểm Phép Trừ nhí. Hẹn gặp lại các bạn nhé!`,
    t: 0.97,
    color: '#9b59b6',
    emoji: '🏅',
  },
];

export const GATE_IDS: readonly GateId[] = ['ticket', 'flower', 'bunny', 'pond'];
export const SQUARE = STATIONS.length - 1;

export function isGate(st: Station): st is Station & { id: GateId; screen: GameScreen; lesson: number } {
  return (GATE_IDS as readonly string[]).includes(st.id);
}

/** Số thứ tự cổng (1 … 4) để ghi "Cổng N". */
export function gateNumber(id: GateId) {
  return GATE_IDS.indexOf(id) + 1;
}

export function stationOf(id: GateId) {
  return STATIONS.findIndex((s) => s.id === id);
}

/**
 * - `idle`: đứng yên, chờ "Đi tiếp" (ở bến xe, hoặc vừa qua một cổng).
 * - `moving`: camera đang bay tới trạm `at`.
 * - `atGate`: đã tới trạm `at`, Vẹt Xanh đọc lời dẫn.
 * - `playing`: đang chơi trò của cổng `at`.
 */
export type Phase = 'idle' | 'moving' | 'atGate' | 'playing';

export interface TourState {
  at: number;
  phase: Phase;
  passed: GateId[];
}

export function initialTour(): TourState {
  return { at: 0, phase: 'idle', passed: [] };
}

export function current(s: TourState) {
  return STATIONS[s.at];
}

export function isPassed(s: TourState, id: string) {
  return (s.passed as string[]).includes(id);
}

/** Nút "Đi tiếp" có dùng được không: lúc đứng chờ, hoặc đứng trước một cổng đã qua. */
export function canAdvance(s: TourState) {
  if (s.at >= SQUARE) return false;
  return s.phase === 'idle' || (s.phase === 'atGate' && isPassed(s, current(s).id));
}

export function advance(s: TourState): TourState {
  if (!canAdvance(s)) return s;
  return { ...s, at: s.at + 1, phase: 'moving' };
}

/** Camera đã tới trạm. */
export function arrive(s: TourState): TourState {
  return s.phase === 'moving' ? { ...s, phase: 'atGate' } : s;
}

export function enter(s: TourState): TourState {
  return s.phase === 'atGate' && isGate(current(s)) ? { ...s, phase: 'playing' } : s;
}

/**
 * Qua cổng (chơi xong hoặc giáo viên cho qua): đánh dấu đã qua, rồi cả nhóm đi luôn qua cổng
 * tới đứng trước cổng kế tiếp (sau cổng cuối là quảng trường).
 */
export function pass(s: TourState): TourState {
  const st = current(s);
  if (!isGate(st) || (s.phase !== 'playing' && s.phase !== 'atGate')) return s;
  const passed = isPassed(s, st.id) ? s.passed : [...s.passed, st.id];
  return { ...s, passed, at: Math.min(s.at + 1, SQUARE), phase: 'moving' };
}

/** Rời trò chơi giữa chừng: về đứng trước cổng, không đánh dấu đã qua. */
export function leave(s: TourState): TourState {
  return s.phase === 'playing' ? { ...s, phase: 'atGate' } : s;
}

/** Bản đồ: bay thẳng tới một trạm bất kỳ (cổng hoặc quảng trường). */
export function jumpTo(s: TourState, at: number): TourState {
  if (at < 1 || at >= STATIONS.length) return s;
  return { ...s, at, phase: 'moving' };
}

export function reset(): TourState {
  return initialTour();
}

/**
 * Vị trí camera trên đường (0 … 1): đứng trước trạm, hoặc đã đi qua cổng một đoạn ngắn.
 */
/** Nhóm cô trò dừng trước cổng / quảng trường một đoạn (theo tham số đường). */
export const STOP_BEFORE_GATE = 0.045;
export const STOP_BEFORE_SQUARE = 0.08;

export function cameraT(s: TourState) {
  const st = current(s);
  if (st.id === 'start') return st.t;
  if (isGate(st) && s.phase === 'idle' && isPassed(s, st.id)) return st.t + 0.04;
  // vị trí nhóm cô trò (camera đứng sau lưng): trước cổng vài bước; quảng trường rộng thì đứng xa hơn
  return st.t - (st.id === 'square' ? STOP_BEFORE_SQUARE : STOP_BEFORE_GATE);
}
