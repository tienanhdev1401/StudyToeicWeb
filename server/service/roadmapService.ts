import { LearningGoal } from '../models/LearningGoal';

// Hàm tạo roadmap dựa trên mục tiêu học tập
export async function generateToeicRoadmap(learningGoal: LearningGoal): Promise<string> {
  const { duration, scoreTarget } = learningGoal;
  
  // Phân loại mục tiêu điểm
  let level = "Beginner";
  if (scoreTarget >= 700) {
    level = "Advanced";
  } else if (scoreTarget >= 500) {
    level = "Intermediate";
  } else if (scoreTarget >= 300) {
    level = "Basic";
  }
  
  // Tính số ngày cho mỗi giai đoạn
  const phaseLength = Math.floor(duration / 4); // Chia thành 4 giai đoạn
  const remainingDays = duration % 4;
  
  const phases = [
    phaseLength,
    phaseLength,
    phaseLength,
    phaseLength + remainingDays // Giai đoạn cuối cộng thêm ngày dư
  ];
  
  // Tạo nội dung roadmap
  let content = `
# LỘ TRÌNH HỌC TOEIC - MỤC TIÊU ${scoreTarget} ĐIỂM TRONG ${duration} NGÀY

## THÔNG TIN CHUNG
- **Cấp độ**: ${level}
- **Thời gian**: ${duration} ngày
- **Mục tiêu điểm số**: ${scoreTarget} điểm TOEIC

## PHƯƠNG PHÁP HỌC
${createLearningMethod(level)}

## GIAI ĐOẠN 1: LÀM QUEN VÀ XÂY DỰNG NỀN TẢNG (${phases[0]} ngày)
${createPhase1Content(level, phases[0])}

## GIAI ĐOẠN 2: NÂNG CAO KIẾN THỨC (${phases[1]} ngày)
${createPhase2Content(level, phases[1])}

## GIAI ĐOẠN 3: LUYỆN ĐỀ VÀ KỸ NĂNG (${phases[2]} ngày)
${createPhase3Content(level, phases[2])}

## GIAI ĐOẠN 4: ÔN TẬP VÀ CHUẨN BỊ THI (${phases[3]} ngày)
${createPhase4Content(level, phases[3])}

## TÀI NGUYÊN HỌC TẬP KHUYÊN DÙNG
${createResources(level)}

*Lộ trình này được tạo tự động dựa trên mục tiêu học tập của bạn. Bạn có thể điều chỉnh để phù hợp với trình độ và thời gian biểu của mình.*
`;

  return content;
}

// Hàm tạo phương pháp học dựa trên level
function createLearningMethod(level: string): string {
  let method = '';
  
  switch (level) {
    case 'Beginner':
      method = `
1. **Học từ vựng theo chủ đề**: Tập trung vào 300-500 từ vựng cơ bản.
2. **Ngữ pháp cơ bản**: Nắm vững các cấu trúc câu đơn giản.
3. **Nghe và đọc**: Luyện tập với các bài nghe và đọc ngắn, đơn giản.
4. **Làm bài tập**: Làm các bài tập phần 1, 2, 5 của đề TOEIC.
5. **Luyện đề**: Làm ít nhất 3-5 đề TOEIC mini mỗi tuần.`;
      break;
      
    case 'Basic':
      method = `
1. **Từ vựng theo chủ đề**: Học 500-800 từ vựng thông dụng trong TOEIC.
2. **Ngữ pháp cơ bản và trung cấp**: Học các cấu trúc câu và thì cơ bản.
3. **Luyện nghe và đọc**: Tập trung vào các bài tập Part 1-4 và Part 5-7.
4. **Làm bài tập và đề mẫu**: Làm 1-2 đề mỗi tuần và phân tích lỗi sai.
5. **Tự đánh giá**: Theo dõi tiến độ và điều chỉnh kế hoạch học tập.`;
      break;
      
    case 'Intermediate':
      method = `
1. **Từ vựng nâng cao**: Học 800-1200 từ vựng theo chủ đề TOEIC, chú trọng collocation và phrasal verbs.
2. **Ngữ pháp trung cấp và nâng cao**: Học các cấu trúc ngữ pháp phức tạp hơn.
3. **Kỹ năng làm bài**: Tập trung vào chiến lược làm bài và quản lý thời gian.
4. **Luyện đề thường xuyên**: Làm 2-3 đề full test mỗi tuần và phân tích lỗi sai.
5. **Học nhóm và thảo luận**: Tham gia các nhóm học để trao đổi kinh nghiệm.`;
      break;
      
    case 'Advanced':
      method = `
1. **Từ vựng học thuật và chuyên ngành**: Học 1200+ từ vựng nâng cao, đặc biệt là từ vựng chuyên ngành.
2. **Ngữ pháp nâng cao**: Hoàn thiện kiến thức về ngữ pháp phức tạp.
3. **Kỹ năng làm bài nâng cao**: Phát triển các chiến lược làm bài hiệu quả cho tất cả các phần.
4. **Luyện đề chuyên sâu**: Làm 2-3 đề full test mỗi tuần với mức độ khó tương đương hoặc cao hơn.
5. **Phân tích lỗi sai chi tiết**: Dành thời gian phân tích kỹ các lỗi sai để tránh lặp lại.`;
      break;
  }
  
  return method;
}

