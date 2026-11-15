# Proposal

## Why

Giáo viên dạy tiết Luyện tập Bài 11 (SGK Toán 1 tập 1, trang 72–73) ngay trên ứng dụng thay cho PowerPoint. Hiện ứng dụng chỉ là 3 thẻ rời nhau (Bài 2, 3, 4), không có mạch chuyện nối các bài, và **Bài 1 chưa có trò chơi**. Change này gom cả 4 bài vào một chuyến tham quan "Vườn Thú Số Vui": học sinh đi qua từng cổng, mỗi cổng là một bài, để tiết học liền mạch và hấp dẫn hơn.

## What Changes

- **Màn đường đi 3D (tour)** thay cho màn chọn bài:
  - Xe buýt đưa lớp tới cổng vườn thú. Vẹt Xanh là hướng dẫn viên, đậu trên vai bạn học sinh.
  - Camera chạy theo đường ray qua 4 cổng. Học sinh không tự đi lại. Giáo viên bấm "Đi tiếp", "Vào cổng" và "Qua cổng".
  - Thứ tự cổng theo số bài (lúc đầu đi theo câu chuyện 3 → 1 → 2 → 4, sau đổi theo yêu cầu của giáo viên):

    | Cổng | Tên cổng | Bài |
    |---|---|---|
    | 1 | Vườn Hoa Bướm Xinh | Bài 1 (trò mới) |
    | 2 | Đồng Cỏ Thỏ Nhảy Cà Rốt | Bài 2 |
    | 3 | Trạm Soát Vé Bàn Tay Thần Kỳ | Bài 3 (giơ ngón tay) |
    | 4 | Ếch Nhảy, Cò Bay, Trứng Nở | Bài 4 |

  - Đi hết 4 cổng thì tới **Quảng Trường Huy Hiệu**: pháo hoa, huy chương "Nhà thám hiểm Phép Trừ nhí" và hai bảng gỗ ghi lại phép tính của các cổng đã qua.
  - Có nút **"Bản đồ"** để giáo viên nhảy thẳng tới cổng bất kỳ.
  - Giáo viên qua cổng được cả khi học sinh chưa chơi xong.
  - Khi đang chơi, phía trên có **dải tên cổng**. Riêng Cổng 3 (trạm soát vé) có thanh chắn với 8 bóng đèn, sáng dần theo số câu đúng.
- **Trò mới cho Bài 1 "Vườn Hoa Bướm Xinh"**, bám đúng đề "Số?" trong SGK (6 − 1 … 6 − 5):
  - Giáo viên trình chiếu từng bước như PowerPoint (bấm chuột hoặc phím Next): 6 bông hoa vàng → bướm bay tới đậu, k bông chuyển đỏ → hiện phép tính → hiện kết quả.
  - Câu 6 − 1 = 5 là câu mẫu.
  - (Bản đầu cho học sinh tự bấm hoa và chọn viên đá số 0–6; sau đổi sang trình chiếu theo yêu cầu của giáo viên.)
- **BREAKING (spec)**: màn chính không còn là 3 thẻ chọn bài. Nút "Về trang chủ" trong trò chơi đổi thành **"Về đường đi"**.
- **Không có âm thanh**: bản đầu có thêm lời dẫn và câu đọc Bài 1 vào giọng đọc, sau đó giáo viên yêu cầu bỏ toàn bộ âm thanh và file âm thanh. Ứng dụng vẫn chạy offline và không thêm thư viện.
- **Popup bảng phép tính** khi chơi xong hoặc bấm "Qua cổng" (gộp từ change `gate-recap-board` đã lưu trữ).
- **Bài 4** bỏ vòng quay nến và các nhiệm vụ: mỗi bến có nút Nhảy / Bay / Nở và nút "Đáp án"; bến nến thành bến trứng.

## Capabilities

### New Capabilities
- `zoo-tour`: Chuyến tham quan có 4 cổng. Gồm màn đường đi 3D, thứ tự cổng, tên cổng, điều khiển của giáo viên, bản đồ, dải cổng khi đang chơi, popup bảng phép tính và Quảng Trường Huy Hiệu.
- `flower-subtraction-game`: Trò chơi Bài 1, trình chiếu từng bước 6 − 1 … 6 − 5.

### Modified Capabilities
- `game-shell`:
  - "Màn hình chọn bài" được thay bằng màn đường đi.
  - Lối vào từng bài chuyển sang nút Bản đồ.
  - "Về trang chủ" đổi thành "Về đường đi".
  - Bỏ "Giọng đọc tiếng Việt"; `start.bat` chạy được dù đặt ở thư mục nào.

## Impact

- **Mã mới**:
  - `src/tour/`: cảnh đường đi, cổng, Vẹt Xanh, bản đồ, store tiến độ, logic thuần có test.
  - `src/games/flower/`: trò Bài 1.
- **Mã sửa**:
  - `src/app/store.ts` và `App.tsx`: thêm màn `tour` và `flower`, và bọc trò chơi bằng dải cổng.
  - `TopBar.tsx`: thêm nút "Về đường đi".
  - `HomeScreen.tsx`: chỉ giữ màn "Bắt đầu" rồi chuyển sang tour.
  - Các trò Bài 2, 3, 4 cần báo cho tour biết khi chơi xong. Chỉ thêm một hàm gọi lại, không đổi luật chơi.
- **Âm thanh**: đã xóa `src/audio/` và `public/audio/`.
- **Phụ thuộc**: tour dùng lại `src/shared/3d/toon.tsx`, mà change `zoo-stylized-toon-ferris-wheel` đang sửa. Nên làm xong phần toon của change đó trước.
- **Gói phát hành**: cập nhật `release/HUONG-DAN.txt` theo luồng mới.
