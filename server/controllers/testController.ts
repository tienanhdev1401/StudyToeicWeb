import { Request, Response } from 'express';
import { TestRepository } from '../repositories/testRepository';

// Cache cho kết quả API
const testCache: Map<string, { data: any, timestamp: number }> = new Map();
// Thời gian cache hết hạn (5 phút)
const CACHE_EXPIRATION = 5 * 60 * 1000;

export class TestController {
  private testRepository: TestRepository;

  constructor() {
    this.testRepository = new TestRepository();
  }
  
  getRandomCompletions(): string {
    const num = Math.floor(Math.random() * (50000 - 5000) + 5000);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  
  async getAllTests(req: Request, res: Response) {
    try {
      // Lấy tất cả các bài test
      const tests = await this.testRepository.findAll();
  
      const grouped: Record<string, any[]> = {};
      tests.forEach(test => {
        const collectionKey = test.testCollection || 'Khác';
        if (!grouped[collectionKey]) {
          grouped[collectionKey] = [];
        }
        grouped[collectionKey].push({
          id: test.id,
          name: test.title,
          completions: this.getRandomCompletions()
        });
      });
  
      const result = Object.entries(grouped).map(([title, tests], index) => ({
        id: index + 1,
        title,
        tests
      }));
  
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllTests:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  /**
   * Lấy bài kiểm tra theo ID với đầy đủ thông tin
   */
  async getTestById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
      }

      // Kiểm tra cache trước khi truy vấn database
      const cacheKey = `test-${id}`;
      const cachedData = testCache.get(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_EXPIRATION)) {
        console.log(`Sử dụng dữ liệu cache cho test ID ${id}`);
        return res.status(200).json(cachedData.data);
      }

      console.time(`getTestById-${id}`);
      
      // Lấy dữ liệu đầy đủ
      const test = await this.testRepository.getTestWithDetails(id);
      
      if (!test) {
        return res.status(404).json({ error: 'Không tìm thấy bài kiểm tra' });
      }
      
      console.timeEnd(`getTestById-${id}`);
      
      // Lưu vào cache
      testCache.set(cacheKey, { data: test, timestamp: Date.now() });
      
      return res.status(200).json(test);
    } catch (error) {
      console.error('TestController.getTestById error:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  }
  
  // Xóa cache theo ID
  clearCache(id?: number) {
    if (id) {
      // Xóa cache theo ID
      testCache.delete(`test-${id}`);
    } else {
      testCache.clear();
    }
  }
}