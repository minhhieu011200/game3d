# Spec Delta

## Purpose

Trò chơi bài 2 (SGK Toán 1 tr.72): học sinh giúp chú thỏ nhảy tìm cà rốt bằng cách chọn các phép trừ có kết quả bằng giá trị mục tiêu. Mục tiêu là luyện nhận biết kết quả phép trừ trong phạm vi 10.

## ADDED Requirements

### Requirement: Bố cục màn chơi
Màn chơi SHALL hiển thị cảnh 3D gồm: thỏ đứng ở ô "Bắt đầu", các ô hình bàn chân mỗi ô ghi một phép trừ, vườn cà rốt ở đích. Phía trên có đề bài "Chọn các phép trừ có kết quả bằng N", bảng điểm và bảng "Cần tìm: K phép tính đúng".

#### Scenario: Mở màn chơi mặc định
- **WHEN** học sinh vào bài 2
- **THEN** màn chơi hiện 6 ô phép trừ 5−1, 6−3, 9−5, 7−3, 8−4, 10−6 với mục tiêu N = 4, và giọng đọc đọc đề bài

### Requirement: Số ô cần tìm tính từ dữ liệu
Giá trị K ("Cần tìm") SHALL bằng đúng số ô có kết quả bằng N trong màn chơi. K MUST NOT được ghi cố định.

#### Scenario: Bộ ô mặc định
- **WHEN** màn chơi dùng bộ ô mặc định với N = 4
- **THEN** bảng hiển thị "Cần tìm: 5", vì 6−3 = 3 không phải đáp án

### Requirement: Chọn ô đúng
Khi học sinh chọn một ô chưa tìm có kết quả bằng N, thỏ SHALL nhảy đến ô đó. Ô chuyển sang trạng thái "đã tìm" (sáng xanh), điểm tăng, và ứng dụng phát lời khen.

#### Scenario: Chọn 8−4
- **WHEN** học sinh bấm ô 8−4 lúc mục tiêu là 4
- **THEN** thỏ nhảy lên ô 8−4, ô sáng xanh, điểm tăng 1 và số ô còn lại giảm 1

### Requirement: Chọn ô sai
Khi học sinh chọn ô có kết quả khác N, ô đó SHALL báo sai (rung và đỏ) và thỏ quay về ô "Bắt đầu". Các ô đã tìm vẫn giữ trạng thái "đã tìm" và điểm không bị trừ.

#### Scenario: Chọn 6−3 sau khi đã tìm 2 ô
- **WHEN** học sinh đã tìm được 5−1 và 9−5, rồi bấm ô 6−3
- **THEN** ô 6−3 rung đỏ, thỏ nhảy về ô "Bắt đầu", hai ô 5−1 và 9−5 vẫn sáng xanh, và ứng dụng phát lời động viên "Thử lại nhé!"

#### Scenario: Chọn đúng sau khi sai
- **WHEN** thỏ đang ở ô "Bắt đầu" sau một lần sai và học sinh bấm ô 7−3
- **THEN** thỏ nhảy từ ô "Bắt đầu" đến ô 7−3

### Requirement: Không nhận thao tác trong lúc thỏ đang nhảy
Trong lúc thỏ đang nhảy, màn chơi SHALL bỏ qua các lần bấm ô khác. Bấm lại ô đã tìm thì không có tác dụng.

#### Scenario: Bấm liên tục
- **WHEN** học sinh bấm hai ô liên tiếp trong lúc thỏ chưa nhảy xong
- **THEN** chỉ lần bấm đầu được xử lý

### Requirement: Hoàn thành màn chơi
Khi đã tìm đủ K ô, thỏ SHALL nhảy vào vườn cà rốt. Màn chơi hiện màn chúc mừng có nút "Chơi lại".

#### Scenario: Tìm đủ ô
- **WHEN** học sinh tìm được ô đúng thứ 5 trong bộ ô mặc định
- **THEN** thỏ nhảy vào vườn cà rốt, hiện màn chúc mừng và phát lời khen

#### Scenario: Chơi lại
- **WHEN** học sinh bấm "Chơi lại"
- **THEN** điểm về 0, mọi ô trở về trạng thái chưa tìm và thỏ về ô "Bắt đầu"

### Requirement: Màn chơi cấu hình được
Bộ ô phép trừ và giá trị mục tiêu N SHALL được định nghĩa bằng dữ liệu, để thêm màn mới không phải sửa luật chơi. Mọi phép trừ phải có số bị trừ không quá 10 và kết quả không âm.

#### Scenario: Màn có mục tiêu khác
- **WHEN** một màn được định nghĩa với N = 3 và các ô 6−3, 9−6, 5−1
- **THEN** đề bài đọc "bằng 3" và bảng hiển thị "Cần tìm: 2"