// Tạo nội dung giai đoạn 1
function createPhase1Content(level: string, days: number): string {
  let content = '';
  
  switch (level) {
    case 'Beginner':
    case 'Basic':
      content = `
### Tuần 1-2:
- Học 20-30 từ vựng mỗi ngày theo chủ đề: Workplace, Office, Daily Activities
- Học ngữ pháp cơ bản: Thì hiện tại đơn, hiện tại tiếp diễn, quá khứ đơn
- Luyện nghe Part 1 & 2 mỗi ngày (15-20 phút)
- Luyện đọc Part 5 mỗi ngày (15-20 phút)

### Hoạt động hàng ngày:
- Dành 1-2 giờ mỗi ngày để học từ vựng và ngữ pháp
- Làm 1 bài Mini Test (25-30 phút) mỗi 2 ngày
- Ôn tập từ vựng đã học vào cuối mỗi ngày

### Tài nguyên:
- Sử dụng ứng dụng học từ vựng như Quizlet, Memrise
- Sử dụng sách Starter TOEIC hoặc Very Easy TOEIC
- Nghe các bài hội thoại ngắn bằng tiếng Anh`;
      break;
      
    case 'Intermediate':
      content = `
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
- Đọc các bài báo tiếng Anh về kinh doanh, công nghệ`;
      break;
      
    case 'Advanced':
      content = `
### Tuần 1-2:
- Học 40-50 từ vựng chuyên ngành mỗi ngày: Finance, Law, Healthcare
- Ôn tập và nâng cao ngữ pháp: mệnh đề quan hệ, câu bị động, đảo ngữ
- Luyện nghe với tốc độ nhanh: podcast, TED talks (45-60 phút mỗi ngày)
- Luyện đọc các bài báo học thuật và báo cáo kinh doanh (45-60 phút mỗi ngày)

### Hoạt động hàng ngày:
- Dành 3-4 giờ mỗi ngày cho việc học
- Làm 1 bài Full Test (2 giờ) mỗi tuần
- Phân tích lỗi sai chi tiết sau mỗi bài test

### Tài nguyên:
- Sách TOEIC Advanced hoặc TOEIC Practice Exams
- Podcast Business English
- Đọc Harvard Business Review, The Economist
- Tham gia các diễn đàn học TOEIC nâng cao`;
      break;
  }
  
  return content;
}

