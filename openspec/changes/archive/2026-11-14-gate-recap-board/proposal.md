# Proposal

> **Cập nhật 2026-11-14:** bảng hiện thành popup ngay trong màn chơi (khi chơi xong, hoặc khi bấm "Qua cổng" ở dải cổng), không hiện trên màn đường đi; qua cổng vẫn đi luôn như trước. Xem `specs/zoo-tour/spec.md`.

## Why

Mỗi bài luyện tập trên lớp thường kết thúc bằng việc cả lớp đọc lại các phép tính vừa làm. Hiện nay chỉ màn kết thúc trong trò chơi có phép tính, và màn này không đủ:
- Cổng 3 (thỏ) không ghi phép tính nào.
- Khi giáo viên bấm "Qua cổng" sớm (lúc chưa chơi xong), học sinh không được xem lại gì.
- Bấm "Qua cổng" xong thì cả nhóm đi luôn sang cổng sau, không có lúc dừng để ôn bài.

## What Changes

- **Bảng phép tính sau khi qua cổng**: bấm "Qua cổng" thì quay về màn đường đi, cánh cổng mở ra, và giữa màn hình hiện một bảng gỗ ghi các phép tính của bài vừa qua:
  - Có đủ phép tính của bài.
  - Phép đã làm xong ghi kết quả kèm ✓.
  - Phép chưa làm ghi "a − b = ?", màu mờ.
- **BREAKING (spec)**: qua cổng **không còn** đi luôn tới cổng sau. Nhóm cô trò đứng trước cổng vừa mở, chờ giáo viên bấm "Đi tiếp". Áp dụng cho cả Cổng 4: bảng hiện trước, "Đi tiếp" mới tới Quảng Trường Huy Hiệu.
- Nội dung bảng theo từng cổng:

  | Cổng | Bảng ghi |
  |---|---|
  | 1 · Soát vé (Bài 3) | 8 phép 9 − 1 … 9 − 8 |
  | 2 · Vườn hoa (Bài 1) | 5 phép 6 − 1 … 6 − 5 |
  | 3 · Thỏ (Bài 2) | Cả 7 ô của làn. Ô có kết quả bằng mục tiêu được tô nổi bật kèm 🥕. Chơi 2 đội thì có 2 cột Đội Đỏ / Đội Xanh |
  | 4 · Hồ ếch (Bài 4) | 3 phép 10 − 2 = 8 (ếch), 10 − 5 = 5 (cò), 10 − 3 = 7 (nến) |

- Bảng **không đọc thành tiếng**: cả lớp tự đọc trên màn chiếu. Không thêm file giọng đọc.

## Capabilities

### New Capabilities
<!-- không có -->

### Modified Capabilities
- `zoo-tour`:
  - Thêm requirement "Bảng phép tính sau khi qua cổng".
  - Sửa requirement "Qua cổng": dừng ở bảng, chờ "Đi tiếp", thay vì đi luôn.

  Capability này được thêm bởi change `zoo-tour-gates`, nên **phải archive `zoo-tour-gates` trước** (đã xong 40/41 việc) để `openspec/specs/zoo-tour/spec.md` tồn tại.

## Impact

- **Mã sửa**:
  - `src/tour/logic.ts`: thêm pha `recap`; `pass` dừng ở pha này; `canAdvance` / `advance` cho đi tiếp từ đó; `cameraT` đứng trước cổng.
  - `src/tour/store.ts`, `src/tour/gateBridge.tsx`: lưu và nhận dữ liệu bảng theo từng cổng (hàm `reportRecap`).
  - `src/tour/TourScreen.tsx`: hiện bảng.
  - `src/tour/TourScene.tsx`: lúc dựng lại cảnh, cổng vừa qua mở dần phía sau bảng.
- **Mã mới**: `src/tour/recap.ts` (kiểu dữ liệu bảng, bảng mặc định của từng cổng) và `src/tour/RecapBoard.tsx`.
- **Trò chơi**: các trò Bài 1–4 báo nội dung bảng mỗi khi trạng thái đổi. Chỉ thêm lời gọi, không đổi luật chơi. Mở riêng lẻ (không qua cổng) thì lời gọi này không làm gì.
- **Không** thêm thư viện, giọng đọc hay tài nguyên mới. Vẫn chạy offline.
