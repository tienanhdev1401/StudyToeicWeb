import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import vocabularyService from '../../services/admin/admin.vocabularyService';
import vocabularyTopicService from '../../services/admin/admin.vocabularyTopicService';
import userService from '../../services/userService';
import '../../styles/ManageVocabulary.css';
import * as XLSX from 'xlsx';
import VocabularyExcelPreview from '../../components/VocabularyExcelPreview';

// Combine Add and Edit functionality into one modal component
const VocabularyFormModal = ({ isOpen, onClose, onSubmit, vocabularyItem, topicId, editMode = false }) => {
  const [formData, setFormData] = useState({
    content: '',
    meaning: '',
    synonym: '',
    transcribe: '',
    urlAudio: '',
    urlImage: '',
  });
  
  const [errors, setErrors] = useState({
    content: '',
    meaning: '',
  });
  
  const [touched, setTouched] = useState({
    content: false,
    meaning: false,
  });

  // Add state for image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form data when editing an existing item
  useEffect(() => {
    if (isOpen && editMode && vocabularyItem) {
      setFormData({
        content: vocabularyItem.content || '',
        meaning: vocabularyItem.meaning || '',
        synonym: Array.isArray(vocabularyItem.synonym) 
          ? JSON.stringify(vocabularyItem.synonym) 
          : vocabularyItem.synonym || '',
        transcribe: vocabularyItem.transcribe || '',
        urlAudio: vocabularyItem.urlAudio || '',
        urlImage: vocabularyItem.urlImage || '',
      });
      
      // Set image preview if there's an image URL
      if (vocabularyItem.urlImage) {
        setImagePreview(vocabularyItem.urlImage);
      }
    } else if (isOpen && !editMode) {
      // Reset form for adding new item
      setFormData({
        content: '',
        meaning: '',
        synonym: '',
        transcribe: '',
        urlAudio: '',
        urlImage: '',
      });
      setImageFile(null);
      setImagePreview('');
      setErrors({
        content: '',
        meaning: '',
      });
      setTouched({
        content: false,
        meaning: false,
      });
    }
  }, [isOpen, editMode, vocabularyItem]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (value.trim()) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Add image change handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        alert('Only JPG, PNG or GIF images are allowed');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must not exceed 5MB');
        return;
      }

      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      
      setImagePreview(previewUrl);
      setImageFile(file);
      // Clear the urlImage field since we'll upload a new image
      setFormData({...formData, urlImage: ''});
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    
    // Validate on blur
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let errorMessage = '';
    
    if (fieldName === 'content' && !value.trim()) {
      errorMessage = 'Word content is required';
    }
    
    if (fieldName === 'meaning' && !value.trim()) {
      errorMessage = 'Meaning is required';
    }
    
    setErrors({ ...errors, [fieldName]: errorMessage });
    return !errorMessage;
  };

  const validateForm = () => {
    const newErrors = {
      content: !formData.content.trim() ? 'Word content is required' : '',
      meaning: !formData.meaning.trim() ? 'Meaning is required' : '',
    };
    
    setErrors(newErrors);
    setTouched({
      content: true,
      meaning: true,
    });
    
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // If there's an image file, upload it first
      let imageUrl = formData.urlImage;
      
      if (imageFile) {
        setIsUploading(true);
        imageUrl = await userService.uploadImage(imageFile, 'vocabulary');
        setIsUploading(false);
      }

      // Xử lý synonym - đảm bảo không trùng lặp với phiên âm
      let processedSynonym = formData.synonym;
      if (processedSynonym && processedSynonym.trim() === formData.transcribe.trim()) {
        processedSynonym = '';  // Nếu synonym giống phiên âm, gán = rỗng
      }

      const vocabularyData = {
        ...formData,
        urlImage: imageUrl,
        VocabularyTopicId: parseInt(topicId),
        synonym: processedSynonym || null
      };

      if (editMode && vocabularyItem) {
        vocabularyData.id = vocabularyItem.id;
      }

      console.log("Form data prepared:", vocabularyData);
      await onSubmit(vocabularyData);
      
      // Clean up the preview URL if it's from a file upload
      if (imagePreview && imageFile) {
        URL.revokeObjectURL(imagePreview);
      }
      
      onClose();
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} vocabulary:`, error);
      alert(`Failed to ${editMode ? 'update' : 'add'} vocabulary. Please try again.`);
      setIsUploading(false);
    }
  };

  return (
    <div className="add-modal-overlay">
      <div className="add-modal-content">
        <div className="add-modal-header">
          <h2>{editMode ? 'Edit Word' : 'Add New Word'}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="add-modal-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className={`form-group ${errors.content && touched.content ? 'has-error' : ''}`}>
              <label htmlFor="content">Word <span className="required">*</span></label>
              <input
                type="text"
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Enter word"
                className={errors.content && touched.content ? 'input-error' : ''}
              />
              {errors.content && touched.content && (
                <div className="error-message">{errors.content}</div>
              )}
            </div>
            
            <div className={`form-group ${errors.meaning && touched.meaning ? 'has-error' : ''}`}>
              <label htmlFor="meaning">Meaning <span className="required">*</span></label>
              <input
                type="text"
                id="meaning"
                name="meaning"
                value={formData.meaning}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Enter meaning"
                className={errors.meaning && touched.meaning ? 'input-error' : ''}
              />
              {errors.meaning && touched.meaning && (
                <div className="error-message">{errors.meaning}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="transcribe">Transcribe</label>
              <input
                type="text"
                id="transcribe"
                name="transcribe"
                value={formData.transcribe}
                onChange={handleChange}
                placeholder="Enter transcribe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="synonym">Synonym (JSON format)</label>
              <textarea
                id="synonym"
                name="synonym"
                value={formData.synonym}
                onChange={handleChange}
                placeholder='Enter synonyms (e.g., ["word1", "word2"])'
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="urlAudio">Audio URL</label>
              <input
                type="text"
                id="urlAudio"
                name="urlAudio"
                value={formData.urlAudio}
                onChange={handleChange}
                placeholder="Enter audio URL"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="urlImage">Image</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="vocabularyImage"
                  name="vocabularyImage"
                  accept="image/jpeg, image/png, image/gif"
                  onChange={handleImageChange}
                  className="file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="vocabularyImage" className="file-input-label">
                  <i className="fas fa-upload"></i> {editMode && formData.urlImage ? 'Change Image' : 'Choose Image'}
                </label>
                <span className="file-name">
                  {imageFile ? imageFile.name : (formData.urlImage && !imageFile ? 'Current image' : "No file chosen")}
                </span>
                
                {/* Keep the URL input for direct URL entry too */}
                <input
                  type="text"
                  id="urlImage"
                  name="urlImage"
                  value={formData.urlImage}
                  onChange={handleChange}
                  placeholder="Or enter image URL directly"
                  style={{ marginTop: '10px' }}
                />
              </div>
              <div className={`image-preview ${isUploading ? 'uploading' : ''}`}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" />
                ) : formData.urlImage ? (
                  <img src={formData.urlImage} alt="Preview" onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Invalid+Image+URL";
                  }} />
                ) : null}
              </div>
            </div>
            
            <div className="add-modal-footer">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={isUploading}>
                {isUploading ? 'Uploading...' : (editMode ? 'Save Changes' : 'Add Word')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Khai báo component cho modal import Excel
const ImportExcelModal = ({ isOpen, onClose, onImport, topicId }) => {
  const [file, setFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset state khi đóng modal
      setFile(null);
      setExcelData([]);
      setError('');
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Kiểm tra định dạng file
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    const validExtensions = ['xlsx', 'xls', 'csv'];
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)');
      return;
    }

    setFile(selectedFile);
    setError('');
    parseExcel(selectedFile);
  };

  const parseExcel = (file) => {
    setIsLoading(true);
    
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
          meaning: row['Nghĩa'] || row['Meaning'] ||row['meaning'] || '',
          synonym: row['Từ đồng nghĩa'] || row['Synonym'] || row['synonym'] || '',
          transcribe: row['Phiên âm'] || row['Transcribe'] || row['transcribe'] || '',
          urlAudio: row['URL Audio'] || row['Audio URL'] || row['urlAudio'] ||  '',
          urlImage: row['URL Hình ảnh'] || row['Image URL'] || row['Image'] || ''
        }));
        
        // Lọc ra các từ vựng có đủ thông tin cần thiết
        const validVocabularies = vocabularies.filter(vocab => 
          vocab.content && vocab.content.trim() !== '' && 
          vocab.meaning && vocab.meaning.trim() !== ''
        );
        
        if (validVocabularies.length === 0) {
          setError('Không tìm thấy dữ liệu từ vựng hợp lệ trong file');
          setExcelData([]);
        } else {
          setExcelData(validVocabularies);
          setError('');
        }
      } catch (err) {
        console.error('Lỗi khi đọc file Excel:', err);
        setError('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.');
        setExcelData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Lỗi khi đọc file');
      setIsLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (excelData.length === 0) {
      setError('Không có dữ liệu để import');
      return;
    }
    
    try {
      setIsLoading(true);
      await onImport(excelData);
      onClose();
    } catch (err) {
      setError('Lỗi khi import dữ liệu: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-modal-overlay">
      <div className="add-modal-content">
        <div className="add-modal-header">
          <h2>Import Từ Vựng Từ Excel</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="add-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="excelFile">Chọn file Excel:</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="excelFile"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="excelFile" className="file-input-label">
                  <i className="fas fa-upload"></i> Chọn File
                </label>
                <span className="file-name">
                  {file ? file.name : "Chưa chọn file"}
                </span>
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
            
            <div className="form-info">
              <p>
                <i className="fas fa-info-circle"></i>
                Định dạng file: File Excel (.xlsx, .xls) hoặc CSV (.csv) với các cột:
              </p>
              <ul>
                <li>Từ vựng / Word / Content (bắt buộc)</li>
                <li>Nghĩa / Meaning (bắt buộc)</li>
                <li>Từ đồng nghĩa / Synonym (tùy chọn)</li>
                <li>Phiên âm / Transcribe (tùy chọn)</li>
                <li>URL Audio (tùy chọn)</li>
                <li>URL Hình ảnh / Image URL (tùy chọn)</li>
                
              </ul>
              <p>
                <a href="/templates/vocabulary_template.xlsx" download>
                  <i className="fas fa-download"></i> Tải mẫu Excel
                </a>
              </p>
            </div>
            
            {excelData.length > 0 && (
              <VocabularyExcelPreview vocabularies={excelData} />
            )}
            
            <div className="add-modal-footer">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Hủy
              </button>
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={isLoading || excelData.length === 0}
              >
                {isLoading ? 'Đang xử lý...' : `Import ${excelData.length} từ vựng`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ManageVocabulary = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [vocabularyList, setVocabularyList] = useState([]);
  const [topicInfo, setTopicInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentVocabulary, setCurrentVocabulary] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importErrors, setImportErrors] = useState([]);

  const id = useParams().id;

  useEffect(() => {
    const fetchVocabularyTopic = async () => {
      try {
        setIsLoading(true);
        
        // Lấy thông tin chủ đề từ vựng
        const topicData = await vocabularyTopicService.getVocabularyTopicById(id);
        setTopicInfo(topicData);
        
        // Lấy danh sách các từ vựng thuộc chủ đề 
        const vocabularyData = await vocabularyService.getAllVocabularyByTopicId(id);
        setVocabularyList(vocabularyData || []);
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching vocabulary data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVocabularyTopic();
  }, [id]);

  // Add entries options
  const entriesOptions = [5, 10, 25, 50, 100];

  const handleEntriesChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  // Search functionality
  const filteredData = vocabularyList.filter(item =>
    item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.meaning?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.transcribe?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const valueA = a[sortField] || '';
    const valueB = b[sortField] || '';

    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Reset to page 1 when changing itemsPerPage or searchTerm
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm]);

  // Ensure currentPage doesn't exceed totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [currentPage, totalPages]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(sortedData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Prevent sort when clicking checkbox
  const handleCheckboxClick = (e) => {
    e.stopPropagation();
  };

  // Delete confirmation modal
  const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemToDelete, selectedItems }) => {
    if (!isOpen) return null;

    const isMultiDelete = !itemToDelete;
    const message = isMultiDelete 
      ? `Are you sure you want to delete ${selectedItems.length} selected words?`
      : `Are you sure you want to delete "${itemToDelete.content}"?`;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Confirm Delete</h2>
            <button className="close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
            <button className="confirm-delete-btn" onClick={onConfirm}>
              <i className="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Generate page numbers with dots for pagination
  const getPageNumbers = (currentPage, totalPages) => {
    const delta = 1; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    range.push(1);

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i);
      }
    }

    // Always show last page if not page 1
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Add dots for gaps
    let prev = 0;
    for (const i of range) {
      if (prev + 1 < i) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  };

  // Handle loading and error states
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Add a function to handle edit button click
  const handleEditClick = (item) => {
    setCurrentVocabulary(item);
    setEditMode(true);
    setIsFormModalOpen(true);
  };

  // Add a function to handle add new vocabulary
  const handleAddVocabulary = () => {
    setCurrentVocabulary(null);
    setEditMode(false);
    setIsFormModalOpen(true);
  };

  // Handle vocabulary submission (both add and edit)
  const handleVocabularySubmit = async (vocabularyData) => {
    try {
      if (editMode) {
        // Update existing vocabulary
        const updatedItem = await vocabularyService.updateVocabulary(vocabularyData.id, vocabularyData);
        
        // Update local state
        setVocabularyList(prevList => 
          prevList.map(item => item.id === updatedItem.id ? updatedItem : item)
        );
        
        alert('Vocabulary updated successfully');
      } else {
        // Add new vocabulary - đảm bảo topicId được đính kèm đúng
        const newVocabularyData = {
          ...vocabularyData,
          VocabularyTopicId: parseInt(id)
        };
        
        console.log("Adding new vocabulary to topic ID:", id);
        console.log("Full data being sent:", newVocabularyData);
        
        const newItem = await vocabularyService.addVocabulary(newVocabularyData);
        
        // Update local state
        setVocabularyList(prevList => [...prevList, newItem]);
        
        alert('New vocabulary added successfully');
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} vocabulary:`, error);
      
      // Hiển thị lỗi từ server nếu có
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert(`Failed to ${editMode ? 'update' : 'add'} vocabulary. Please try again.`);
      }
    }
  };

  // Thêm hàm xử lý import
  const handleImportVocabularies = async (vocabularies) => {
    try {
      const result = await vocabularyService.importVocabulariesFromExcel(id, vocabularies);
      
      if (result.data.errors && result.data.errors.length > 0) {
        setImportErrors(result.data.errors);
        alert(`Đã import ${result.data.imported.length} từ vựng thành công. Có ${result.data.errors.length} lỗi.`);
      } else {
        alert(`Đã import ${result.data.imported.length} từ vựng thành công!`);
      }
      
      // Cập nhật danh sách từ vựng
      const updatedVocabularies = await vocabularyService.getAllVocabularyByTopicId(id);
      setVocabularyList(updatedVocabularies || []);
      
      return result;
    } catch (error) {
      console.error('Lỗi khi import từ vựng:', error);
      throw error;
    }
  };

  return (
    <div className="word-container">
      <div className="topic-header">
        <button className="back-btn" onClick={() => navigate(`/admin/vocabularyTopic/`)}>
          <i className="fas fa-arrow-left"></i> Back to Topics
        </button>
        <h1 className="header-title">
          Manage Words: {topicInfo ? topicInfo.topicName : 'Loading...'}
        </h1>
      </div>
      
      <div className="pagination">
        <div className="entries-select">
          <p>Show </p>
          <select 
            value={itemsPerPage} 
            onChange={handleEntriesChange}
            className="entries-dropdown"
          >
            {entriesOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p>entries </p>
        </div>

        <div className="action-section">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
                
          <button className="add-btn" onClick={handleAddVocabulary}>
            <i className="fas fa-plus"></i>
            Add New
          </button>
          <button className="import-btn" onClick={() => setIsImportModalOpen(true)}>
            <i className="fas fa-file-import"></i>
            Import Excel
          </button>
          <button className="trash-btn">
            <i className="fas fa-trash"></i>
            Trash
          </button>
        </div>
      </div>
        
      <table className="word-table">
        <thead>
          <tr>
            <th className="id-column">
              <div className="id-header">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedItems.length === sortedData.length && sortedData.length > 0}
                  onClick={handleCheckboxClick}
                />
                <span onClick={() => handleSort('id')} className="sortable">
                  STT
                  <i className={`fas ${sortField === 'id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                </span>
              </div>
            </th>
            <th onClick={() => handleSort('content')} className="sortable">
              Word
              <i className={`fas ${sortField === 'content' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('meaning')} className="sortable">
              Meaning
              <i className={`fas ${sortField === 'meaning' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('transcribe')} className="sortable">
              Transcribe
              <i className={`fas ${sortField === 'transcribe' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th>Image</th>
            <th>Audio</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <tr key={item.id}>
                <td className="id-column">
                  <div className="id-cell">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                    <span>{item.id}</span>
                  </div>
                </td>
                <td>{item.content}</td>
                <td>{item.meaning}</td>
                <td>{item.transcribe}</td>
                <td className="image-cell">
                  {item.urlImage && (
                    <img 
                      src={item.urlImage} 
                      alt={item.content} 
                      className="word-image" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/50?text=No+Image";
                      }} 
                    />
                  )}
                </td>
                <td className="audio-cell">
                  {item.urlAudio && (
                    <audio controls className="word-audio">
                      <source src={item.urlAudio} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </td>
                <td>
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditClick(item)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => {
                      setItemToDelete(item);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="empty-table">
                <div className="empty-message">
                  <i className="fas fa-book"></i>
                  <p>No words found for this topic</p>
                  <button className="add-btn" onClick={handleAddVocabulary}>
                    <i className="fas fa-plus"></i> Add Word
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {currentItems.length > 0 && (
        <div className="pagination">
          <span>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="pagination-buttons">
            <button 
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              Previous
            </button>
            
            {getPageNumbers(currentPage, totalPages).map((item, index) => (
              item === '...' ? (
                <span key={`dots-${index}`} className="page-dots">...</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`page-btn ${currentPage === item ? 'active' : ''}`}
                >
                  {item}
                </button>
              )
            ))}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="table-action-bar">
          <div className="action-bar-content">
            <span>{selectedItems.length} items selected</span>
            <button 
              className="delete-selected-btn"
              onClick={() => {
                setItemToDelete(null); // null indicates multi-delete
                setIsDeleteModalOpen(true);
              }}
            >
              <i className="fas fa-trash"></i>
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={async () => {
          try {
            if (itemToDelete) {
              // Xóa một từ vựng
              await vocabularyService.deleteVocabulary(itemToDelete.id);
              setVocabularyList(prev => prev.filter(item => item.id !== itemToDelete.id));
              alert(`"${itemToDelete.content}" has been deleted successfully.`);
            } else {
              // Xóa nhiều từ vựng
              const deletePromises = selectedItems.map(id => vocabularyService.deleteVocabulary(id));
              await Promise.all(deletePromises);
              setVocabularyList(prev => prev.filter(item => !selectedItems.includes(item.id)));
              alert(`${selectedItems.length} words have been deleted successfully.`);
            }
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            setSelectedItems([]);
          } catch (error) {
            console.error('Error deleting vocabulary:', error);
            alert('Failed to delete vocabulary. Please try again.');
          }
        }}
        itemToDelete={itemToDelete}
        selectedItems={selectedItems}
      />

      <VocabularyFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setCurrentVocabulary(null);
          setEditMode(false);
        }}
        onSubmit={handleVocabularySubmit}
        vocabularyItem={currentVocabulary}
        topicId={id}
        editMode={editMode}
      />
      
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportVocabularies}
        topicId={id}
      />
    </div>
  );
};

export default ManageVocabulary;