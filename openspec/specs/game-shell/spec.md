# game-shell Specification

## Purpose

Khung ứng dụng chung cho bộ trò chơi Toán 1. Phần này gồm màn hình chọn bài, điều hướng, giọng đọc và âm thanh, cài đặt chất lượng đồ họa, và cách khởi chạy offline trên máy lớp học.

## Requirements

### Requirement: Màn hình chọn bài
Ứng dụng SHALL mở ra màn hình chính có ba thẻ: "Bài 2: Thỏ nhảy tìm cà rốt", "Bài 3: Giơ ngón tay", "Bài 4: Vườn thú". Bấm vào một thẻ thì vào trò chơi tương ứng.

#### Scenario: Vào một bài
- **WHEN** người dùng bấm thẻ "Bài 3: Giơ ngón tay"
- **THEN** ứng dụng hiển thị trò chơi bài 3

#### Scenario: Quay về màn hình chính
- **WHEN** người dùng đang ở một trò chơi và bấm nút "Về trang chủ"
- **THEN** ứng dụng trở về màn hình chọn bài, đồng thời tắt camera và dừng âm thanh của trò chơi đó

### Requirement: Chạy hoàn toàn offline
Ứng dụng SHALL hoạt động đầy đủ khi máy không có kết nối mạng. Mọi tài nguyên (font, mô hình 3D, MediaPipe, âm thanh) MUST có sẵn trong gói. Chỉ MediaPipe được phép tải từ web khi có mạng (xem hand-finger-detection); mọi tài nguyên khác MUST NOT tải từ ngoài máy.

#### Scenario: Máy ngắt mạng
- **WHEN** máy không có mạng và người dùng mở lần lượt cả ba bài
- **THEN** mọi cảnh 3D, chữ, âm thanh và nhận diện tay đều hoạt động, và không có yêu cầu mạng nào thành công ra ngoài `localhost`

#### Scenario: Máy có mạng
- **WHEN** máy có mạng và người dùng mở lần lượt cả ba bài
- **THEN** các yêu cầu ra ngoài máy chỉ là file MediaPipe (.wasm, .js, .task)

### Requirement: Khởi chạy bằng start.bat
Gói phát hành SHALL có file `start.bat`. Bấm đúp vào file này thì một máy chủ tĩnh chạy trên `localhost`, chỉ dùng công cụ có sẵn của Windows, rồi trình duyệt mặc định hoặc Edge mở trang trò chơi. Máy không cần cài thêm phần mềm.

#### Scenario: Khởi chạy lần đầu
- **WHEN** giáo viên bấm đúp `start.bat` trên máy Windows 10/11 chưa cài Node hay Python
- **THEN** trình duyệt mở màn hình chọn bài tại một địa chỉ `http://localhost:<cổng>`

#### Scenario: Cổng mặc định đang bận
- **WHEN** cổng mặc định đã bị chương trình khác dùng
- **THEN** máy chủ chọn cổng trống kế tiếp và mở trình duyệt đúng cổng đó

### Requirement: Giọng đọc tiếng Việt
Ứng dụng SHALL phát giọng đọc bé gái tiếng Việt, tạo sẵn thành file, cho đề bài mỗi trò chơi, lời khen khi đúng và lời động viên khi sai. Phải có nút bật/tắt tiếng dùng chung cho mọi trò chơi.

#### Scenario: Khen khi đúng
- **WHEN** học sinh trả lời đúng trong bất kỳ trò chơi nào và tiếng đang bật
- **THEN** ứng dụng phát một câu khen, ví dụ "Giỏi quá!"

#### Scenario: Tắt tiếng
- **WHEN** người dùng tắt tiếng
- **THEN** không còn giọng đọc hay hiệu ứng âm thanh nào được phát, cho đến khi bật lại

### Requirement: Chọn chất lượng đồ họa
Ứng dụng SHALL có cài đặt chất lượng "Cao" và "Thấp". Mức "Thấp" giảm hiệu ứng nặng như bóng đổ, phản chiếu nước và mật độ cây cỏ để máy yếu vẫn chạy mượt. Lựa chọn được ghi nhớ cho lần mở sau trên cùng máy.

#### Scenario: Chuyển sang chất lượng thấp
- **WHEN** người dùng chọn "Thấp" trong lúc đang xem cảnh 3D
- **THEN** cảnh hiển thị lại không có bóng đổ và phản chiếu nước, các thao tác chơi vẫn hoạt động như cũ

#### Scenario: Ghi nhớ lựa chọn
- **WHEN** người dùng đã chọn "Thấp", đóng rồi mở lại ứng dụng
- **THEN** ứng dụng khởi động ở mức "Thấp"

### Requirement: Ghi nguồn tài nguyên
Ứng dụng SHALL có trang "Giới thiệu" liệt kê tác giả và giấy phép của mọi tài nguyên bên thứ ba có yêu cầu ghi nguồn.

#### Scenario: Xem ghi nguồn
- **WHEN** người dùng mở trang "Giới thiệu"
- **THEN** mỗi mô hình 3D, ảnh bầu trời hoặc âm thanh có giấy phép CC-BY đều được liệt kê kèm tên tác giả và giấy phép