// Tạo nội dung giai đoạn 2
function createPhase2Content(level: string, days: number): string {
  let content = '';
  
  switch (level) {
    case 'Beginner':
    case 'Basic':
      content = `
### Tuần 3-4:
- Học thêm 20-30 từ vựng mỗi ngày theo chủ đề: Travel, Food, Entertainment
- Học ngữ pháp: thì tương lai đơn, hiện tại hoàn thành, so sánh hơn/nhất
- Luyện nghe Part 3 & 4 mỗi ngày (20-30 phút)
- Luyện đọc Part 6 mỗi ngày (20-30 phút)

### Hoạt động hàng ngày:
- Dành 2-3 giờ mỗi ngày để học từ vựng và ngữ pháp
- Làm 1 bài Mini Test (30-45 phút) mỗi 2 ngày
- Thực hành nói các từ vựng đã học

### Tài nguyên:
- Sách TOEIC Bridge hoặc Basic TOEIC
- Xem video giảng dạy về ngữ pháp trên YouTube
- Nghe các cuộc hội thoại về chủ đề du lịch, nhà hàng`;
      break;
      
    case 'Intermediate':
      content = `
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
- Đọc các tài liệu hướng dẫn và email công việc bằng tiếng Anh`;
      break;
      
    case 'Advanced':
      content = `
### Tuần 3-4:
- Học 40-50 collocations và phrasal verbs mỗi ngày
- Nâng cao kỹ năng đọc hiểu các văn bản phức tạp: báo cáo, hợp đồng, tài liệu kỹ thuật
- Phát triển kỹ năng nghe hiểu chi tiết và ngầm định trong các cuộc hội thoại
- Học các chiến lược làm bài thi hiệu quả cho từng phần

### Hoạt động hàng ngày:
- Dành 3-4 giờ mỗi ngày cho việc học
- Làm 1 bài Full Test (2 giờ) mỗi tuần với thời gian giới hạn
- Phân tích chi tiết lỗi sai và cải thiện

### Tài nguyên:
- Sách Barron's TOEIC Practice Exams hoặc ETS Official TOEIC Tests
- Nghe các cuộc hội thảo và thuyết trình chuyên môn
- Đọc các báo cáo và nghiên cứu kinh doanh
- Thực hành phiên dịch các đoạn văn phức tạp`;
      break;
  }
  
  return content;
}

// Tạo nội dung giai đoạn 3
function createPhase3Content(level: string, days: number): string {
  let content = '';
  
  switch (level) {
    case 'Beginner':
    case 'Basic':
      content = `
### Tuần 5-6:
- Ôn tập và củng cố từ vựng đã học
- Học thêm từ vựng theo chủ đề: Health, Technology, Environment
- Luyện kỹ năng làm bài cho tất cả các phần thi
- Làm các bài Mini Test và phân tích lỗi sai

### Hoạt động hàng ngày:
- Dành 2-3 giờ mỗi ngày để ôn tập và luyện đề
- Làm 1 bài Half Test (1 giờ) mỗi 3 ngày
- Tập trung vào các phần còn yếu

### Tài nguyên:
- Sách TOEIC Test với đáp án và giải thích
- Tham gia các nhóm học TOEIC để trao đổi
- Xem các video giải đề TOEIC trên YouTube`;
      break;
      
    case 'Intermediate':
      content = `
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
- Thực hành với các bài thi thử trên internet`;
      break;
      
    case 'Advanced':
      content = `
### Tuần 5-6:
- Thực hành làm các bài thi Full Test với thời gian giới hạn
- Phát triển chiến lược quản lý thời gian tối ưu cho từng phần thi
- Nâng cao kỹ năng đọc hiểu nhanh các dạng văn bản phức tạp
- Thực hành nghe hiểu các accent khác nhau

### Hoạt động hàng ngày:
- Dành 3-4 giờ mỗi ngày cho việc luyện đề và phân tích
- Làm 2 bài Full Test mỗi tuần trong điều kiện sát với thi thật
- Ghi chép và phân tích kỹ lưỡng các lỗi sai

### Tài nguyên:
- Sách TOEIC ETS Official Test + các đề thi thực tế mới nhất
- Tham gia các lớp học TOEIC nâng cao
- Tham gia các diễn đàn TOEIC cho người học trình độ cao
- Phân tích đề thi với người hướng dẫn hoặc bạn học có trình độ cao`;
      break;
  }
  
  return content;
}

