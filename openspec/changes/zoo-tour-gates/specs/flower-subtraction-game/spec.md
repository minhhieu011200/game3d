## Purpose

Trò chơi Bài 1 (SGK Toán 1 tập 1, trang 72, "Số?"). Giáo viên trình chiếu từng bước như PowerPoint: 6 bông hoa, bướm bay tới đậu làm bớt đi một số bông, rồi hiện phép tính và kết quả 6 − 1 … 6 − 5 để cả lớp cùng đếm.

## ADDED Requirements

### Requirement: Bộ câu hỏi
Trò chơi SHALL lần lượt trình chiếu 6 − 1, 6 − 2, 6 − 3, 6 − 4, 6 − 5. Bộ câu hỏi được định nghĩa bằng dữ liệu. Câu 6 − 1 là câu mẫu, được đánh dấu "Mẫu" khi phép tính hiện ra. Màn chơi ghi "Câu x / 5" kèm 5 chấm tiến độ.

#### Scenario: Bắt đầu Bài 1
- **WHEN** giáo viên mở Bài 1
- **THEN** màn hình ghi "Câu 1 / 5" và hiện 6 bông hoa vàng, chưa có bướm và chưa có phép tính

### Requirement: Trình chiếu từng bước
Mỗi câu 6 − k SHALL đi qua 4 bước, mỗi lần giáo viên bấm thì sang bước sau:
1. Một hàng 6 bông hoa vàng, giống hình trong SGK.
2. Bướm bay tới đậu vào k bông cuối hàng, các bông đó chuyển đỏ.
3. Phép tính hiện ra dạng "6 − k = ?", chữ to, ô "?" có viền giống ô điền số trong sách.
4. Ô "?" hiện kết quả.

Bấm ở bước 4 thì sang câu sau, và câu vừa xong hiện lại thành một dòng nhỏ (hoa và phép tính) như trong sách. Học sinh không bấm chọn hoa hay chọn đáp án. Chỗ của phép tính luôn được giữ sẵn để hàng hoa không bị đẩy lên khi phép tính hiện ra.

#### Scenario: Đi hết các bước câu 6 − 2
- **WHEN** câu hiện tại là 6 − 2 ở bước 1 và giáo viên bấm 3 lần
- **THEN** lần lượt bướm đậu vào 2 bông cuối hàng (2 bông chuyển đỏ), phép tính "6 − 2 = ?" hiện ra, rồi ô "?" hiện "4"

#### Scenario: Sang câu sau
- **WHEN** câu 6 − 2 đang ở bước 4 và giáo viên bấm thêm một lần
- **THEN** màn chơi chuyển sang câu 6 − 3 với 6 bông vàng, và dòng "6 − 2 = 4" có hoa hiện ở danh sách câu đã xong

### Requirement: Bấm tiếp như PowerPoint
Giáo viên SHALL sang bước tiếp theo bằng cách bấm chuột hoặc chạm vào bất kỳ chỗ nào trên màn chơi, hoặc bấm một trong các phím Mũi tên phải, Mũi tên xuống, Page Down, Space, Enter (như nút "Next" của bút trình chiếu). Khi đang đứng ở một nút bấm thì phím Space và Enter bấm chính nút đó, không tính là "tiếp".

#### Scenario: Dùng bút trình chiếu
- **WHEN** câu đang ở bước 1 và giáo viên bấm phím Page Down
- **THEN** bướm bay tới đậu vào các bông cần bớt

### Requirement: Kết thúc bài
Bấm ở bước 4 của câu cuối thì trò chơi SHALL kết thúc. Khi chơi riêng lẻ, màn "Hoàn thành Vườn Hoa!" hiện đủ 5 dòng, mỗi dòng gồm 6 bông hoa vàng/đỏ và phép tính đã điền, giống trang sách, cùng nút "Chơi lại". Khi trò chơi được mở từ một cổng tham quan, màn này không hiện; thay vào đó là popup bảng phép tính của cổng (xem zoo-tour) có cùng 5 dòng hoa.

#### Scenario: Hoàn thành khi chơi riêng lẻ
- **WHEN** câu 6 − 5 đang ở bước 4 và giáo viên bấm thêm một lần
- **THEN** màn "Hoàn thành Vườn Hoa!" hiện 5 dòng từ 6 − 1 = 5 tới 6 − 5 = 1 có hoa, và có nút "Chơi lại"

#### Scenario: Bấm trong màn hoàn thành
- **WHEN** màn "Hoàn thành Vườn Hoa!" đang hiện và giáo viên bấm vào bảng
- **THEN** bảng vẫn giữ nguyên, không bị tính là bấm "tiếp"

### Requirement: Dùng được trên máy chiếu
Hoa, bướm và phép tính SHALL đủ to để cả lớp nhìn rõ trên màn chiếu. Trò chơi chạy được ở độ phân giải 1280×720 mà không phải cuộn trang.

#### Scenario: Màn hình 1280×720
- **WHEN** mở Bài 1 trên màn hình 1280×720 và đi tới bước 4 của câu 6 − 5
- **THEN** cả 6 bông hoa, phép tính và danh sách các câu đã xong đều hiện đủ, không cần cuộn trang
