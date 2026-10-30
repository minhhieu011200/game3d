// Nguồn tài nguyên bên thứ ba. Mọi tài nguyên CC-BY bắt buộc phải có mặt ở đây.
export interface Credit {
  asset: string;
  author: string;
  license: string;
  source: string;
}

export const credits: Credit[] = [
  {
    asset: 'Phông chữ Baloo 2',
    author: 'Ek Type',
    license: 'SIL Open Font License 1.1',
    source: 'fonts.google.com/specimen/Baloo+2',
  },
  {
    asset: 'Mô hình nhận diện bàn tay (MediaPipe Hand Landmarker)',
    author: 'Google',
    license: 'Apache License 2.0',
    source: 'developers.google.com/mediapipe',
  },
  {
    asset: 'Hình cà rốt (Bài 2)',
    author: 'Kenney (Jumper Pack)',
    license: 'CC0 1.0',
    source: 'kenney.nl · opengameart.org/content/jumper-pack',
  },
  {
    asset: 'Hình hàng rào (Bài 2)',
    author: 'Kenney (Platformer Pack Redux)',
    license: 'CC0 1.0',
    source: 'kenney.nl · opengameart.org/content/platformer-pack-redux-360-assets',
  },
  {
    asset:
      'Thỏ trắng đội mũ (Bài 2) và toàn bộ nhân vật, cảnh hoạt hình của Bài 4: ếch, cò, nến, voi, hươu cao cổ, khỉ, gấu trúc, sư tử, thuyền, bác lái đò, cây, mây, cổng cầu vồng',
    author: 'Dựng bằng code trong dự án',
    license: '—',
    source: '—',
  },
];
