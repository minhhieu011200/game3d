// Bảng lời đọc: khóa -> câu tiếng Việt. File âm thanh nằm ở public/audio/voice/<khóa>.mp3
// Câu chữ ở đây cũng là đầu vào để tạo giọng đọc (scripts/export-voice-lines.mjs).

const NUMBER_WORDS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười'];

export function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

const lines: Record<string, string> = {
  welcome: 'Chào các bạn! Cùng học phép trừ nhé!',
  'praise.1': 'Giỏi quá!',
  'praise.2': 'Đúng rồi!',
  'praise.3': 'Bạn làm tốt lắm!',
  'praise.4': 'Tuyệt vời!',
  'retry.1': 'Bạn thử lại nhé!',
  'retry.2': 'Chưa đúng rồi, bạn thử lại nào!',
  'retry.3': 'Cố lên nào, bạn ơi!',
  finish: 'Hoan hô! Bạn đã hoàn thành bài rồi!',

  'tour.welcome':
    'Chào mừng thầy cô và các em học sinh lớp Một Bảy, đến Khu vui chơi sở thú! Mình là Vẹt Xanh, hướng dẫn viên. Cùng mình đi tham quan nhé!',
  'tour.gate.1':
    'Muốn vào vườn thú, các bạn phải đưa bàn tay cho máy soát vé kiểm tra! Giơ đúng số ngón tay thì đèn sẽ sáng.',
  'tour.gate.2': 'Khu vườn có sáu bông hoa vàng. Đàn bướm đói đang bay tới hút mật! Các bạn đếm xem còn lại mấy bông nhé.',
  'tour.gate.3': 'Bạn Thỏ bị lạc rồi! Hãy tìm những phép trừ có kết quả bằng bốn để giúp Thỏ về tới vườn cà rốt.',
  'tour.gate.4': 'Khu cuối cùng, có hồ ếch, đàn cò và vòng quay ánh nến. Bạn nào đếm giỏi nhất nào?',
  'tour.square':
    'Hoan hô! Chúc mừng các bạn lớp Một Bảy, đã đi hết vườn thú, và nhận huy chương Nhà thám hiểm Phép Trừ nhí. Hẹn gặp lại các bạn nhé!',

  'b1.intro': 'Hãy bấm vào hoa để bướm bay tới hút mật, rồi đếm số bông hoa vàng còn lại nhé!',
  'b1.enough': 'Đã bớt đủ hoa rồi!',
  'b1.needmore': 'Hãy bớt đủ số bông hoa trước nhé!',

  'b2.carrot': 'Bạn thỏ đã tìm được cà rốt rồi!',
  'b2.win.red': 'Đội Đỏ, thắng rồi!',
  'b2.win.blue': 'Đội Xanh thắng rồi!',

  'b3.intro': 'Hãy giơ ngón tay để trả lời nhé!',

  'b4.welcome': 'Chào mừng các bạn đến vườn thú!',
  'b4.task.frog': 'Hãy cho hai bạn ếch nhảy xuống sông.',
  'b4.q.frog': 'Trên bờ còn mấy bạn ếch?',
  'b4.more.frog': 'Nhiều quá rồi! Hãy kéo bớt bạn ếch lên bờ nhé.',
  'b4.task.stork': 'Hãy cho năm bạn cò bay lên trời.',
  'b4.q.stork': 'Còn lại mấy bạn cò?',
  'b4.more.stork': 'Nhiều quá rồi! Hãy kéo bớt bạn cò xuống đất nhé.',
  'b4.task.candle': 'Hãy thổi tắt ba ngọn nến.',
  'b4.q.candle': 'Còn mấy ngọn nến đang cháy?',
  'b4.more.candle': 'Nhiều quá rồi! Hãy thắp lại bớt nến nhé.',
  'b4.choose': 'Hãy chọn phép tính đúng nhé.',
  'b4.done': 'Hoan hô! Bạn đã hoàn thành chuyến tham quan vườn thú!',
};

for (let n = 0; n <= 10; n++) lines[`n.${n}`] = `Số ${numberWord(n)}.`;
for (let b = 1; b <= 5; b++) {
  lines[`b1.q.6-${b}`] = `Sáu trừ ${numberWord(b)} bằng mấy?`;
  lines[`b1.a.6-${b}`] = `Sáu trừ ${numberWord(b)} bằng ${numberWord(6 - b)}.`;
}
// "ba bằng ba" đọc liền bị nuốt chữ cuối: ngắt hơi cho rõ
lines['b1.a.6-3'] = 'Sáu trừ ba, bằng... ba!';
for (let n = 1; n <= 9; n++) lines[`b2.intro.${n}`] = `Hãy chọn các phép trừ có kết quả bằng ${numberWord(n)}.`;
for (let a = 1; a <= 8; a++) {
  lines[`b3.q.9-${a}`] = `Chín trừ ${numberWord(a)} bằng mấy?`;
  lines[`b3.a.9-${a}`] = `Chín trừ ${numberWord(a)} bằng ${numberWord(9 - a)}.`;
}

export const voiceLines: Readonly<Record<string, string>> = lines;

export function voiceFile(key: string): string {
  return `./audio/voice/${key}.mp3`;
}

export function randomPraise(): string {
  return `praise.${1 + Math.floor(Math.random() * 4)}`;
}

export function randomRetry(): string {
  return `retry.${1 + Math.floor(Math.random() * 3)}`;
}
