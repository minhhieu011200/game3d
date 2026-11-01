# hand-finger-detection Specification

## Purpose

Đếm số ngón tay học sinh đang giơ trước webcam, trên tối đa hai bàn tay. Việc nhận diện chạy ngay trên máy, không gửi hình ảnh ra ngoài. Kết quả là đầu vào cho các trò chơi cần trả lời bằng ngón tay.

## Requirements

### Requirement: Xin quyền và mở webcam
Ứng dụng SHALL chỉ mở webcam khi vào trò chơi cần nhận diện tay, và SHALL tắt webcam khi rời trò chơi đó. Ứng dụng phải hiển thị khung hình camera để học sinh thấy tay của mình.

#### Scenario: Cho phép camera
- **WHEN** học sinh vào bài 3 và trình duyệt được cấp quyền camera
- **THEN** khung hình camera hiển thị ở góc màn hình và việc nhận diện bắt đầu

#### Scenario: Rời trò chơi
- **WHEN** học sinh rời bài 3
- **THEN** webcam được tắt và đèn báo camera tắt

### Requirement: Báo lỗi camera
Khi không có camera, hoặc quyền camera bị từ chối, ứng dụng SHALL hiển thị thông báo tiếng Việt dễ hiểu, kèm cách khắc phục. Trò chơi vẫn chơi được bằng phương án dự phòng.

#### Scenario: Bị từ chối quyền
- **WHEN** người dùng từ chối quyền camera
- **THEN** ứng dụng hiện "Chưa mở được camera. Hãy bấm biểu tượng camera trên thanh địa chỉ và chọn Cho phép." và hiện bàn phím số dự phòng

### Requirement: Đếm ngón trên hai bàn tay
Bộ nhận diện SHALL phát hiện tối đa 2 bàn tay. Với mỗi bàn tay, bộ nhận diện đếm số ngón đang duỗi (0–5), kể cả ngón cái, cho cả tay trái và tay phải. Kết quả báo ra là tổng số ngón (0–10) và số bàn tay đang thấy.

#### Scenario: Một tay giơ 3 ngón
- **WHEN** một bàn tay giơ ngón trỏ, ngón giữa và ngón áp út trước camera
- **THEN** số ngón báo ra là 3

#### Scenario: Hai tay giơ tổng 7 ngón
- **WHEN** một tay xòe 5 ngón và tay kia giơ 2 ngón
- **THEN** số ngón báo ra là 7

#### Scenario: Không có tay
- **WHEN** không có bàn tay nào trong khung hình
- **THEN** bộ nhận diện báo "không thấy tay", không báo số 0

### Requirement: Làm mượt kết quả
Bộ nhận diện SHALL làm mượt kết quả theo thời gian. Số ngón chỉ được coi là "ổn định" khi giữ nguyên liên tục trong một khoảng thời gian cấu hình được (mặc định 0,7 giây). Thời gian giữ còn lại được báo ra để vẽ thanh tiến trình.

#### Scenario: Tay rung nhẹ
- **WHEN** học sinh giơ 6 ngón nhưng có vài khung hình lẻ bị đếm thành 5
- **THEN** kết quả hiển thị vẫn là 6 và quá trình giữ không bị đặt lại vì các khung hình lẻ đó

#### Scenario: Giữ đủ thời gian
- **WHEN** số ngón giữ nguyên là 6 trong 0,7 giây
- **THEN** bộ nhận diện phát sự kiện "chốt" với giá trị 6 đúng một lần

### Requirement: Nguồn tải MediaPipe JS
Khi trình duyệt báo có mạng, ứng dụng SHALL tải MediaPipe JS (.wasm và mô hình bàn tay) từ web trước. Nếu web lỗi hoặc quá 10 giây, hoặc máy không có mạng, ứng dụng SHALL dùng bản đóng gói sẵn trên máy. Học sinh không phải làm gì thêm trong cả hai trường hợp.

#### Scenario: Có mạng
- **WHEN** máy có mạng và học sinh vào bài 3
- **THEN** MediaPipe được tải từ web và việc nhận diện bắt đầu

#### Scenario: Có mạng nhưng web bị chặn
- **WHEN** trình duyệt báo có mạng nhưng không tải được MediaPipe từ web
- **THEN** ứng dụng dùng bản trên máy và việc nhận diện vẫn bắt đầu

#### Scenario: Không có mạng
- **WHEN** máy không có mạng
- **THEN** ứng dụng dùng ngay bản trên máy, không thử tải từ web

### Requirement: Hình ảnh không rời khỏi máy
Hình ảnh từ camera MUST chỉ được xử lý ngay trên máy, không được lưu hay gửi đi đâu.

#### Scenario: Kiểm tra mạng khi dùng camera
- **WHEN** bộ nhận diện đang chạy
- **THEN** không có yêu cầu mạng nào gửi dữ liệu hình ảnh, và không có file ảnh nào được ghi ra đĩa
