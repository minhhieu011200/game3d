# Proposal

## Why

Giáo viên dạy tiết Luyện tập Bài 11 (SGK Toán 1 tập 1, trang 72–73) ngay trên ứng dụng thay cho PowerPoint. Hiện ứng dụng chỉ là 3 thẻ rời nhau (Bài 2, 3, 4), không có mạch chuyện nối các bài, và **Bài 1 chưa có trò chơi**. Change này gom cả 4 bài vào một chuyến tham quan "Vườn Thú Số Vui": học sinh đi qua từng cổng, mỗi cổng là một bài, để tiết học liền mạch và hấp dẫn hơn.

## What Changes

- **Màn đường đi 3D (tour)** thay cho màn chọn bài:
  - Xe buýt đưa lớp tới cổng vườn thú. Vẹt Xanh là hướng dẫn viên, đọc lời dẫn ở mỗi cổng.
  - Camera chạy theo đường ray qua 4 cổng. Học sinh không tự đi lại. Giáo viên bấm "Đi tiếp", "Vào cổng" và "Qua cổng".
  - Thứ tự cổng đi theo câu chuyện, không theo số bài:

    | Cổng | Tên cổng | Bài |
    |---|---|---|
    | 1 | Trạm Soát Vé Bàn Tay Thần Kỳ | Bài 3 (giơ ngón tay) |
    | 2 | Vườn Hoa Bướm Xinh | Bài 1 (trò mới) |
    | 3 | Đồng Cỏ Thỏ Nhảy Cà Rốt | Bài 2 |
    | 4 | Hồ Ếch & Vòng Quay Ánh Nến | Bài 4 |

  - Đi hết 4 cổng thì tới **Quảng Trường Huy Hiệu**: pháo hoa và huy hiệu "Nhà thám hiểm Phép Trừ nhí".
  - Có nút **"Bản đồ"** để giáo viên nhảy thẳng tới cổng bất kỳ.
  - Giáo viên qua cổng được cả khi học sinh chưa chơi xong.
  - Khi đang chơi, phía trên có **dải tên cổng**. Riêng Cổng 1 có thanh chắn với 8 bóng đèn, sáng dần theo số câu đúng.
- **Trò mới cho Bài 1 "Vườn Hoa Bướm Xinh"**, bám đúng đề "Số?" trong SGK (6 − 1 … 6 − 5):
  - Màn hình có 6 bông hoa vàng.
  - Học sinh bấm vào k bông. Mỗi bông được bấm có bướm bay tới đậu và chuyển sang màu đỏ.
  - Học sinh đếm số bông vàng còn lại rồi bấm viên đá số (0–6).
  - Câu 6 − 1 = 5 là câu mẫu.
- **BREAKING (spec)**: màn chính không còn là 3 thẻ chọn bài. Nút "Về trang chủ" trong trò chơi đổi thành **"Về đường đi"**.
- Thêm lời dẫn của Vẹt Xanh và các câu đọc của Bài 1 vào giọng đọc. Ứng dụng vẫn chạy offline và không thêm thư viện.

## Capabilities

### New Capabilities
- `zoo-tour`: Chuyến tham quan có 4 cổng. Gồm màn đường đi 3D, thứ tự cổng, tên cổng, lời dẫn, điều khiển của giáo viên, bản đồ, dải cổng khi đang chơi và Quảng Trường Huy Hiệu.
- `flower-subtraction-game`: Trò chơi Bài 1, gồm bấm hoa để bớt đi rồi chọn số còn lại.

### Modified Capabilities
- `game-shell`:
  - "Màn hình chọn bài" được thay bằng màn đường đi.
  - Lối vào từng bài chuyển sang nút Bản đồ.
  - "Về trang chủ" đổi thành "Về đường đi".

## Impact

- **Mã mới**:
  - `src/tour/`: cảnh đường đi, cổng, Vẹt Xanh, bản đồ, store tiến độ, logic thuần có test.
  - `src/games/flower/`: trò Bài 1.
- **Mã sửa**:
  - `src/app/store.ts` và `App.tsx`: thêm màn `tour` và `flower`, và bọc trò chơi bằng dải cổng.
  - `TopBar.tsx`: thêm nút "Về đường đi".
  - `HomeScreen.tsx`: chỉ giữ màn "Bắt đầu" rồi chuyển sang tour.
  - Các trò Bài 2, 3, 4 cần báo cho tour biết khi chơi xong. Chỉ thêm một hàm gọi lại, không đổi luật chơi.
- **Giọng đọc**: thêm khóa mới vào `src/audio/voiceLines.ts` và tạo thêm file MP3 trong `public/audio/voice/`.
- **Phụ thuộc**: tour dùng lại `src/shared/3d/toon.tsx`, mà change `zoo-stylized-toon-ferris-wheel` đang sửa. Nên làm xong phần toon của change đó trước.
- **Gói phát hành**: cập nhật `release/HUONG-DAN.txt` theo luồng mới.
