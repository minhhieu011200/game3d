# Proposal

## Why

Bài 2 "Thỏ nhảy tìm cà rốt" hiện chỉ cho một người chơi. Cảnh 3D lại có nhiều chi tiết thừa làm rối mắt học sinh lớp 1: con suối và đá phía trước, khúc gỗ nâu ở chỗ thỏ đứng, cà rốt cắm dọc đường. Nút "Bỏ qua" thì nằm ở góc màn hình, cách xa ô đang hỏi, nên trẻ khó hiểu. Giáo viên muốn cho **hai đội thi với nhau** trên một máy chiếu. Trò này cũng không cần 3D: một cảnh 2D với hình hoạt hình rõ ràng là đủ, và chạy nhẹ hơn trên máy lớp học.

## What Changes

- **Chọn chế độ chơi**: "1 người" hoặc "2 đội". Không đặt tên đội, gọi là Đội Đỏ và Đội Xanh.
- **Chế độ 2 đội**: mỗi đội một làn và một con thỏ, chung vạch đích là hàng rào cà rốt.
  - Hai đội thay phiên nhau trả lời, nên chỉ cần 1 máy và 1 chuột.
  - Đổi lượt sau mỗi lần trả lời, dù đúng hay sai.
  - **Đội nào đưa thỏ tới hàng rào cà rốt trước thì thắng.**
  - Mỗi làn có một bộ phép tính riêng, nhưng cùng mục tiêu, cùng số ô và cùng số ô đúng.
- **BREAKING (luật chơi)**: Thay nút "Bỏ qua" bằng hai nút **Đúng** và **Sai** đặt ngay cạnh ô thỏ sắp nhảy tới.
  - Phán đúng thì thỏ nhảy lên ô đó.
  - Phán nhầm thì thỏ về vạch xuất phát và mọi ô trên làn trở về chưa trả lời. Đây là luật "về ô Bắt đầu" hiện có.
  - Đi hết các ô thì thỏ nhảy vào hàng rào cà rốt.

  Spec cũ cho bấm ô đúng bất kỳ và giữ các ô đã tìm. Spec mới viết lại theo luật đi lần lượt từng ô, như code đang làm.
- **BREAKING (hiển thị)**: Bài 2 chuyển từ cảnh 3D (React Three Fiber) sang **2D**, không còn xoay hay phóng to camera.
  - Nền cỏ giống hiện tại, có trời xanh và bụi cây phía sau.
  - Bỏ con suối và đá phía trước, khúc gỗ nâu ở ô xuất phát, và cà rốt dọc đường. Cà rốt chỉ còn ở hàng rào đích.
- **Hình hoạt hình có giấy phép tự do** (CC0 hoặc Pixabay Content License) cho thỏ, cà rốt và hàng rào.
  - Hình được tải về và đóng gói kèm để chạy offline, nguồn ghi ở trang "Giới thiệu".
  - Hai thỏ phân biệt bằng màu đội.
- Giữ nút chọn số mục tiêu (2–9), nút "Màn mới" và cách sinh màn chơi hiện có.
- Thêm câu đọc mới: "Lượt của đội Đỏ/Xanh", "Đội Đỏ/Xanh thắng rồi!".

## Capabilities

### New Capabilities
<!-- Không có. -->

### Modified Capabilities
- `bunny-carrot-game`: Luật chơi Bài 2 thay đổi như sau:
  - Bố cục chuyển sang 2D.
  - Có thêm lựa chọn chế độ 1 người hoặc 2 đội.
  - Trả lời bằng nút Đúng hoặc Sai trên từng ô, đi lần lượt. Nhầm thì về vạch xuất phát.
  - Có thể thay phiên giữa hai đội, đội về đích trước thì thắng.
  - Cà rốt chỉ ở hàng rào đích.

## Impact

- **Code**:
  - Viết lại `src/games/bunny/`: `BunnyGame.tsx`, `store.ts`, `logic.ts`, `levels.ts`. Bỏ `BunnyScene.tsx` và thay bằng cảnh 2D.
  - Xoá `src/shared/3d/Rabbit.tsx`, `Carrot.tsx`, `fur.ts` và các tiện ích mô hình tuỳ chọn (`optionalModel.ts`, `useModel.ts`, `public/models/README.txt`) nếu không còn nơi nào dùng.
  - Sửa CSS `b2-*` trong `src/styles.css`.
- **Tài nguyên**: thêm ảnh hoạt hình trong `public/images/bunny/`. Cập nhật `src/credits.ts`, vì mục "thỏ, cà rốt dựng bằng code" không còn đúng.
- **Âm thanh**: thêm khóa mới vào `src/audio/voiceLines.ts` và tạo các file MP3 tương ứng trong `public/audio/voice/`.
- **Test**: cập nhật `src/games/bunny/logic.test.ts` cho luật Đúng/Sai và chế độ 2 đội.
- **Không ảnh hưởng**: Bài 3, Bài 4, khung ứng dụng (`game-shell`). Thẻ "Bài 2: Thỏ nhảy tìm cà rốt" trên màn hình chính giữ nguyên.
- **Ngoài phạm vi**:
  - Hai đội bấm cùng lúc trên màn hình cảm ứng.
  - Đặt tên đội.
  - Hơn 2 đội.
  - Lưu kết quả giữa các lần chơi.
