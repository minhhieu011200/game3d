# bunny-carrot-game Specification

## Purpose

Trò chơi bài 2 (SGK Toán 1 tr.72): học sinh giúp chú thỏ nhảy tìm cà rốt bằng cách chọn các phép trừ có kết quả bằng giá trị mục tiêu. Mục tiêu là luyện nhận biết kết quả phép trừ trong phạm vi 10.

## Requirements

### Requirement: Bố cục màn chơi
Màn chơi SHALL là cảnh 2D trên nền đồng cỏ, có trời và bụi cây phía sau. Mỗi làn có vạch xuất phát với thỏ, một hàng ô hình bàn chân ghi phép trừ, và hàng rào cà rốt chung ở cuối các làn. Cà rốt MUST chỉ xuất hiện ở hàng rào đích, không cắm dọc đường. Cảnh MUST NOT có suối, đá phía trước hay khối gỗ ở chỗ xuất phát. Phía trên có đề bài "Tìm phép trừ có kết quả bằng N".

#### Scenario: Mở màn chơi mặc định
- **WHEN** học sinh vào Bài 2
- **THEN** màn chơi hiện một làn 7 ô phép trừ với mục tiêu N = 4, thỏ đứng ở vạch xuất phát, cà rốt chỉ có ở hàng rào cuối làn, và đề bài "Tìm phép trừ có kết quả bằng 4" hiện phía trên

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
- **THEN** thỏ nhảy lên ô 8−4, ô sáng xanh, điểm cà rốt tăng 1

#### Scenario: Bấm Sai ở ô 6−3
- **WHEN** ô trước mặt thỏ là 6−3, mục tiêu là 4, và học sinh bấm Sai
- **THEN** thỏ nhảy lên ô 6−3, ô hiện "6 − 3 = 3" và được đánh dấu đã qua, điểm cà rốt không đổi

### Requirement: Chọn ô sai
Khi câu trả lời không khớp với ô (Đúng khi kết quả khác N, hoặc Sai khi kết quả bằng N), ô đó SHALL báo nhầm (rung và đỏ), thỏ rung tại chỗ và đứng yên ở ô đang đứng (MUST NOT về vạch xuất phát). Các ô đã qua và điểm cà rốt của làn giữ nguyên, và số lần nhầm tăng 1. Học sinh trả lời lại chính ô vừa nhầm.

#### Scenario: Chọn 6−3 sau khi đã tìm 2 ô
- **WHEN** thỏ đã qua ô 5−1 và ô 9−6, ô trước mặt là 6−3, mục tiêu là 4, và học sinh bấm Đúng
- **THEN** ô 6−3 rung đỏ, thỏ vẫn đứng ở ô 9−6, ô 5−1 và 9−6 vẫn đánh dấu đã qua, và điểm cà rốt giữ nguyên

#### Scenario: Bấm Sai ở ô bằng mục tiêu
- **WHEN** ô trước mặt là 7−3, mục tiêu là 4, và học sinh bấm Sai
- **THEN** ô 7−3 rung đỏ, thỏ đứng tại chỗ, và ô trước mặt vẫn là 7−3

#### Scenario: Chọn đúng sau khi sai
- **WHEN** thỏ vừa nhầm ở ô 6−3 (đang đứng ở ô 9−6), mục tiêu là 4, và học sinh bấm Sai
- **THEN** thỏ nhảy từ ô 9−6 lên ô 6−3, ô hiện "6 − 3 = 3"

### Requirement: Không nhận thao tác trong lúc thỏ đang nhảy
Trong lúc thỏ của một làn đang nhảy, đang rung vì nhầm hoặc đã về đích, làn đó SHALL bỏ qua mọi lần bấm Đúng hoặc Sai. Làn của đội kia không bị ảnh hưởng.

#### Scenario: Bấm liên tục
- **WHEN** học sinh bấm Đúng rồi bấm tiếp Sai trong lúc thỏ chưa nhảy xong
- **THEN** chỉ lần bấm đầu được xử lý

