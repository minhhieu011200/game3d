## ADDED Requirements

### Requirement: Phong cách hình ảnh dễ đếm
Cảnh SHALL vẽ theo phong cách hoạt hình 3D phong cách hóa:
- Bóng đổ chuyển mềm giữa các mảng sáng tối và có ánh sáng viền.
- Có viền tối quanh các vật cần đếm (ếch, cò, nến), các con thú làm cảnh, thuyền và người trên thuyền.
- Cây cối, công trình, bướm, trời, sông và mặt đất không có viền.
- Mỗi vật cần đếm phải có màu tương phản rõ với nền ngay phía sau nó.

#### Scenario: Ếch nổi bật trên cỏ
- **WHEN** người dùng nhìn khu ếch từ thuyền đậu ở bến ếch
- **THEN** cả 10 con ếch có viền và màu thân khác hẳn màu cỏ quanh chúng, đủ để đếm từng con

#### Scenario: Cò nổi bật trên trời
- **WHEN** một con cò đang ở vùng "bay đi" trên trời
- **THEN** con cò có viền và vẫn tách rõ khỏi màu trời phía sau

#### Scenario: Cây không có viền
- **WHEN** người dùng nhìn một cái cây hoặc cổng vườn thú
- **THEN** vật đó không có viền

### Requirement: Viền ở chất lượng thấp
Khi đặt chất lượng đồ họa thấp, cảnh SHALL vẫn giữ viền và bóng toon mềm cho mọi vật có viền. Được phép tắt bóng đổ và hạt hiệu ứng.

#### Scenario: Chất lượng thấp
- **WHEN** người dùng chọn chất lượng đồ họa thấp và mở Bài 4
- **THEN** ếch, cò và nến vẫn có viền

### Requirement: Phản hồi hình ảnh khi thao tác
Mỗi vật kéo được SHALL sáng lên nhẹ khi được rê chuột hoặc chạm vào. Vật SHALL co giãn khi được nhấc lên và khi được thả xuống. Ngoài ra còn có hạt hiệu ứng theo hành động: nước tóe khi ếch xuống sông, lông bay khi cò cất cánh, khói xoắn khi nến tắt. Ở chất lượng thấp được phép bỏ hạt hiệu ứng, nhưng vẫn giữ hiệu ứng sáng lên và co giãn.

#### Scenario: Ếch xuống sông
- **WHEN** người dùng thả một con ếch xuống mặt sông
- **THEN** con ếch co giãn lúc chạm nước và có nước tóe lên tại chỗ thả

#### Scenario: Rê chuột vào cò
- **WHEN** người dùng rê chuột lên một con cò
- **THEN** con cò sáng lên nhẹ để báo là kéo được

### Requirement: Hoạt cảnh khi đứng yên
Các con vật SHALL có cử động nhỏ, ngẫu nhiên khi không bị kéo, như nhún, nhảy nhẹ hay chớp mắt. Cử động không được làm vật rời khỏi vùng đếm của nó.

#### Scenario: Ếch đứng yên trên bờ
- **WHEN** không ai thao tác trong vài giây
- **THEN** các con ếch thỉnh thoảng chớp mắt hoặc nhún nhẹ và vẫn được đếm "trên bờ"

### Requirement: Vòng quay nến
Khu nến SHALL là một vòng quay ở bến nến bên bờ sông, mặt hướng ra sông, có đúng 10 cabin. Cabin treo luôn thẳng đứng, nên ngọn lửa không bao giờ bị lật. Lúc bắt đầu, mỗi cabin có một ngọn nến đang cháy. Cabin đầu tiên SHALL khác hẳn các cabin còn lại (màu đỏ, có ngôi sao) để làm mốc khi đếm. Biển khu ghi "🎡 Vòng quay".

#### Scenario: Vào khu nến
- **WHEN** thuyền cập bến nến
- **THEN** người dùng thấy vòng quay 10 cabin, mỗi cabin một ngọn nến đang cháy, và cabin ngôi sao

### Requirement: Vòng quay quay và dừng
Vòng quay SHALL quay chậm khi không có nhiệm vụ nến, và giảm tốc mượt để dừng ở góc "nhà" (cabin ngôi sao luôn ở cùng một chỗ) khi có một trong các việc sau:
- nhiệm vụ nến bắt đầu;
- thuyền cập bến nến;
- người dùng chạm hoặc kéo một ngọn nến.

Khi đang dừng vì nhiệm vụ nến thì vòng quay không tự quay lại. Khi nhiệm vụ nến xong, hoặc thuyền rời bến nến lúc không có nhiệm vụ nến, vòng quay quay lại.

