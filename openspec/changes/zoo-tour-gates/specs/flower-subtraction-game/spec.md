## Purpose

Trò chơi Bài 1 (SGK Toán 1 tập 1, trang 72, "Số?"). Học sinh tự bấm để bớt đi một số bông hoa trong 6 bông, rồi đếm số bông còn lại để điền kết quả 6 − 1 … 6 − 5.

## ADDED Requirements

### Requirement: Bộ câu hỏi
Trò chơi SHALL lần lượt hỏi 6 − 1, 6 − 2, 6 − 3, 6 − 4, 6 − 5. Bộ câu hỏi được định nghĩa bằng dữ liệu. Câu 6 − 1 là câu mẫu, được đánh dấu "Mẫu" trên màn hình.

#### Scenario: Bắt đầu Bài 1
- **WHEN** học sinh mở Bài 1
- **THEN** màn hình hiện câu "6 − 1 = ?" có nhãn "Mẫu", và giọng đọc đọc lời giới thiệu cùng phép tính

### Requirement: Khu vườn 6 bông hoa
Mỗi câu SHALL bắt đầu với một hàng 6 bông hoa vàng, giống hình trong SGK. Phép tính hiện ở dạng "6 − k = ?" bằng chữ to, ô "?" có viền giống ô điền số trong sách.

#### Scenario: Bắt đầu câu 6 − 3
- **WHEN** trò chơi chuyển sang câu 6 − 3
- **THEN** cả 6 bông hoa đều vàng và phép tính hiện "6 − 3 = ?"

### Requirement: Bấm hoa để bớt đi
Học sinh SHALL bấm vào bông hoa vàng để bớt đi. Bông được bấm có một chú bướm bay tới đậu và chuyển sang màu đỏ. Số bông đỏ không được vượt quá k. Bấm một bông đỏ thì bông đó trở lại màu vàng.

#### Scenario: Bấm đủ số bông
- **WHEN** câu hỏi là 6 − 2 và học sinh bấm 2 bông vàng
- **THEN** 2 bông đó chuyển đỏ và có bướm đậu, 4 bông còn lại vẫn vàng

#### Scenario: Bấm quá số bông
- **WHEN** câu hỏi là 6 − 2, đã có 2 bông đỏ, và học sinh bấm thêm một bông vàng
- **THEN** bông đó vẫn vàng, và màn hình nhắc "Đã bớt đủ 2 bông rồi!"

#### Scenario: Bỏ chọn một bông
- **WHEN** học sinh bấm vào một bông đang đỏ
- **THEN** bông đó trở lại màu vàng, bướm bay đi, và học sinh có thể bấm bông khác

### Requirement: Chọn đáp án bằng viên đá số
Dưới khu vườn SHALL có 7 viên đá số từ 0 đến 6. Các viên đá chỉ bấm được khi đã bớt đủ k bông. Bấm đúng số bông vàng còn lại thì ô "?" hiện số, có hiệu ứng và lời khen, và câu đã xong hiện lại thành dòng như trong sách. Bấm sai thì viên đá rung, phát lời động viên, và học sinh chọn lại.

#### Scenario: Chưa bớt đủ hoa
- **WHEN** câu hỏi là 6 − 4, mới có 2 bông đỏ, và học sinh bấm viên đá số
- **THEN** không có gì được chốt, và màn hình nhắc "Hãy bớt đủ 4 bông trước nhé!"

#### Scenario: Trả lời đúng
- **WHEN** câu hỏi là 6 − 4, đã có 4 bông đỏ, và học sinh bấm viên đá "2"
- **THEN** ô "?" hiện "2", phát lời khen và "Sáu trừ bốn bằng hai", rồi sau một lúc chuyển sang câu 6 − 5

#### Scenario: Trả lời sai
- **WHEN** câu hỏi là 6 − 4, đã có 4 bông đỏ, và học sinh bấm viên đá "3"
- **THEN** viên đá "3" rung, phát lời động viên, và câu 6 − 4 vẫn giữ nguyên

### Requirement: Kết thúc bài
Sau câu cuối, trò chơi SHALL hiện bảng tổng kết. Bảng có đủ 5 dòng, mỗi dòng gồm 6 bông hoa vàng/đỏ và phép tính đã điền, giống trang sách, cùng số câu đúng ngay lần đầu. Có nút "Chơi lại". Khi trò chơi được mở từ một cổng tham quan, bảng có thêm nút "Qua cổng".

#### Scenario: Hoàn thành
- **WHEN** học sinh trả lời đúng câu 6 − 5
- **THEN** bảng tổng kết hiện 5 dòng từ 6 − 1 = 5 tới 6 − 5 = 1, kèm số câu đúng ngay lần đầu, và có nút "Chơi lại"

### Requirement: Dùng được trên máy chiếu và màn hình cảm ứng
Hoa và viên đá số SHALL đủ to để bấm bằng chuột hoặc chạm trên màn hình lớp học. Trò chơi chạy được ở độ phân giải 1280×720 mà không phải cuộn trang.

#### Scenario: Màn hình 1280×720
- **WHEN** mở Bài 1 trên màn hình 1280×720
- **THEN** cả 6 bông hoa, phép tính và 7 viên đá số đều hiện đủ, không cần cuộn trang
