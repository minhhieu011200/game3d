# bunny-carrot-game Specification

## Purpose

Trò chơi bài 2 (SGK Toán 1 tr.72): học sinh giúp chú thỏ nhảy tìm cà rốt bằng cách chọn các phép trừ có kết quả bằng giá trị mục tiêu. Mục tiêu là luyện nhận biết kết quả phép trừ trong phạm vi 10.

## Requirements

### Requirement: Bố cục màn chơi
Màn chơi SHALL là cảnh 2D trên nền đồng cỏ, có trời và bụi cây phía sau. Mỗi làn có vạch xuất phát với thỏ, một hàng ô hình bàn chân ghi phép trừ, và hàng rào cà rốt chung ở cuối các làn. Cà rốt MUST chỉ xuất hiện ở hàng rào đích, không cắm dọc đường. Cảnh MUST NOT có suối, đá phía trước hay khối gỗ ở chỗ xuất phát. Phía trên có đề bài "Tìm phép trừ có kết quả bằng N".

#### Scenario: Mở màn chơi mặc định
- **WHEN** học sinh vào Bài 2
- **THEN** màn chơi hiện một làn 7 ô phép trừ với mục tiêu N = 4, thỏ đứng ở vạch xuất phát, cà rốt chỉ có ở hàng rào cuối làn, và giọng đọc đọc đề bài

#### Scenario: Màn chơi 2 đội
- **WHEN** màn chơi ở chế độ 2 đội
- **THEN** hai làn nằm song song, làn trên của Đội Đỏ và làn dưới của Đội Xanh. Cả hai làn kết thúc ở cùng một hàng rào cà rốt

### Requirement: Số ô cần tìm tính từ dữ liệu
Số cà rốt cần nhặt K của mỗi làn SHALL bằng đúng số ô có kết quả bằng N trên làn đó. K MUST NOT được ghi cố định. Bảng điểm của mỗi làn hiện "Cà rốt: x/K", trong đó x là số ô đúng thỏ đã nhảy qua trong lượt đi hiện tại.

#### Scenario: Bộ ô mặc định
- **WHEN** một làn có 7 ô, trong đó 4 ô có kết quả bằng N
- **THEN** bảng điểm của làn đó hiển thị "Cà rốt: 0/4" lúc bắt đầu

### Requirement: Chọn ô đúng
Ô kế tiếp trước mặt thỏ SHALL phát sáng, hỏi "Bằng N?", và có hai nút **Đúng** và **Sai** ngay cạnh ô. Học sinh chỉ trả lời được cho ô này, không nhảy cóc. Nếu câu trả lời khớp với ô (Đúng khi kết quả bằng N, Sai khi khác N), thỏ nhảy lên ô đó. Ô bằng N thì sáng xanh và tăng điểm cà rốt; ô khác N thì hiện kết quả và đánh dấu đã qua. Màn chơi không có nút "Bỏ qua".

#### Scenario: Chọn 8−4
- **WHEN** ô trước mặt thỏ là 8−4, mục tiêu là 4, và học sinh bấm Đúng
- **THEN** thỏ nhảy lên ô 8−4, ô sáng xanh, điểm cà rốt tăng 1 và giọng đọc phát lời khen

#### Scenario: Bấm Sai ở ô 6−3
- **WHEN** ô trước mặt thỏ là 6−3, mục tiêu là 4, và học sinh bấm Sai
- **THEN** thỏ nhảy lên ô 6−3, ô hiện "6 − 3 = 3" và được đánh dấu đã qua, điểm cà rốt không đổi

### Requirement: Chọn ô sai
Khi câu trả lời không khớp với ô (Đúng khi kết quả khác N, hoặc Sai khi kết quả bằng N), ô đó SHALL báo nhầm (rung và đỏ), thỏ về vạch xuất phát, và mọi ô trên làn trở về trạng thái chưa trả lời. Điểm cà rốt của làn về 0 và giọng đọc phát lời động viên.

