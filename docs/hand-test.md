# Kiểm tra nhận diện ngón tay với tay thật (task 3.5)

Chưa thực hiện: việc này cần một người thật giơ tay trước webcam.

## Cách làm

1. Mở Bài 3. Ngồi cách webcam khoảng 50–80 cm.
2. Với mỗi số từ 1 đến 10, giơ tay 10 lần (5 lần tay trái hoặc hai tay, 5 lần tay phải hoặc hai tay).
   Ghi số máy hiện ở dòng "Bạn đang giơ".
3. Làm ở 2 điều kiện: phòng sáng (đèn và cửa sổ) và phòng hơi tối hoặc ngược sáng.
4. Nếu một số nào đó đúng dưới 9/10 lần, chỉnh ngưỡng trong [src/hand/fingerCount.ts](../src/hand/fingerCount.ts):
   - Ngón cái hay bị đếm thừa: tăng `THUMB_SPREAD` (ví dụ 0.55 → 0.65).
   - Ngón cái hay bị bỏ sót: giảm `THUMB_SPREAD` hoặc tăng `THUMB_MAX_BEND_DEG`.
   - Ngón gập hờ bị đếm là duỗi: tăng `FINGER_RATIO` (ví dụ 1.1 → 1.2).

## Kết quả

| Số ngón | Phòng sáng (đúng/10) | Phòng tối (đúng/10) | Ghi chú |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | | | |
| 8 | | | |
| 9 | | | |
| 10 | | | |