// Tạo nội dung giai đoạn 4
function createPhase4Content(level: string, days: number): string {
  let content = '';
  
  switch (level) {
    case 'Beginner':
    case 'Basic':
      content = `
### Tuần 7-8:
- Ôn tập toàn bộ từ vựng và ngữ pháp đã học
- Luyện tập với các đề thi thử hoàn chỉnh
- Rèn luyện kỹ năng quản lý thời gian
- Tập trung vào những điểm yếu và cải thiện

### Trước kỳ thi:
- Làm 2-3 đề thi thử hoàn chỉnh mỗi tuần
- Giữ tinh thần thoải mái, ngủ đủ giấc
- Xem lại các lỗi sai thường gặp
- Chuẩn bị tâm lý tự tin cho kỳ thi

### Lời khuyên:
- Đừng học dồn vào phút chót
- Duy trì thói quen học đều đặn
- Ngủ đủ giấc trước ngày thi
- Đọc kỹ hướng dẫn làm bài thi`;
      break;
      
    case 'Intermediate':
      content = `
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
- Đến địa điểm thi sớm và chuẩn bị đầy đủ`;
      break;
      
    case 'Advanced':
      content = `
### Tuần 7-8:
- Thực hành với các đề thi mới nhất và khó nhất
- Hoàn thiện chiến lược làm bài, đặc biệt là phần nghe và đọc hiểu phức tạp
- Rèn luyện kỹ năng quản lý thời gian tối ưu
- Ôn tập có hệ thống các điểm ngữ pháp và từ vựng nâng cao

### Trước kỳ thi:
- Làm 4-5 đề thi thử hoàn chỉnh mỗi tuần theo đúng thời gian quy định
- Phân tích chi tiết các lỗi sai và khắc phục
- Lập kế hoạch làm bài chi tiết cho từng phần thi
- Giữ thói quen đọc và nghe tiếng Anh hàng ngày

### Lời khuyên:
- Giữ tinh thần thoải mái và tự tin
- Không học dồn vào phút chót
- Duy trì thói quen học tập đã hình thành
- Đến địa điểm thi sớm và chuẩn bị tâm lý tốt
- Làm quen với điều kiện phòng thi (ngồi lâu, tập trung cao)`;
      break;
  }
  
  return content;
}

// Tạo tài nguyên học tập
function createResources(level: string): string {
  let resources = '';
  
  switch (level) {
    case 'Beginner':
      resources = `
### Sách và Tài liệu:
- Start TOEIC - Anne Taylor
- TOEIC Bridge Practice Tests
- Very Easy TOEIC - Anne Taylor

### Ứng dụng và Website:
- Duolingo
- Memrise
- ELSA Speak
- Quizlet

### Khóa học trực tuyến:
- TOEIC cho người mới bắt đầu trên Udemy
- Khóa học TOEIC cơ bản trên các nền tảng Việt Nam`;
      break;
      
    case 'Basic':
      resources = `
### Sách và Tài liệu:
- TOEIC Practice Exams - Michael Byrne
- TOEIC Preparation Book - Richard M. Callan
- Easy TOEIC - Anne Taylor

### Ứng dụng và Website:
- Duolingo
- Memrise
- EnglishClub
- ToeicTestPro

### Khóa học trực tuyến:
- TOEIC 500+ trên Udemy
- Khóa học TOEIC trung bình trên các nền tảng Việt Nam
- TOEIC Essential trên edX`;
      break;
      
    case 'Intermediate':
      resources = `
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
- Khóa học TOEIC trung cấp và nâng cao từ các trung tâm uy tín`;
      break;
      
    case 'Advanced':
      resources = `
### Sách và Tài liệu:
- ETS TOEIC Official Test Collection (mới nhất)
- Barron's TOEIC Practice Exams
- TOEIC Advanced - Lin Lougheed
- Hackers TOEIC Reading/Listening

### Ứng dụng và Website:
- TED Talks
- The Economist
- Harvard Business Review
- Financial Times
- TOEIC Test Pro (Premium)

### Khóa học trực tuyến:
- TOEIC Expert Class
- TOEIC 900+ Strategy
- Business English for TOEIC
- Khóa học 1-1 với giáo viên bản ngữ chuyên TOEIC`;
      break;
  }
  
  return resources;
} 