#### Scenario: Chọn 6−3 sau khi đã tìm 2 ô
- **WHEN** thỏ đã qua ô 5−1 và ô 9−6, ô trước mặt là 6−3, mục tiêu là 4, và học sinh bấm Đúng
- **THEN** ô 6−3 rung đỏ, thỏ nhảy về vạch xuất phát, ô 5−1 và 9−6 trở về chưa trả lời, điểm cà rốt về 0, và giọng đọc phát lời động viên

#### Scenario: Bấm Sai ở ô bằng mục tiêu
- **WHEN** ô trước mặt là 7−3, mục tiêu là 4, và học sinh bấm Sai
- **THEN** ô 7−3 rung đỏ và thỏ về vạch xuất phát

#### Scenario: Chọn đúng sau khi sai
- **WHEN** thỏ vừa về vạch xuất phát sau một lần nhầm, ô đầu tiên của làn là 5−1, mục tiêu là 4, và học sinh bấm Đúng
- **THEN** thỏ nhảy từ vạch xuất phát lên ô 5−1

### Requirement: Không nhận thao tác trong lúc thỏ đang nhảy
Trong lúc bất kỳ con thỏ nào đang nhảy, màn chơi SHALL bỏ qua mọi lần bấm Đúng hoặc Sai, kể cả trên làn khác.

#### Scenario: Bấm liên tục
- **WHEN** học sinh bấm Đúng rồi bấm tiếp Sai trong lúc thỏ chưa nhảy xong
- **THEN** chỉ lần bấm đầu được xử lý

### Requirement: Hoàn thành màn chơi
Khi thỏ trả lời đúng ô cuối cùng của làn, thỏ SHALL nhảy lên ô đó rồi nhảy vào hàng rào cà rốt. Ở chế độ 1 người, màn chơi sau đó hiện màn chúc mừng gồm số cà rốt đã nhặt, số lần nhầm và nút "Chơi màn mới". Kết thúc ở chế độ 2 đội theo yêu cầu "Đội về đích trước thắng".

#### Scenario: Tìm đủ ô
- **WHEN** ở chế độ 1 người, học sinh trả lời đúng ô thứ 7
- **THEN** thỏ nhảy vào hàng rào cà rốt, màn chúc mừng hiện ra và giọng đọc phát lời khen

#### Scenario: Chơi lại
- **WHEN** học sinh bấm "Chơi màn mới"
- **THEN** một màn mới cùng chế độ và cùng mục tiêu bắt đầu, điểm về 0, mọi ô chưa trả lời và thỏ ở vạch xuất phát

### Requirement: Màn chơi cấu hình được
Bộ ô phép trừ và giá trị mục tiêu N SHALL được định nghĩa bằng dữ liệu, để thêm màn mới không phải sửa luật chơi. Mọi phép trừ phải có số bị trừ không quá 10 và kết quả không âm.

#### Scenario: Màn có mục tiêu khác
- **WHEN** một màn được định nghĩa với N = 3 và các ô 6−3, 9−6, 5−1
- **THEN** đề bài đọc "bằng 3" và bảng hiển thị "Cần tìm: 2"

### Requirement: Chọn chế độ chơi
Màn chơi SHALL có hai nút chọn chế độ "1 người" và "2 đội". Mặc định là "1 người". Đổi chế độ thì bắt đầu màn mới với số mục tiêu đang chọn. Chế độ 2 đội dùng tên cố định "Đội Đỏ" và "Đội Xanh", không có chỗ nhập tên.

#### Scenario: Vào bài lần đầu
- **WHEN** học sinh vào Bài 2
- **THEN** màn chơi ở chế độ "1 người", có một làn và một con thỏ

#### Scenario: Chuyển sang 2 đội
- **WHEN** giáo viên bấm nút "2 đội"
- **THEN** màn chơi bắt đầu lại với hai làn, thỏ của Đội Đỏ và thỏ của Đội Xanh đều ở vạch xuất phát, và lượt đầu tiên thuộc về Đội Đỏ

### Requirement: Thay phiên lượt giữa hai đội
Ở chế độ 2 đội, màn chơi SHALL hiển thị rõ đội nào đang có lượt và chỉ nhận câu trả lời cho làn của đội đó. Sau mỗi câu trả lời, dù đúng hay sai, lượt chuyển sang đội kia khi thỏ nhảy xong. Mỗi lần đổi lượt, giọng đọc báo "Đến lượt, đội Đỏ" hoặc "Đến lượt, đội Xanh".

