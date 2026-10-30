# Spec Delta

## Purpose

Trò chơi bài 3 (SGK Toán 1 tr.73): máy hiện phép trừ, học sinh giơ số ngón tay bằng kết quả trước webcam để trả lời. Mục tiêu là luyện tính nhẩm 9 trừ một số kết hợp vận động.

## ADDED Requirements

### Requirement: Bộ câu hỏi
Trò chơi SHALL lần lượt hỏi các phép 9−1, 9−2, 9−3, 9−4, 9−5, 9−6, 9−7, 9−8. Mỗi câu hiện dạng "9 − a = ?" bằng chữ to, và giọng đọc đọc phép tính. Bộ câu hỏi được định nghĩa bằng dữ liệu.

#### Scenario: Câu đầu tiên
- **WHEN** học sinh bắt đầu bài 3
- **THEN** màn hình hiện "9 − 1 = ?" và giọng đọc đọc "Chín trừ một bằng mấy?"

### Requirement: Hiển thị số ngón đang nhận
Trò chơi SHALL luôn hiển thị số ngón đang nhận diện được, kèm thanh tiến trình thời gian giữ. Học sinh nhờ đó biết máy đang "thấy" gì.

#### Scenario: Đang giơ 5 ngón
- **WHEN** học sinh giơ 5 ngón
- **THEN** màn hình hiện "Bạn đang giơ: 5" và thanh tiến trình đầy dần

### Requirement: Chốt đáp án bằng ngón tay
Khi bộ nhận diện chốt một giá trị, trò chơi SHALL so giá trị đó với kết quả đúng. Đúng thì khen, hiện phép tính đầy đủ (ví dụ "9 − 3 = 6") rồi sang câu kế tiếp. Sai thì báo sai, đọc lời động viên và chờ học sinh trả lời lại cùng câu đó.

#### Scenario: Trả lời đúng
- **WHEN** câu hỏi là 9 − 3 và học sinh giữ 6 ngón 1,5 giây
- **THEN** màn hình hiện "9 − 3 = 6" kèm hiệu ứng đúng, phát lời khen, rồi chuyển sang câu 9 − 4

#### Scenario: Trả lời sai
- **WHEN** câu hỏi là 9 − 3 và học sinh giữ 5 ngón 1,5 giây
- **THEN** màn hình báo sai, phát "Thử lại nhé!" và vẫn giữ câu 9 − 3

#### Scenario: Không chốt lặp lại
- **WHEN** học sinh vừa trả lời sai bằng 5 ngón và vẫn giữ nguyên 5 ngón
- **THEN** trò chơi không chốt lại giá trị 5 cho đến khi số ngón thay đổi hoặc tay rời khung hình

### Requirement: Bàn phím số dự phòng
Trò chơi SHALL có bàn phím số 0–10 trên màn hình. Bấm một số trên bàn phím có tác dụng như chốt bằng ngón tay. Bàn phím luôn dùng được, và tự hiện ra khi camera không hoạt động.

#### Scenario: Trả lời bằng bàn phím
- **WHEN** câu hỏi là 9 − 7 và học sinh bấm số 2
- **THEN** trò chơi xử lý như một câu trả lời đúng

### Requirement: Kết thúc bài
Sau câu cuối, trò chơi SHALL hiện bảng tổng kết. Bảng gồm 8 phép tính đã hoàn thành (9−1=8 … 9−8=1), số lần trả lời đúng ngay lần đầu, và nút "Chơi lại".

#### Scenario: Hoàn thành 8 câu
- **WHEN** học sinh trả lời đúng câu 9 − 8
- **THEN** hiện bảng tổng kết với đủ 8 phép tính và kết quả, và phát lời khen
