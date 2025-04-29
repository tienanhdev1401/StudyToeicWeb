import * as mammoth from 'mammoth';

/**
 * Chuyển đổi file Word (.docx) thành HTML
 * @param {File} file - File Word (.docx) từ input[type="file"]
 * @returns {Promise<{html: string, error: string}>}
 */
export const parseDocxToHtml = async (file) => {
  return new Promise((resolve) => {
    if (!file || !isValidDocxFile(file)) {
      resolve({ html: '', error: 'File không hợp lệ. Vui lòng chọn file .docx' });
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        resolve({ html: result.value, error: '' });
      } catch (err) {
        console.error('Lỗi khi chuyển đổi file docx:', err);
        resolve({ html: '', error: 'Lỗi khi chuyển đổi file. Vui lòng kiểm tra nội dung file.' });
      }
    };

    reader.onerror = () => {
      resolve({ html: '', error: 'Lỗi khi đọc file' });
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Kiểm tra file .docx hợp lệ
 * @param {File} file
 * @returns {boolean}
 */
export const isValidDocxFile = (file) => {
  if (!file) return false;
  const ext = file.name.split('.').pop().toLowerCase();
  const mime = file.type.toLowerCase();
  return ext === 'docx' && mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
};
