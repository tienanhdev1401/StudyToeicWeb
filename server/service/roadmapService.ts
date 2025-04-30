import { LearningGoal } from '../models/LearningGoal';
import * as fs from 'fs';
import * as path from 'path';

// Đọc cấu hình từ file JSON
const loadRoadmapConfig = () => {
  const configPath = path.resolve(__dirname, '../config/roadmapConfig.json');
  const rawData = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(rawData);
};

// Hàm tạo roadmap dựa trên mục tiêu học tập
export async function generateToeicRoadmap(learningGoal: LearningGoal): Promise<string> {
  const { duration, scoreTarget } = learningGoal;
  
  // Lấy cấu hình roadmap từ file
  const config = loadRoadmapConfig();
  
  // Phân loại mục tiêu điểm dựa trên cấu hình
  let level = "Beginner";
  if (scoreTarget >= config.levelThresholds.Advanced) {
    level = "Advanced";
  } else if (scoreTarget >= config.levelThresholds.Intermediate) {
    level = "Intermediate";
  } else if (scoreTarget >= config.levelThresholds.Basic) {
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
${createLearningMethod(level, config)}

## GIAI ĐOẠN 1: LÀM QUEN VÀ XÂY DỰNG NỀN TẢNG (${phases[0]} ngày)
${createPhase1Content(level, phases[0], config)}

## GIAI ĐOẠN 2: NÂNG CAO KIẾN THỨC (${phases[1]} ngày)
${createPhase2Content(level, phases[1], config)}

## GIAI ĐOẠN 3: LUYỆN ĐỀ VÀ KỸ NĂNG (${phases[2]} ngày)
${createPhase3Content(level, phases[2], config)}

## GIAI ĐOẠN 4: ÔN TẬP VÀ CHUẨN BỊ THI (${phases[3]} ngày)
${createPhase4Content(level, phases[3], config)}

## TÀI NGUYÊN HỌC TẬP KHUYÊN DÙNG
${createResources(level, config)}

*Lộ trình này được tạo tự động dựa trên mục tiêu học tập của bạn. Bạn có thể điều chỉnh để phù hợp với trình độ và thời gian biểu của mình.*
`;

  return content;
}

// Hàm tạo phương pháp học dựa trên level
function createLearningMethod(level: string, config: any): string {
  const methods = config.learningMethodTemplates[level];
  return methods.map((method: string) => `\n${method}`).join('');
}

// Tạo nội dung giai đoạn 1
function createPhase1Content(level: string, days: number, config: any): string {
  const phase1Config = config.phaseTemplates.phase1[level];
  
  let content = `
### Tuần 1-2:
${phase1Config.activities.map((activity: string) => `- ${activity}`).join('\n')}

### Hoạt động hàng ngày:
${phase1Config.dailyRoutine.map((routine: string) => `- ${routine}`).join('\n')}

### Tài nguyên:
${phase1Config.resources.map((resource: string) => `- ${resource}`).join('\n')}`;
  
  return content;
}

// Tạo nội dung giai đoạn 2
function createPhase2Content(level: string, days: number, config: any): string {
  const phase2Config = config.phaseTemplates.phase2[level];
  
  let content = `
### Tuần 3-4:
${phase2Config.activities.map((activity: string) => `- ${activity}`).join('\n')}

### Hoạt động hàng ngày:
${phase2Config.dailyRoutine.map((routine: string) => `- ${routine}`).join('\n')}

### Tài nguyên:
${phase2Config.resources.map((resource: string) => `- ${resource}`).join('\n')}`;
  
  return content;
}

// Tạo nội dung giai đoạn 3
function createPhase3Content(level: string, days: number, config: any): string {
  const phase3Config = config.phaseTemplates.phase3[level];
  
  let content = `
### Tuần 5-6:
${phase3Config.activities.map((activity: string) => `- ${activity}`).join('\n')}

### Hoạt động hàng ngày:
${phase3Config.dailyRoutine.map((routine: string) => `- ${routine}`).join('\n')}

### Tài nguyên:
${phase3Config.resources.map((resource: string) => `- ${resource}`).join('\n')}`;
  
  return content;
}

// Tạo nội dung giai đoạn 4
function createPhase4Content(level: string, days: number, config: any): string {
  const phase4Config = config.phaseTemplates.phase4[level];
  
  let content = `
### Tuần 7-8:
${phase4Config.activities.map((activity: string) => `- ${activity}`).join('\n')}

### Trước kỳ thi:
${phase4Config.preTesting.map((tip: string) => `- ${tip}`).join('\n')}

### Lời khuyên:
${phase4Config.advices.map((advice: string) => `- ${advice}`).join('\n')}`;
  
  return content;
}

// Tạo tài nguyên học tập
function createResources(level: string, config: any): string {
  const resourcesConfig = config.resources[level];
  
  let resources = `
### Sách và Tài liệu:
${resourcesConfig.books.map((book: string) => `- ${book}`).join('\n')}

### Ứng dụng và Website:
${resourcesConfig.apps.map((app: string) => `- ${app}`).join('\n')}

### Khóa học trực tuyến:
${resourcesConfig.courses.map((course: string) => `- ${course}`).join('\n')}`;
  
  return resources;
} 