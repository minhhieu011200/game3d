# Spec Delta

## Purpose

Trò chơi bài 4 (SGK Toán 1 tr.73, "Tìm phép tính thích hợp với mỗi hình"): một vườn thú 3D bán thực tế để học sinh nhìn, đếm và thao tác với các con vật, đồ vật, rồi tìm phép trừ phù hợp. Các tình huống bám theo SGK: 10−2 ếch, 10−5 cò, 10−3 nến.

## ADDED Requirements

### Requirement: Cảnh vườn thú
Cảnh SHALL là một vườn thú 3D bán thực tế, có cổng vào, lối đi, cây cỏ, bầu trời, một con sông có bờ, và các khu: khu ếch bên sông, khu cò, bàn nến, khu thú làm cảnh (ít nhất 2 loài khác). Khi bắt đầu, mỗi khu có 10 đối tượng đếm được.

#### Scenario: Vào vườn thú
- **WHEN** người dùng mở bài 4
- **THEN** camera đứng ở cổng vào nhìn vào vườn, và cảnh có đủ 10 con ếch trên bờ, 10 con cò, 10 ngọn nến đang cháy

### Requirement: Vùng đếm
Mỗi đối tượng SHALL thuộc đúng một vùng tại mọi thời điểm. Ếch có thể ở "trên bờ" hoặc "dưới sông". Cò có thể ở "trên mặt đất" hoặc "bay đi" (trên trời). Nến có thể "đang cháy" hoặc "đã tắt". Đối tượng đã xóa thì không thuộc vùng nào và không được đếm.

#### Scenario: Ếch thả xuống sông
- **WHEN** một con ếch được thả vào mặt nước sông
- **THEN** con ếch ở trong vùng "dưới sông", và số "trên bờ" giảm 1, số "dưới sông" tăng 1

### Requirement: Kéo thả đối tượng
Người dùng SHALL kéo được bất kỳ đối tượng đếm được nào bằng chuột hoặc cảm ứng. Thả lên vùng trời thì đối tượng bay lên và nằm ở vùng "trên trời". Thả xuống mặt sông thì đối tượng xuống nước. Thả lên mặt đất thì đối tượng đứng tại chỗ. Trong lúc kéo, camera không được xoay theo.

#### Scenario: Kéo cò lên trời
- **WHEN** người dùng kéo một con cò lên vùng trời rồi thả
- **THEN** con cò vỗ cánh bay lên trên cao và được đếm là "bay đi"

#### Scenario: Kéo ếch từ sông lên bờ
- **WHEN** người dùng kéo một con ếch đang ở dưới sông lên bờ
- **THEN** con ếch đứng trên bờ và được đếm lại vào "trên bờ"

### Requirement: Xóa và khôi phục
Người dùng SHALL xóa được một đối tượng bằng nút xóa hoặc thùng rác. Cũng phải có nút "Đặt lại" để đưa toàn bộ cảnh về trạng thái ban đầu.

#### Scenario: Xóa một con ếch
- **WHEN** người dùng xóa một con ếch trên bờ
- **THEN** con ếch biến mất và tổng số ếch giảm 1

#### Scenario: Đặt lại cảnh
- **WHEN** người dùng bấm "Đặt lại"
- **THEN** mọi khu trở về 10 đối tượng ở vị trí và trạng thái ban đầu

### Requirement: Thổi tắt nến
Bấm vào một ngọn nến đang cháy SHALL làm ngọn lửa tắt kèm hiệu ứng khói. Bấm vào nến đã tắt thì nến cháy lại.

#### Scenario: Tắt 3 ngọn nến
- **WHEN** người dùng bấm lần lượt vào 3 ngọn nến đang cháy
- **THEN** 3 ngọn lửa tắt, và số "đang cháy" là 7, số "đã tắt" là 3

### Requirement: Di chuyển và góc nhìn
Người dùng SHALL xem được cảnh từ nhiều góc khác nhau. Phải có danh sách điểm đến đặt sẵn: Cổng, Bờ sông, Khu cò, Bàn nến, Khu thú. Chọn một điểm thì camera bay mượt đến đó. Camera không được đi xuyên qua mặt đất.

#### Scenario: Đi đến bàn nến
- **WHEN** người dùng chọn điểm đến "Bàn nến"
- **THEN** camera di chuyển mượt đến trước bàn nến và nhìn vào các ngọn nến

### Requirement: Chế độ giáo viên
Ở chế độ giáo viên, người dùng SHALL đi lại tự do (phím WASD hoặc phím mũi tên để đi, kéo chuột để xoay nhìn, con lăn để phóng to/thu nhỏ). Bảng đếm và phép trừ mặc định ẩn, chỉ hiện khi bấm "Hiện đáp án".

#### Scenario: Giáo viên hiện đáp án
- **WHEN** ở chế độ giáo viên, đã có 2 con ếch dưới sông, và giáo viên bấm "Hiện đáp án" ở khu ếch
- **THEN** bảng hiện "Trên bờ: 8 · Dưới sông: 2 · Tất cả: 10" và phép tính "10 − 2 = 8"

### Requirement: Chế độ học sinh
Ở chế độ học sinh, việc di chuyển SHALL chỉ dùng biển chỉ đường hoặc nút điểm đến, không cần bàn phím. Máy giao lần lượt các nhiệm vụ bám SGK: cho 2 ếch xuống sông, cho 5 cò bay đi, thổi tắt 3 nến. Sau mỗi nhiệm vụ, máy hỏi số còn lại và cho chọn phép tính đúng trong 3 lựa chọn.

#### Scenario: Nhiệm vụ ếch
- **WHEN** máy giao "Hãy cho 2 bạn ếch nhảy xuống sông" và học sinh kéo đúng 2 con ếch xuống sông
- **THEN** máy hỏi "Trên bờ còn mấy bạn ếch?" và hiện 3 lựa chọn phép tính, trong đó có "10 − 2 = 8"

#### Scenario: Chọn sai phép tính
- **WHEN** học sinh chọn một phép tính sai trong 3 lựa chọn
- **THEN** máy phát lời động viên và cho chọn lại; khi chọn đúng thì khen rồi chuyển sang nhiệm vụ kế tiếp

#### Scenario: Làm thừa thao tác
- **WHEN** nhiệm vụ là cho 2 ếch xuống sông nhưng học sinh kéo 3 con xuống
- **THEN** máy nhắc "Nhiều quá rồi! Hãy kéo bớt 1 bạn ếch lên bờ nhé", và chưa chuyển sang câu hỏi cho đến khi dưới sông có đúng 2 con

### Requirement: Chuyển chế độ
Bài 4 SHALL có công tắc chuyển giữa chế độ "Giáo viên" và "Học sinh". Chuyển chế độ thì cảnh được đặt lại về trạng thái ban đầu.

#### Scenario: Chuyển sang học sinh
- **WHEN** người dùng chuyển từ "Giáo viên" sang "Học sinh"
- **THEN** cảnh được đặt lại, camera về Cổng và máy giao nhiệm vụ đầu tiên
