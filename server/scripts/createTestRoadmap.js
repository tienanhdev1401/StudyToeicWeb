const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Đường dẫn tới file .env
const envPath = path.resolve(__dirname, '../.env');

// Nếu file .env tồn tại, load nó
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // Load từ thư mục hiện tại
}

// Hiển thị thông tin .env được load
console.log('Đường dẫn .env:', envPath);
console.log('HOST:', process.env.DATABASE_HOST);
console.log('USER:', process.env.DATABASE_USER);
console.log('DATABASE:', process.env.DATABASE);

// Thông tin kết nối cơ sở dữ liệu
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : undefined,
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE || 'toeic_db'
};

// Kiểm tra thông tin kết nối
console.log('Thông tin kết nối:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database
});

// Hàm tạo dữ liệu mẫu
async function createTestData() {
  try {
    // Kết nối đến cơ sở dữ liệu
    console.log('Đang kết nối đến cơ sở dữ liệu...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('Đã kết nối đến cơ sở dữ liệu');

    // 1. Tạo một người dùng test nếu chưa có
    const [users] = await connection.execute('SELECT id FROM users LIMIT 1');
    let userId = users.length > 0 ? users[0].id : null;

    if (!userId) {
      const [result] = await connection.execute(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['testuser', 'test@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 'learner']
      );
      userId = result.insertId;
      console.log(`Đã tạo người dùng test với ID: ${userId}`);
    } else {
      console.log(`Sử dụng người dùng có sẵn với ID: ${userId}`);
    }

    // 2. Tạo learning goal cho người dùng
    const [existingGoal] = await connection.execute(
      'SELECT id FROM learninggoals WHERE LearnerId = ?',
      [userId]
    );

    let learningGoalId;
    
    if (existingGoal.length === 0) {
      const [goalResult] = await connection.execute(
        'INSERT INTO learninggoals (duration, scoreTarget, createdAt, LearnerId) VALUES (?, ?, ?, ?)',
        [90, 650, new Date(), userId]
      );
      learningGoalId = goalResult.insertId;
      console.log(`Đã tạo learning goal với ID: ${learningGoalId}`);
    } else {
      learningGoalId = existingGoal[0].id;
      console.log(`Sử dụng learning goal có sẵn với ID: ${learningGoalId}`);
    }

    // 3. Kiểm tra xem roadmap đã tồn tại chưa
    const [existingRoadmap] = await connection.execute(
      'SELECT id FROM roadmaps WHERE LearnerId = ?',
      [userId]
    );

    // Nội dung mẫu cho roadmap
    const sampleContent = `
# LỘ TRÌNH HỌC TOEIC - MỤC TIÊU 650 ĐIỂM TRONG 90 NGÀY

## THÔNG TIN CHUNG
- **Cấp độ**: Intermediate
- **Thời gian**: 90 ngày
- **Mục tiêu điểm số**: 650 điểm TOEIC

## PHƯƠNG PHÁP HỌC
1. **Từ vựng nâng cao**: Học 800-1200 từ vựng theo chủ đề TOEIC, chú trọng collocation và phrasal verbs.
2. **Ngữ pháp trung cấp và nâng cao**: Học các cấu trúc ngữ pháp phức tạp hơn.
3. **Kỹ năng làm bài**: Tập trung vào chiến lược làm bài và quản lý thời gian.
4. **Luyện đề thường xuyên**: Làm 2-3 đề full test mỗi tuần và phân tích lỗi sai.
5. **Học nhóm và thảo luận**: Tham gia các nhóm học để trao đổi kinh nghiệm.

## GIAI ĐOẠN 1: LÀM QUEN VÀ XÂY DỰNG NỀN TẢNG (22 ngày)
### Tuần 1-2:
- Học 30-40 từ vựng mỗi ngày theo chủ đề: Business, Technology, Marketing
- Củng cố ngữ pháp: thì quá khứ hoàn thành, tương lai hoàn thành, câu điều kiện
- Luyện nghe Part 3 & 4 mỗi ngày (30 phút)
- Luyện đọc Part 6 & 7 mỗi ngày (30 phút)

### Hoạt động hàng ngày:
- Dành 2-3 giờ mỗi ngày cho việc học
- Làm 1 bài Mini Test (45-60 phút) mỗi 2 ngày
- Ghi chú và ôn tập từ vựng, ngữ pháp đã học

### Tài nguyên:
- Sách Target TOEIC hoặc ETS TOEIC
- Các video luyện nghe trên YouTube
- Đọc các bài báo tiếng Anh về kinh doanh, công nghệ

## GIAI ĐOẠN 2: NÂNG CAO KIẾN THỨC (22 ngày)
### Tuần 3-4:
- Học 30-40 từ vựng mỗi ngày theo chủ đề: Management, HR, Customer Service
- Học ngữ pháp: câu bị động, lời nói gián tiếp, mệnh đề quan hệ
- Luyện kỹ năng đọc nhanh và skimming cho Part 7 (45 phút mỗi ngày)
- Luyện nghe và ghi chú thông tin quan trọng trong Part 3 & 4 (45 phút mỗi ngày)

### Hoạt động hàng ngày:
- Dành 2-3 giờ mỗi ngày cho việc học
- Làm 1 bài Half Test (1 giờ) mỗi 3 ngày
- Thực hành sử dụng từ vựng mới trong các câu và tình huống

### Tài nguyên:
- Sách Tactics for TOEIC hoặc Oxford Preparation Course for the TOEIC Test
- Nghe podcast bằng tiếng Anh về chủ đề kinh doanh
- Đọc các tài liệu hướng dẫn và email công việc bằng tiếng Anh

## GIAI ĐOẠN 3: LUYỆN ĐỀ VÀ KỸ NĂNG (22 ngày)
### Tuần 5-6:
- Củng cố từ vựng và học thêm từ đồng nghĩa, trái nghĩa
- Thực hành chiến lược làm bài thi cho từng phần
- Nâng cao kỹ năng đọc hiểu với các bài đọc dài Part 7
- Làm quen với các dạng câu hỏi khó trong Part 5 & 6

### Hoạt động hàng ngày:
- Dành 3-4 giờ mỗi ngày cho việc luyện đề
- Làm 1 bài Full Test (2 giờ) mỗi tuần
- Phân tích lỗi sai và ôn tập lại những điểm yếu

### Tài nguyên:
- Sách TOEIC ETS hoặc Longman Preparation Series
- Tham gia các lớp học TOEIC online
- Thực hành với các bài thi thử trên internet

## GIAI ĐOẠN 4: ÔN TẬP VÀ CHUẨN BỊ THI (24 ngày)
### Tuần 7-8:
- Ôn tập có hệ thống từ vựng theo từng chủ đề quan trọng
- Luyện tập với các đề thi thử hoàn chỉnh trong điều kiện giống thật
- Phân tích và khắc phục các lỗi sai còn mắc phải
- Luyện tập kỹ năng suy luận và phán đoán trong Part 7

### Trước kỳ thi:
- Làm 3-4 đề thi thử hoàn chỉnh mỗi tuần
- Tập trung phân tích và rút kinh nghiệm từ các lỗi sai
- Luyện tập kỹ năng quản lý thời gian
- Thư giãn và giữ tinh thần thoải mái

### Lời khuyên:
- Không học thêm kiến thức mới trong tuần cuối
- Duy trì lịch học và luyện tập đều đặn
- Nghỉ ngơi đầy đủ trước ngày thi
- Đến địa điểm thi sớm và chuẩn bị đầy đủ

## TÀI NGUYÊN HỌC TẬP KHUYÊN DÙNG
### Sách và Tài liệu:
- Longman Preparation Series for the TOEIC Test
- Tactics for TOEIC Listening and Reading Test
- ETS TOEIC Official Test-Preparation Guide
- Target TOEIC (Second Edition)

### Ứng dụng và Website:
- TOEIC Test Pro
- engVid (TOEIC lessons)
- TOEIC Practice Online
- BBC Learning English

### Khóa học trực tuyến:
- TOEIC 700+ trên Udemy
- TOEIC Masterclass trên Coursera
- Khóa học TOEIC trung cấp và nâng cao từ các trung tâm uy tín

*Lộ trình này được tạo dựa trên mục tiêu học tập của bạn. Bạn có thể điều chỉnh để phù hợp với trình độ và thời gian biểu của mình.*
`;

    if (existingRoadmap.length === 0) {
      // Tạo roadmap mới
      const [roadmapResult] = await connection.execute(
        'INSERT INTO roadmaps (tittle, content, createdAt, LearnerId) VALUES (?, ?, ?, ?)',
        [
          'Lộ trình học TOEIC - Mục tiêu 650 điểm trong 90 ngày',
          sampleContent,
          new Date(),
          userId
        ]
      );
      console.log(`Đã tạo roadmap với ID: ${roadmapResult.insertId}`);
    } else {
      // Cập nhật roadmap nếu đã tồn tại
      await connection.execute(
        'UPDATE roadmaps SET tittle = ?, content = ?, updatedAt = ? WHERE LearnerId = ?',
        [
          'Lộ trình học TOEIC - Mục tiêu 650 điểm trong 90 ngày',
          sampleContent,
          new Date(),
          userId
        ]
      );
      console.log(`Đã cập nhật roadmap cho người dùng ID: ${userId}`);
    }

    console.log('Đã tạo dữ liệu test thành công!');
    console.log('----------');
    console.log('Thông tin để test:');
    console.log(`User ID: ${userId}`);
    console.log(`Learning Goal ID: ${learningGoalId}`);
    console.log('Bạn có thể sử dụng ID này để test API hoặc giao diện người dùng.');

    // Đóng kết nối
    await connection.end();
    console.log('Đã đóng kết nối cơ sở dữ liệu');

  } catch (error) {
    console.error('Đã xảy ra lỗi:', error);
  }
}

// Chạy hàm tạo dữ liệu
createTestData(); 