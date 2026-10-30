import { AudioManager, type AudioLike } from './AudioManager';

class FakeAudio implements AudioLike {
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  playing = false;
  constructor(public src: string) {}
  play() {
    this.playing = true;
  }
  pause() {
    this.playing = false;
  }
  end() {
    this.playing = false;
    this.onended?.();
  }
}

function setup() {
  const log: FakeAudio[] = [];
  const m = new AudioManager((src) => {
    const a = new FakeAudio(src);
    log.push(a);
    return a;
  });
  const playing = () => log.filter((a) => a.playing);
  return { m, log, playing };
}

test('đọc lần lượt, không bao giờ chồng hai câu', () => {
  const { m, log, playing } = setup();
  m.say(['praise.1', 'n.4']);
  m.say('retry.1');
  expect(playing()).toHaveLength(1);
  expect(log[0].src).toContain('praise.1.mp3');
  log[0].end();
  expect(playing()).toHaveLength(1);
  expect(log[1].src).toContain('n.4.mp3');
  log[1].end();
  expect(log[2].src).toContain('retry.1.mp3');
  log[2].end();
  expect(m.isSpeaking()).toBe(false);
});

test('interrupt bỏ câu đang đọc và hàng đợi', () => {
  const { m, log, playing } = setup();
  m.say(['b2.intro.4', 'n.4']);
  m.say('praise.2', { interrupt: true });
  expect(playing()).toHaveLength(1);
  expect(playing()[0].src).toContain('praise.2');
  log[log.length - 1].end();
  expect(m.isSpeaking()).toBe(false);
});

test('tắt tiếng thì không phát gì', () => {
  const { m, log } = setup();
  m.setMuted(true);
  m.say('praise.1');
  expect(log).toHaveLength(0);
  m.setMuted(false);
  m.say('praise.1');
  expect(log).toHaveLength(1);
});

test('thiếu file thì chuyển sang câu kế tiếp', () => {
  const { m, log } = setup();
  m.say(['khong-co', 'n.1']);
  log[0].onerror?.();
  expect(log[1].src).toContain('n.1');
});
