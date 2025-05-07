/**
 * DictionaryService - Xử lý các API calls liên quan đến từ điển
 */
import config from './config';

const API_BASE_URL = config.API_BASE_URL;

// Hàm tìm kiếm từ trong từ điển
export const searchWord = async (word) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dictionary/${encodeURIComponent(word.trim())}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Không tìm thấy định nghĩa cho từ "${word}"`);
      } else {
        throw new Error('Đã xảy ra lỗi khi tìm kiếm từ');
      }
    }
    
    return await response.json();
  } catch (err) {
    console.error('Lỗi tìm kiếm từ điển:', err);
    throw err;
  }
}; 