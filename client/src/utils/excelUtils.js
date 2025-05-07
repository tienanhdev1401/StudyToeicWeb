import * as XLSX from 'xlsx';

/**
 * Chuyển đổi file Excel thành dữ liệu JSON cho từ vựng
 * @param {File} file - File Excel cần xử lý
 * @returns {Promise<{vocabularies: Array, error: string}>} - Kết quả chuyển đổi
 */
export const parseVocabularyExcel = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Lấy sheet đầu tiên
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Chuyển đổi sang JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Chuyển đổi dữ liệu từ Excel thành định dạng cần thiết
          const vocabularies = jsonData.map(row => ({
            content: row['Từ vựng'] || row['Word'] || row['Content'] || row['content'] || '',
            meaning: row['Nghĩa'] || row['Meaning'] || row['meaning'] || '',
            synonym: row['Từ đồng nghĩa'] || row['Synonym'] || row['synonym'] || '',
            transcribe: row['Phiên âm'] || row['Transcribe'] || row['transcribe'] || '',
            urlAudio: row['URL Audio'] || row['Audio URL'] || row['urlAudio'] || '',
            urlImage: row['URL Hình ảnh'] || row['Image URL'] || row['Image'] || row['urlImage'] || row['image'] || ''
          }));
          
          // Lọc ra các từ vựng có đủ thông tin cần thiết
          const validVocabularies = vocabularies.filter(vocab => 
            vocab.content && vocab.content.trim() !== '' && 
            vocab.meaning && vocab.meaning.trim() !== ''
          );
          
          if (validVocabularies.length === 0) {
            resolve({ vocabularies: [], error: 'Không tìm thấy dữ liệu từ vựng hợp lệ trong file' });
          } else {
            resolve({ vocabularies: validVocabularies, error: '' });
          }
        } catch (err) {
          console.error('Lỗi khi đọc file Excel:', err);
          resolve({ vocabularies: [], error: 'Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.' });
        }
      };
      
      reader.onerror = () => {
        resolve({ vocabularies: [], error: 'Lỗi khi đọc file' });
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Kiểm tra định dạng file Excel hợp lệ
 * @param {File} file - File cần kiểm tra
 * @returns {boolean} - File có hợp lệ hay không
 */
export const isValidExcelFile = (file) => {
  if (!file) return false;
  
  const fileExtension = file.name.split('.').pop().toLowerCase();
  const validExtensions = ['xlsx', 'xls', 'csv'];
  
  return validExtensions.includes(fileExtension);
}; 

export async function parseQuestionExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const questions = json.map(row => ({
        content: row['content'] || row['Content'] || row['Question'] || row['Câu hỏi'] || '',
        correctAnswer: row['correct_answer'] || row['correctAnswer'] || row['Correct Answer'] || row['Đáp án đúng'] || '',
        explainDetail: row['explain_detail'] || row['explainDetail'] || row['Explanation'] || row['Giải thích'] || '',
        optionA: row['option_a'] || row['optionA'] || row['Option A'] || row['Lựa chọn A'] || '',
        optionB: row['option_b'] || row['optionB'] || row['Option B'] || row['Lựa chọn B'] || '',
        optionC: row['option_c'] || row['optionC'] || row['Option C'] || row['Lựa chọn C'] || '',
        optionD: row['option_d'] || row['optionD'] || row['Option D'] || row['Lựa chọn D'] || '',
        explain_resource: row['explain_resource'] || row['explainResource'] || row['Explanation Resource'] || row['Tài liệu giải thích'] || '',
        urlAudio: row['audio_url'] || row['audioUrl'] || row['Audio URL'] || row['URL Audio'] || '',
        urlImage: row['image_url'] || row['imageUrl'] || row['Image URL'] || row['URL Hình ảnh'] || '',
      }));  

      resolve({ questions });
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
} 