#### Scenario: Đội kia đang nhảy
- **WHEN** thỏ của Đội Đỏ đang nhảy và Đội Xanh bấm Đúng trên làn của mình
- **THEN** câu trả lời của Đội Xanh vẫn được xử lý

### Requirement: Hoàn thành màn chơi
Khi thỏ trả lời đúng ô cuối cùng của làn, thỏ SHALL nhảy lên ô đó rồi nhảy vào hàng rào cà rốt. Ở chế độ 1 người, màn chơi sau đó hiện màn chúc mừng gồm số cà rốt đã nhặt, số lần nhầm, thời gian chơi và nút "Chơi màn mới". Kết thúc ở chế độ 2 đội theo yêu cầu "Đội về đích trước thắng". Khi trò chơi được mở từ một cổng tham quan, màn chúc mừng và màn đội thắng không hiện; thay vào đó là popup bảng phép tính của cổng (xem zoo-tour).

#### Scenario: Tìm đủ ô
- **WHEN** ở chế độ 1 người, học sinh trả lời đúng ô thứ 7
- **THEN** thỏ nhảy vào hàng rào cà rốt, màn chúc mừng hiện ra

#### Scenario: Chơi lại
- **WHEN** học sinh bấm "Chơi màn mới"
- **THEN** một màn mới cùng chế độ và cùng mục tiêu bắt đầu, điểm về 0, mọi ô chưa trả lời và thỏ ở vạch xuất phát

### Requirement: Màn chơi cấu hình được
Bộ ô phép trừ và giá trị mục tiêu N SHALL được định nghĩa bằng dữ liệu, để thêm màn mới không phải sửa luật chơi. Mọi phép trừ phải có số bị trừ không quá 10 và kết quả không âm.

#### Scenario: Màn có mục tiêu khác
- **WHEN** một màn được định nghĩa với N = 3 và các ô 6−3, 9−6, 5−1
- **THEN** đề bài ghi "bằng 3" và bảng hiển thị "Cần tìm: 2"

### Requirement: Chọn chế độ chơi
Màn chơi SHALL có hai nút chọn chế độ "1 người" và "2 đội". Mặc định là "1 người". Đổi chế độ thì bắt đầu màn mới với số mục tiêu đang chọn. Chế độ 2 đội dùng tên cố định "Đội Đỏ" và "Đội Xanh", không có chỗ nhập tên.

#### Scenario: Vào bài lần đầu
- **WHEN** học sinh vào Bài 2
- **THEN** màn chơi ở chế độ "1 người", có một làn và một con thỏ

#### Scenario: Chuyển sang 2 đội
- **WHEN** giáo viên bấm nút "2 đội"
- **THEN** màn chơi bắt đầu lại với hai làn, thỏ của Đội Đỏ và thỏ của Đội Xanh đều ở vạch xuất phát, và cả hai đội đều trả lời được ngay

### Requirement: Hai đội chơi cùng lúc
Ở chế độ 2 đội, hai đội SHALL chơi cùng lúc, không chia lượt: mỗi đội chỉ bấm được nút Đúng và Sai trên làn của mình. Mỗi làn có đồng hồ bấm giờ riêng, chạy từ đầu màn tới khi thỏ của làn đó vào hàng rào cà rốt.

#### Scenario: Hai đội cùng trả lời
- **WHEN** Đội Đỏ và Đội Xanh lần lượt bấm Đúng ở ô trước mặt thỏ của mình, ô nào cũng bằng mục tiêu của làn đó
- **THEN** cả hai con thỏ đều nhảy lên ô của mình

#### Scenario: Một đội nhầm
- **WHEN** Đội Xanh trả lời nhầm
- **THEN** thỏ xanh rung tại chỗ và đứng yên ở ô đang đứng; thỏ đỏ và làn Đội Đỏ không bị ảnh hưởng