#### Scenario: Bắt đầu nhiệm vụ nến
- **WHEN** máy giao nhiệm vụ "Hãy thổi tắt 3 ngọn nến"
- **THEN** vòng quay giảm tốc và dừng ở góc "nhà", và các ngọn nến đứng yên cho tới khi xong nhiệm vụ

#### Scenario: Chạm nến khi vòng đang quay
- **WHEN** vòng quay đang quay và người dùng bấm vào một ngọn nến đang cháy
- **THEN** ngọn nến đó tắt và vòng quay giảm tốc dừng ở góc "nhà"

#### Scenario: Đang ở nhiệm vụ ếch
- **WHEN** máy đang giao nhiệm vụ ếch và không ai chạm vào nến
- **THEN** vòng quay quay chậm liên tục

### Requirement: Đi lại bằng thuyền
Người dùng SHALL đi lại trong cảnh bằng thuyền trên sông:
- Có danh sách bến đặt sẵn: Cổng, Bến ếch, Bến nến, Bến cò, Bến thú. Bấm một bến thì thuyền tự chạy tới đó.
- Lái tay được bằng phím W A S D, phím mũi tên hoặc nút điều hướng trên màn hình.
- Kéo chuột để xoay quanh thuyền, con lăn hoặc hai ngón để lại gần hay ra xa.
- Khi thuyền đậu ở bến có khu cần xem, camera từ từ nhìn sang khu đó.
- Camera không được chui xuống dưới mặt nước.

#### Scenario: Đi đến bến nến
- **WHEN** người dùng bấm bến "Bến nến"
- **THEN** thuyền tự chạy tới bến nến, camera nhìn sang vòng quay nến, và vòng quay giảm tốc dừng ở góc "nhà"

## MODIFIED Requirements

### Requirement: Cảnh vườn thú
Cảnh SHALL là một vườn thú 3D hoạt hình phong cách hóa. Cảnh gồm cổng vào, con sông có bờ, cây cỏ, bầu trời và các khu: khu ếch bên sông, khu cò, vòng quay nến, khu thú làm cảnh (ít nhất 2 loài khác). Lúc bắt đầu, mỗi khu có 10 đối tượng đếm được. Người dùng đi lại trên một chiếc thuyền chạy dọc sông.

#### Scenario: Vào vườn thú
- **WHEN** người dùng mở bài 4
- **THEN** thuyền đậu gần cổng vào, và cảnh có đủ 10 con ếch trên bờ, 10 con cò, 10 ngọn nến đang cháy trên vòng quay

### Requirement: Vùng đếm
Mỗi đối tượng SHALL thuộc đúng một vùng tại mọi thời điểm:
- Ếch: "trên bờ" hoặc "dưới sông".
- Cò: "trên mặt đất" hoặc "bay đi" (trên trời).
- Nến: ở "trên vòng quay" (trong một cabin), "trên mặt đất" hoặc "trên trời". Mỗi nến cũng "đang cháy" hoặc "đã tắt".

Mỗi cabin chứa nhiều nhất 1 ngọn nến. Đối tượng đã xóa thì không thuộc vùng nào và không được đếm.

#### Scenario: Ếch thả xuống sông
- **WHEN** một con ếch được thả vào mặt nước sông
- **THEN** con ếch ở trong vùng "dưới sông", và số "trên bờ" giảm 1, số "dưới sông" tăng 1

#### Scenario: Nến trên cabin ở cao
- **WHEN** một ngọn nến nằm trong cabin ở đỉnh vòng quay
- **THEN** ngọn nến vẫn thuộc vùng "trên vòng quay", không bị tính là "trên trời"

### Requirement: Kéo thả đối tượng
Người dùng SHALL kéo được bất kỳ đối tượng đếm được nào bằng chuột hoặc cảm ứng. Nơi thả quyết định đối tượng đi đâu:
- Thả lên vùng trời: đối tượng bay lên và nằm ở vùng "trên trời".
- Thả xuống mặt sông: đối tượng xuống nước.
- Thả lên mặt đất: đối tượng đứng tại chỗ.
- Với nến, thả gần một cabin trống của vòng quay: nến gắn vào cabin đó và đi theo cabin.

Kéo nến ra khỏi cabin thì cabin đó trống. Trong lúc kéo, camera không được xoay theo.

#### Scenario: Kéo cò lên trời
- **WHEN** người dùng kéo một con cò lên vùng trời rồi thả
- **THEN** con cò vỗ cánh bay lên trên cao và được đếm là "bay đi"

#### Scenario: Kéo ếch từ sông lên bờ
- **WHEN** người dùng kéo một con ếch đang ở dưới sông lên bờ
- **THEN** con ếch đứng trên bờ và được đếm lại vào "trên bờ"