#### Scenario: Đúng xong vẫn đổi lượt
- **WHEN** đang là lượt Đội Đỏ và Đội Đỏ trả lời đúng ô trước mặt
- **THEN** thỏ đỏ nhảy lên ô đó, nhảy xong thì lượt chuyển sang Đội Xanh

#### Scenario: Sai xong đổi lượt
- **WHEN** đang là lượt Đội Xanh và Đội Xanh trả lời nhầm
- **THEN** thỏ xanh về vạch xuất phát, rồi lượt chuyển sang Đội Đỏ

#### Scenario: Bấm vào làn không có lượt
- **WHEN** đang là lượt Đội Đỏ và có người bấm nút Đúng hoặc Sai trên làn Đội Xanh
- **THEN** không có gì thay đổi. Nút Đúng và Sai của làn không có lượt bị ẩn hoặc làm mờ

### Requirement: Đội về đích trước thắng
Ở chế độ 2 đội, đội đầu tiên có thỏ vào tới hàng rào cà rốt SHALL thắng ngay, và màn chơi kết thúc. Đội kia không được thêm lượt. Màn kết thúc ghi tên đội thắng, phát lời chúc mừng đội thắng và có nút chơi màn mới.

#### Scenario: Đội Xanh về đích trước
- **WHEN** thỏ của Đội Xanh qua ô cuối cùng và nhảy vào hàng rào cà rốt, trong khi thỏ của Đội Đỏ còn trên đường
- **THEN** màn chơi hiện "Đội Xanh thắng!", phát câu "Đội Xanh thắng rồi!", và mọi nút Đúng, Sai đều ngừng nhận thao tác

### Requirement: Hai làn cân bằng nhưng khác nhau
Ở chế độ 2 đội, hai làn SHALL có cùng số mục tiêu, cùng số ô và cùng số ô đúng. Hai làn MUST NOT có cùng một dãy phép tính theo đúng thứ tự, để đội đi sau không chép được câu trả lời của đội trước.

#### Scenario: Sinh màn 2 đội
- **WHEN** bắt đầu một màn 2 đội với mục tiêu 4
- **THEN** cả hai làn đều có 7 ô, đều có cùng số ô bằng 4, và dãy phép tính của hai làn khác nhau

### Requirement: Chọn số mục tiêu và màn mới
Màn chơi SHALL có các nút chọn số mục tiêu từ 2 đến 9 và nút "Màn mới". Bấm một số hoặc bấm "Màn mới" thì sinh màn mới, giữ nguyên chế độ đang chơi. Mọi thỏ trở về vạch xuất phát và giọng đọc đọc đề bài với số mục tiêu mới.

#### Scenario: Đổi mục tiêu khi đang chơi 2 đội
- **WHEN** đang chơi 2 đội và giáo viên bấm số 6
- **THEN** màn mới 2 đội với mục tiêu 6 bắt đầu, cả hai thỏ ở vạch xuất phát và lượt thuộc về Đội Đỏ

### Requirement: Hình hoạt hình đóng gói sẵn
Thỏ, cà rốt và hàng rào SHALL là hình hoạt hình có giấy phép tự do (CC0 hoặc tương đương, không giới hạn phi thương mại), đóng gói kèm ứng dụng và không tải từ mạng. Ở chế độ 2 đội, hai con thỏ MUST phân biệt được bằng màu đỏ và màu xanh của đội. Mỗi hình bên thứ ba SHALL được ghi tên tác giả, giấy phép và nguồn ở trang "Giới thiệu".

#### Scenario: Máy không có mạng
- **WHEN** máy không có mạng và học sinh mở Bài 2
- **THEN** thỏ, cà rốt, hàng rào và nền cỏ đều hiển thị đầy đủ

#### Scenario: Xem nguồn hình
- **WHEN** người dùng mở trang "Giới thiệu"
- **THEN** trang liệt kê hình thỏ và hình cà rốt kèm tác giả, giấy phép và nguồn