### Requirement: Đội về đích trước thắng
Ở chế độ 2 đội, đội có thỏ vào tới hàng rào cà rốt trước SHALL là đội thắng. Đội về sau vẫn chơi tiếp tới đích. Khi cả hai thỏ đã về đích, màn kết thúc hiện "<tên đội> thắng!" và bảng xếp hạng: hạng (🥇, 🥈), tên đội, số mục tiêu, thời gian và số lần nhầm của mỗi đội, cùng nút "Chơi màn mới".

#### Scenario: Đội Xanh về đích trước
- **WHEN** thỏ của Đội Xanh vào hàng rào cà rốt trước, rồi thỏ của Đội Đỏ cũng về đích
- **THEN** màn chơi hiện "Đội Xanh thắng!", Đội Xanh ở hạng 🥇 và Đội Đỏ ở hạng 🥈, mỗi đội kèm thời gian và số lần nhầm

### Requirement: Mỗi đội một số mục tiêu
Ở chế độ 2 đội, mỗi làn SHALL có nút chọn số mục tiêu riêng (2 đến 9), nên hai đội có thể tìm hai số khác nhau. Đề bài phía trên ghi "Đội Đỏ tìm bằng N₁" và "Đội Xanh tìm bằng N₂". Hai làn có cùng số ô (7 ô). Nếu hai đội chọn cùng một số, hai làn MUST NOT có cùng một dãy phép tính theo đúng thứ tự, để đội này không chép được câu trả lời của đội kia.

#### Scenario: Hai đội chọn số khác nhau
- **WHEN** đang chơi 2 đội, giáo viên chọn số 3 ở làn Đội Đỏ và số 6 ở làn Đội Xanh
- **THEN** màn mới bắt đầu, làn đỏ tìm phép trừ bằng 3, làn xanh tìm phép trừ bằng 6, cả hai làn đều có 7 ô

#### Scenario: Hai đội cùng số
- **WHEN** bắt đầu một màn 2 đội mà cả hai làn đều có mục tiêu 4
- **THEN** cả hai làn đều có 7 ô, cùng số ô bằng 4, và dãy phép tính của hai làn khác nhau

### Requirement: Chọn số mục tiêu và màn mới
Màn chơi SHALL có nút "Màn mới". Ở chế độ 1 người, màn chơi có các nút "Chọn số" từ 2 đến 9 cho làn duy nhất. Bấm một số hoặc bấm "Màn mới" thì sinh màn mới, giữ nguyên chế độ đang chơi. Mọi thỏ trở về vạch xuất phát, đồng hồ chạy lại từ 0 và đề bài ghi số mục tiêu mới.

#### Scenario: Đổi mục tiêu khi chơi 1 người
- **WHEN** đang chơi 1 người và giáo viên bấm số 6
- **THEN** màn mới với mục tiêu 6 bắt đầu, thỏ ở vạch xuất phát và đề bài ghi "Tìm phép trừ có kết quả bằng 6"

### Requirement: Hình hoạt hình đóng gói sẵn
Thỏ, cà rốt và hàng rào SHALL là hình hoạt hình có giấy phép tự do (CC0 hoặc tương đương, không giới hạn phi thương mại), đóng gói kèm ứng dụng và không tải từ mạng. Ở chế độ 2 đội, hai con thỏ MUST phân biệt được bằng màu đỏ và màu xanh của đội. Mỗi hình bên thứ ba SHALL được ghi tên tác giả, giấy phép và nguồn ở trang "Giới thiệu".

#### Scenario: Máy không có mạng
- **WHEN** máy không có mạng và học sinh mở Bài 2
- **THEN** thỏ, cà rốt, hàng rào và nền cỏ đều hiển thị đầy đủ

#### Scenario: Xem nguồn hình
- **WHEN** người dùng mở trang "Giới thiệu"
- **THEN** trang liệt kê hình thỏ và hình cà rốt kèm tác giả, giấy phép và nguồn