#### Scenario: Gắn nến lại vào cabin trống
- **WHEN** người dùng kéo một ngọn nến ra mặt đất, rồi kéo nó thả gần cabin vừa trống
- **THEN** ngọn nến gắn vào cabin đó và được đếm lại là "trên vòng quay"

#### Scenario: Thả nến vào cabin đã có nến
- **WHEN** người dùng thả một ngọn nến gần một cabin đã có nến, và trong tầm đó không có cabin trống nào
- **THEN** ngọn nến không gắn vào cabin, mà rơi xuống chỗ đất hoặc nước ngay bên dưới như khi thả bình thường

### Requirement: Xóa và khôi phục
Người dùng SHALL xóa được một đối tượng bằng nút xóa hoặc phím Delete. Cũng phải có nút "Đặt lại" để đưa toàn bộ cảnh về trạng thái ban đầu, kể cả đưa mọi ngọn nến về đúng cabin ban đầu và đưa vòng quay về góc "nhà".

#### Scenario: Xóa một con ếch
- **WHEN** người dùng xóa một con ếch trên bờ
- **THEN** con ếch biến mất và tổng số ếch giảm 1

#### Scenario: Đặt lại cảnh
- **WHEN** người dùng bấm "Đặt lại"
- **THEN** mọi khu trở về 10 đối tượng ở vị trí và trạng thái ban đầu, và cabin nào cũng có lại ngọn nến đang cháy của nó

### Requirement: Chế độ học sinh
Bài 4 SHALL chỉ có một luồng chơi. Máy giao lần lượt các nhiệm vụ bám SGK: cho 2 ếch xuống sông, cho 5 cò bay đi, thổi tắt 3 nến. Sau mỗi nhiệm vụ, máy hỏi số còn lại và cho chọn phép tính đúng trong 3 lựa chọn. Nút "Bảng đếm" bật/tắt bảng đếm của từng khu. Trên bảng, mỗi khu có nút "Hiện đáp án" để hiện số đếm và phép trừ.

#### Scenario: Nhiệm vụ ếch
- **WHEN** máy giao "Hãy cho 2 bạn ếch nhảy xuống sông" và học sinh kéo đúng 2 con ếch xuống sông
- **THEN** máy hỏi "Trên bờ còn mấy bạn ếch?" và hiện 3 lựa chọn phép tính, trong đó có "10 − 2 = 8"

#### Scenario: Chọn sai phép tính
- **WHEN** học sinh chọn một phép tính sai trong 3 lựa chọn
- **THEN** máy phát lời động viên và cho chọn lại; khi chọn đúng thì khen rồi chuyển sang nhiệm vụ kế tiếp

#### Scenario: Làm thừa thao tác
- **WHEN** nhiệm vụ là cho 2 ếch xuống sông nhưng học sinh kéo 3 con xuống
- **THEN** máy nhắc "Nhiều quá rồi! Hãy kéo bớt 1 bạn ếch lên bờ nhé", và chưa chuyển sang câu hỏi cho đến khi dưới sông có đúng 2 con

#### Scenario: Hiện đáp án trên bảng đếm
- **WHEN** đã có 2 con ếch dưới sông, người dùng bật "Bảng đếm" và bấm "Hiện đáp án" ở khu ếch
- **THEN** bảng hiện "Trên bờ: 8 · Dưới sông: 2 · Tất cả: 10" và phép tính "10 − 2 = 8"

## REMOVED Requirements

### Requirement: Di chuyển và góc nhìn
**Reason**: Code không còn danh sách điểm đến cho camera bay tới; người dùng đi lại bằng thuyền và bấm bến.
**Migration**: Dùng requirement mới "Đi lại bằng thuyền". Bến "Bến nến" thay cho điểm đến "Bàn nến".

### Requirement: Chế độ giáo viên
**Reason**: Code đã bỏ chế độ giáo viên. Không còn đi bộ tự do bằng WASD hay xoay nhìn kiểu người đứng; giờ đi lại bằng thuyền.
**Migration**: Đi lại theo requirement "Di chuyển và góc nhìn" (thuyền, bến). Xem đáp án qua nút "Bảng đếm" → "Hiện đáp án" trong requirement "Chế độ học sinh".

### Requirement: Chuyển chế độ
**Reason**: Bài 4 chỉ còn một luồng chơi nên không còn công tắc Giáo viên/Học sinh.
**Migration**: Không cần. Nút "Đặt lại" vẫn đưa cảnh về trạng thái ban đầu và giao lại nhiệm vụ đầu tiên.
