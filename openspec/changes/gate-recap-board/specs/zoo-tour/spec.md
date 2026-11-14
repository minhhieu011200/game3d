# Spec Delta

## ADDED Requirements

### Requirement: Popup bảng phép tính của cổng
Khi trò chơi mở từ một cổng, màn chơi SHALL hiện popup bảng phép tính của bài ngay khi trò chơi kết thúc. Popup cũng hiện khi giáo viên bấm "Qua cổng" ở dải cổng lúc chưa chơi xong. Popup có tên và số của cổng, và luôn có đủ phép tính của bài, chữ to. Phép đã làm xong ghi kết quả nổi bật kèm dấu ✔. Phép chưa làm ghi "a − b = ?", màu mờ. Popup không đọc thành tiếng. Popup có nút "Qua cổng" và nút đóng popup để quay lại trò chơi. Màn đường đi MUST NOT hiện bảng này.

#### Scenario: Chơi xong Cổng 2
- **WHEN** học sinh làm xong cả 5 câu Bài 1 ở Cổng 2
- **THEN** popup "Cùng đọc lại các phép tính!" hiện ngay trên màn chơi với 5 dòng 6 − 1 = 5, 6 − 2 = 4, 6 − 3 = 3, 6 − 4 = 2, 6 − 5 = 1, dòng nào cũng có ✔

#### Scenario: Bấm Qua cổng khi mới làm 2 câu
- **WHEN** Bài 3 mới đúng câu 9 − 1 và 9 − 2, và giáo viên bấm "Qua cổng" ở dải cổng
- **THEN** popup hiện đủ 8 dòng: "9 − 1 = 8 ✔", "9 − 2 = 7 ✔", và 6 dòng mờ từ "9 − 3 = ?" tới "9 − 8 = ?"; cổng chưa được đánh dấu đã qua

#### Scenario: Đóng popup để chơi tiếp
- **WHEN** popup đang hiện lúc chưa chơi xong và giáo viên bấm "Chơi tiếp"
- **THEN** popup đóng lại và học sinh chơi tiếp từ câu đang làm

#### Scenario: Chưa có câu nào được làm
- **WHEN** giáo viên bấm "Qua cổng" ở dải cổng khi trò chơi chưa có câu nào được làm
- **THEN** popup vẫn ghi đủ phép tính của bài, tất cả đều ở dạng "a − b = ?" màu mờ

#### Scenario: Bảng của Cổng 4
- **WHEN** học sinh làm xong cả 3 nhiệm vụ Bài 4
- **THEN** popup có 3 dòng "🐸 10 − 2 = 8 ✔", "🕊️ 10 − 5 = 5 ✔", "🕯️ 10 − 3 = 7 ✔"

#### Scenario: Không có giọng đọc
- **WHEN** popup bảng phép tính hiện ra
- **THEN** không phát câu đọc nào cho các phép tính trên popup

### Requirement: Bảng phép tính của Cổng 3
Bảng của Cổng 3 SHALL ghi cả 7 ô của làn theo đúng thứ tự thỏ đi, kèm số mục tiêu của làn ("bằng N"). Ô thỏ đã nhảy qua ghi kết quả; ô có kết quả bằng mục tiêu được tô nổi bật và có 🥕. Ô thỏ chưa tới ghi "a − b = ?", màu mờ. Chơi 2 đội thì bảng có 2 cột "Đội Đỏ" và "Đội Xanh", mỗi cột ghi 7 ô và số mục tiêu của làn đội đó.

#### Scenario: Một người chơi xong
- **WHEN** ở chế độ 1 người, mục tiêu 4, thỏ đã tới hàng rào cà rốt
- **THEN** popup ghi "bằng 4" và 7 dòng có kết quả; các dòng có kết quả bằng 4 được tô nổi bật và có 🥕

#### Scenario: Hai đội, một đội chưa về đích
- **WHEN** ở chế độ 2 đội, Đội Đỏ đã về đích, Đội Xanh mới qua 3 ô, và giáo viên bấm "Qua cổng" ở dải cổng
- **THEN** cột Đội Đỏ có đủ 7 kết quả, cột Đội Xanh có 3 dòng có kết quả và 4 dòng "a − b = ?" màu mờ, và popup vừa màn 1280×720 không phải cuộn

#### Scenario: Thỏ vừa trả lời nhầm
- **WHEN** thỏ đã qua 2 ô, trả lời nhầm ở ô thứ 3, rồi giáo viên bấm "Qua cổng" ở dải cổng
- **THEN** 2 ô đầu của làn ghi kết quả, ô thứ 3 và các ô sau ghi "a − b = ?" màu mờ

## MODIFIED Requirements

### Requirement: Qua cổng
Khi trò chơi của cổng kết thúc, màn kết thúc SHALL có nút "Qua cổng". Trong lúc đang chơi, giáo viên cũng luôn bấm được "Qua cổng" ở dải cổng mà không cần chơi hết; nút này mở popup bảng phép tính trước, và nút "Qua cổng" trong popup mới qua cổng. Qua cổng thì trở lại màn đường đi, cổng đó mở ra và được đánh dấu đã qua, rồi bạn nhỏ đi luôn qua cổng tới đứng trước cổng kế tiếp (sau Cổng 4 là Quảng Trường Huy Hiệu), không cần bấm "Đi tiếp".

#### Scenario: Chơi xong rồi qua cổng
- **WHEN** học sinh hoàn thành Bài 1 ở Cổng 2 và giáo viên bấm "Qua cổng" trong popup bảng phép tính
- **THEN** màn đường đi hiện lại, Cổng 2 mở ra và có dấu đã qua, bạn nhỏ đi qua cổng rồi dừng trước Cổng 3, và Vẹt Xanh đọc lời dẫn của Cổng 3

#### Scenario: Qua cổng khi chưa chơi xong
- **WHEN** giáo viên bấm "Qua cổng" ở dải cổng lúc Bài 3 mới làm được 2 câu, rồi bấm "Qua cổng" trong popup
- **THEN** ứng dụng tắt camera, trở lại màn đường đi, và Cổng 1 được đánh dấu đã qua
