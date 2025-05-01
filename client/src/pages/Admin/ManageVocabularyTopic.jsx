import React, {useState, useEffect} from 'react';
import  '../../styles/ManageVocabularyTopic.css';
import vocabularyTopicService from '../../services/admin/admin.vocabularyTopicService';
import userService from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { parseVocabularyExcel, isValidExcelFile } from '../../utils/excelUtils';
import SuccessAlert from '../../components/SuccessAlert';
import ErrorAlert from '../../components/ErrorAlert';


const AddTopicModal = ({isOpen, onClose, onAdd, editMode = false, topicToEdit = null, isSubmitting = false}) => {
  const [formData, setFormData] = useState({
    topicName: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [topicImage, setTopicImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [vocabularyFile, setVocabularyFile] = useState(null);
  const [vocabularyItems, setVocabularyItems] = useState([]);
  const [errors, setErrors] = useState({
    topicName: '',
    topicImage: ''
  });
  const [touched, setTouched] = useState({
    topicName: false,
    topicImage: false
  });
  const [serverError, setServerError] = useState(''); // Keep for state management
  // State để hiển thị ErrorAlert cho server error
  const [showServerErrorAlert, setShowServerErrorAlert] = useState(false);
  
  // State để lưu danh sách tên topic hiện có
  const [existingTopicNames, setExistingTopicNames] = useState([]);
  
  // Tính toán trạng thái loading tổng hợp (từ cả local và parent)
  const isLoading = isUploading || isSubmitting;

  // Lấy danh sách tên topic hiện có khi component mount
  useEffect(() => {
    const fetchExistingTopics = async () => {
      try {
        const data = await vocabularyTopicService.getAllVocabularyTopics();
        // Lọc danh sách các tên topic, bỏ qua tên của topic đang được chỉnh sửa (nếu có)
        const topicNames = data
          .filter(item => !editMode || item.vocabularyTopic.id !== topicToEdit?.id)
          .map(item => item.vocabularyTopic.topicName.toLowerCase());
        setExistingTopicNames(topicNames);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };
    
    if (isOpen) {
      fetchExistingTopics();
      setServerError(''); // Clear server error when modal opens
    }
  }, [isOpen, editMode, topicToEdit]);

  // Khi modal mở và ở chế độ chỉnh sửa, cập nhật formData từ topicToEdit
  useEffect(() => {
    if (isOpen && editMode && topicToEdit) {
      setFormData({
        topicName: topicToEdit.topicName || '',
      });
      
      // Nếu có ảnh, hiển thị preview
      if (topicToEdit.imageUrl) {
        setImagePreview(topicToEdit.imageUrl);
      }
    } else if (isOpen && !editMode) {
      // Reset form khi mở modal ở chế độ thêm mới
      setFormData({ topicName: '' });
      setTopicImage(null);
      setImagePreview('');
      setVocabularyFile(null);
      setVocabularyItems([]);
      setErrors({
        topicName: '',
        topicImage: ''
      });
      setTouched({
        topicName: false,
        topicImage: false
      });
      setServerError('');
      setShowServerErrorAlert(false);
    }
  }, [isOpen, editMode, topicToEdit]);

  if(!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
    
    // Clear error when user types
    if (value.trim()) {
      setErrors({...errors, [name]: ''});
    }
    // Clear server error when user makes changes
    setServerError('');
    setShowServerErrorAlert(false);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({...touched, [name]: true});
    
    // Validate on blur
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let errorMessage = '';
    
    if (fieldName === 'topicName') {
      if (!value.trim()) {
        errorMessage = 'Topic name is required';
      } else if (existingTopicNames.includes(value.trim().toLowerCase())) {
        errorMessage = 'Topic name already exists';
      }
    }
    
    setErrors({...errors, [fieldName]: errorMessage});
    return !errorMessage;
  };

  const validateForm = () => {
    const topicNameValue = formData.topicName.trim();
    
    const newErrors = {
      topicName: !topicNameValue ? 'Topic name is required' : 
                (existingTopicNames.includes(topicNameValue.toLowerCase()) ? 'Topic name already exists' : ''),
      // Không yêu cầu hình ảnh mới nếu đang chỉnh sửa và đã có ảnh cũ
      topicImage: !topicImage && !imagePreview ? 'Topic image is required' : ''
    };
    
    setErrors(newErrors);
    setTouched({
      topicName: true,
      topicImage: true
    });
    
    return !Object.values(newErrors).some(error => error);
  };

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
      
      setTopicImage(file);
      setErrors({...errors, topicImage: ''});
    }
  };

  const handleVocabularyFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Kiểm tra định dạng file
    if (!isValidExcelFile(file)) {
      alert('Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV (.csv)');
      return;
    }
    
    setVocabularyFile(file);
    
    try {
      setIsUploading(true); // Thêm loading khi đang xử lý file
      const result = await parseVocabularyExcel(file);
      if (result.error) {
        alert(result.error);
        setVocabularyItems([]);
      } else {
        setVocabularyItems(result.vocabularies);
        console.log('Đã đọc được', result.vocabularies.length, 'từ vựng từ file Excel/CSV');
      }
    } catch (error) {
      console.error('Lỗi khi đọc file:', error);
      alert('Không thể đọc file. Vui lòng kiểm tra định dạng file: ' + error.message);
      setVocabularyItems([]);
    } finally {
      setIsUploading(false); // Kết thúc loading sau khi xử lý xong
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(''); // Clear server error on new submission
    setShowServerErrorAlert(false);

    if (!validateForm()) {
      return;
    }
    
    if (isLoading) { // Không cho phép submit nếu đang loading
      return;
    }

    try {
      setIsUploading(true); // Bắt đầu loading khi submit
      let imageUrl = '';
      
      // Nếu có file ảnh mới, upload
      if (topicImage) {
        imageUrl = await userService.uploadImage(topicImage, 'vocabularyTopic');
      } else if (editMode && topicToEdit.imageUrl) {
        // Nếu không có file ảnh mới nhưng đang edit và có URL ảnh cũ
        imageUrl = topicToEdit.imageUrl;
      }
      
      const updatedTopic = {
        ...topicToEdit, // Giữ nguyên ID và các thông tin khác nếu đang edit
        topicName: formData.topicName,
        imageUrl: imageUrl,
        date: editMode ? topicToEdit.date : new Date().toISOString().split('T')[0],
        vocabularies: vocabularyItems // Thêm danh sách từ vựng từ file Excel
      };

      try {
        await onAdd(updatedTopic, editMode);
        // Để cho parent component đóng modal
      } catch (error) {
        // Handle server-side validation errors
        setServerError(error.message || 'An error occurred. Please try again.');
        setShowServerErrorAlert(true);
        return;
      } finally {
        setIsUploading(false); // Chỉ kết thúc loading local, parent component sẽ quản lý isSubmitting
      }
      
      // Clean up the preview URL
      if (imagePreview && topicImage) { // Chỉ xóa URL khi đó là URL tạm
        URL.revokeObjectURL(imagePreview);
      }
    } catch (error) {
      console.error('Error:', error);
      setServerError(error.message || 'An error occurred. Please try again.');
      setShowServerErrorAlert(true);
    }
  };

 return (
    <div className="vocabularyTopic-add-modal-overlay">
      <div className="vocabularyTopic-add-modal-content">
        <div className="vocabularyTopic-add-modal-header">
          <h2>{editMode ? 'Edit Topic' : 'Add New Topic'}</h2>
          <button type="button" className="vocabularyTopic-close-btn" onClick={onClose} disabled={isLoading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="vocabularyTopic-add-modal-body">
          {/* Thay thế hiển thị lỗi server bằng ErrorAlert */}
          <ErrorAlert
            show={showServerErrorAlert}
            message={serverError}
            onClose={() => setShowServerErrorAlert(false)}
          />
          <form onSubmit={handleSubmit} noValidate>
            <div className={`vocabularyTopic-form-group ${errors.topicName && touched.topicName ? 'has-error' : ''}`}>
              <label htmlFor="topicName">Topic Name <span className="required">*</span></label>
              <input
                type="text"
                id="topicName"
                name="topicName"
                value={formData.topicName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Enter topic name"
                className={errors.topicName && touched.topicName ? 'vocabularyTopic-input-error' : ''}
                disabled={isLoading}
              />
              {errors.topicName && touched.topicName && (
                <div className="vocabularyTopic-error-message">{errors.topicName}</div>
              )}
            </div>
            
            <div className={`vocabularyTopic-form-group ${errors.topicImage && touched.topicImage ? 'has-error' : ''}`}>
              <label htmlFor="topicImage">Topic Image <span className="required">*</span></label>
              <div className="vocabularyTopic-image-upload-container">
                <input
                  type="file"
                  id="topicImage"
                  name="topicImage"
                  accept="image/jpeg, image/png, image/gif"
                  onChange={handleImageChange}
                  className="vocabularyTopic-file-input"
                  style={{ display: 'none' }}
                  disabled={isLoading} 
                />
                <label htmlFor="topicImage" className={`vocabularyTopic-file-input-label ${isLoading ? 'disabled' : ''}`}>
                  <i className="fas fa-upload"></i> {editMode ? 'Change Image' : 'Choose Image'}
                </label>
                <span className="vocabularyTopic-file-name">
                  {topicImage ? topicImage.name : (imagePreview && editMode ? "Current image" : "No file chosen")}
                </span>
              </div>
              {errors.topicImage && touched.topicImage && (
                <div className="vocabularyTopic-error-message">{errors.topicImage}</div>
              )}
              <div className="vocabularyTopic-image-preview">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" />
                )}
              </div>
            </div>
            
            <div className="vocabularyTopic-file-upload-section">
              <div className="vocabularyTopic-form-group vocabularyTopic-file-upload">
                <label htmlFor="vocabularyFile" className={isLoading ? 'disabled' : ''}>
                  <i className="fas fa-file-excel"></i>
                  Upload Vocabulary Excel File 
                </label>
                <input
                  type="file"
                  id="vocabularyFile"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleVocabularyFileChange}
                  className="vocabularyTopic-file-input"
                  disabled={isLoading}
                />
                <div className="vocabularyTopic-file-info">
                  {vocabularyFile ? vocabularyFile.name : "No file chosen"}
                  {vocabularyItems.length > 0 && (
                    <span className="vocabularyTopic-file-status">
                      ({vocabularyItems.length} items loaded)
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="vocabularyTopic-add-modal-footer">
              <button type="button" className="vocabularyTopic-cancel-btn" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" className="vocabularyTopic-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> 
                    Loading...
                  </>
                ) : (
                  editMode ? 'Save Changes' : 'Add Topic'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 

const ManageVocabularyTopic = () => {
  const navigate = useNavigate();
  const [vocabularyList, setVocabularyList] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // State để quản lý trạng thái loading
  const [error, setError] = useState(null); // State để quản lý lỗi

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Change from const to state
  const [sortField, setSortField] = useState('vocabularyTopic.id');
  const [sortDirection, setSortDirection] = useState('asc');

  const [selectedItems, setSelectedItems] = useState([]);

  // Thêm state để quản lý modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // Thêm state này
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // New state for add modal
  const [isSubmitting, setIsSubmitting] = useState(false); // Add state for form submission status

  // Thêm state cho chế độ chỉnh sửa
  const [editMode, setEditMode] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState(null);

  // Thêm state để quản lý thông báo thành công
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Thêm state để quản lý thông báo lỗi
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchVocabularyTopics();
  }, []);

  const fetchVocabularyTopics = async () => {
    try {
      setIsLoading(true); // Bắt đầu loading
      const data = await vocabularyTopicService.getAllVocabularyTopics(); // Gọi API
      setVocabularyList(data); // Lưu dữ liệu vào state
    } catch (err) {
      setError(err.message); // Lưu lỗi nếu có
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

   // Hàm hiển thị thông báo thành công
   const displaySuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessAlert(true);
  };
  
  // Hàm hiển thị thông báo lỗi
  const displayErrorMessage = (message) => {
    setErrorMessage(message);
    setShowErrorAlert(true);
  };

  // Handle adding or updating a topic
  const handleAddOrUpdateTopic = async (topic, isEdit) => {
    try {
      setIsSubmitting(true);
      if (isEdit) {
        // Update existing topic
        await vocabularyTopicService.updateVocabularyTopic(topic.id, topic);
        displaySuccessMessage('Topic updated successfully!');
      } else {
        // Add new topic
        await vocabularyTopicService.addVocabularyTopic(topic);
        displaySuccessMessage('Topic added successfully!');
      }
      
      // Refresh the list
      await fetchVocabularyTopics();

      setIsAddModalOpen(false);
      setEditMode(false);
      setTopicToEdit(null);
    } catch (error) {
      console.error('Error:', error);
      displayErrorMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add entries options
  const entriesOptions = [5, 10, 25, 50, 100];

  const handleEntriesChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  // Xử lý tìm kiếm
  const filteredData = vocabularyList.filter(item =>
    item.vocabularyTopic.topicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vocabularyTopic.imageURL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.count.toString().includes(searchTerm) ||
    item.vocabularyTopic.createAt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vocabularyTopic.id.toString().includes(searchTerm)
  );

  // Đầu tiên sort data
  const sortedData = [...filteredData].sort((a, b) => {
    // Handle nested properties for sorting
    const getSortValue = (obj, field) => {
      // If field contains dot notation, it's a nested property
      if (field.includes('.')) {
        const parts = field.split('.');
        let value = obj;
        for (const part of parts) {
          if (value === null || value === undefined) return '';
          value = value[part];
        }
        return value;
      }
      // Regular property
      return obj[field];
    };

    const valueA = getSortValue(a, sortField);
    const valueB = getSortValue(b, sortField);

    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // Sau đó mới tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Thêm useEffect để reset về trang 1 khi thay đổi itemsPerPage hoặc searchTerm
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm]);

  // Đảm bảo currentPage không vượt quá totalPages
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
      setSelectedItems(sortedData.map(item => item.vocabularyTopic.id));
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

  // Add this handler to prevent sort when clicking checkbox
  const handleCheckboxClick = (e) => {
    e.stopPropagation(); // This prevents the click event from bubbling up to the th element
  };

  // Thêm hàm mở modal cho chế độ chỉnh sửa
  const handleEditClick = (item) => {
    setTopicToEdit({
      id: item.vocabularyTopic.id,
      topicName: item.vocabularyTopic.topicName,
      imageUrl: item.vocabularyTopic.imageUrl,
      date: item.vocabularyTopic.createAt
    });
    setEditMode(true);
    setIsAddModalOpen(true);
  };

  // Component Modal được sửa để handle cả xóa một và nhiều items
  const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemToDelete, selectedItems }) => {
    if (!isOpen) return null;

    const isMultiDelete = !itemToDelete;
    const message = isMultiDelete 
      ? `Are you sure you want to delete ${selectedItems.length} selected items?`
      : `Are you sure you want to delete "${itemToDelete.vocabularyTopic.topicName}"?`;

    return (
      <div className="vocabularyTopic-modal-overlay">
        <div className="vocabularyTopic-modal-content">
          <div className="vocabularyTopic-modal-header">
            <h2>Confirm Delete</h2>
            <button className="vocabularyTopic-close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="vocabularyTopic-modal-body">
            <p>{message}</p>
          </div>
          <div className="vocabularyTopic-modal-footer">
            <button className="vocabularyTopic-cancel-btn" onClick={onClose}>Cancel</button>
            <button className="vocabularyTopic-confirm-delete-btn" onClick={onConfirm}>
              <i className="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Thêm hàm tạo mảng số trang với dấu ...
  const getPageNumbers = (currentPage, totalPages) => {
    const delta = 1; // Số trang hiển thị ở hai bên trang hiện tại
    const range = [];
    const rangeWithDots = [];

    // Luôn hiển thị trang đầu
    range.push(1);

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i);
      }
    }

    // Luôn hiển thị trang cuối nếu không phải trang 1
    if (currentPage < totalPages) {
      range.push(totalPages);
    }

    // Thêm dấu ... vào các khoảng trống
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

  // Xử lý lỗi hoặc trạng thái loading
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="vocabularyTopic-container">
      {/* Thêm SuccessAlert component */}
      <SuccessAlert 
        show={showSuccessAlert} 
        message={successMessage} 
        onClose={() => setShowSuccessAlert(false)} 
      />
      
      {/* Thêm ErrorAlert component */}
      <ErrorAlert 
        show={showErrorAlert} 
        message={errorMessage} 
        onClose={() => setShowErrorAlert(false)} 
      />
      
      <h1 className="vocabularyTopic-header-title">Manage Vocabulary Topic</h1>
      <div className="vocabularyTopic-header-section">
      </div>
      <div className="vocabularyTopic-pagination">
        <div className="vocabularyTopic-entries-select">
          <p>Show </p>
          <select 
            value={itemsPerPage} 
            onChange={handleEntriesChange}
            className="vocabularyTopic-entries-dropdown"
          >
            {entriesOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p>entries </p>
        </div>

        <div className="vocabularyTopic-action-section">
          <div className="vocabularyTopic-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search..."
              className="vocabularyTopic-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
                
          <button className="vocabularyTopic-add-btn" onClick={() => setIsAddModalOpen(true)}>
            <i className="fas fa-plus"></i>
            Add New
          </button>
          <button className="vocabularyTopic-trash-btn">
            <i className="fas fa-trash"></i>
            Trash
          </button>
        </div>
      </div>
        
      <table className="vocabularyTopic-table">
        <thead>
          <tr>
            <th className="vocabularyTopic-id-column">
              <div className="vocabularyTopic-id-header">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedItems.length === sortedData.length}
                  onClick={handleCheckboxClick}
                />
                <span onClick={() => handleSort('vocabularyTopic.id')} className="vocabularyTopic-sortable">
                  ID
                  <i className={`fas ${sortField === 'vocabularyTopic.id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                </span>
              </div>
            </th>
            <th onClick={() => handleSort('vocabularyTopic.topicName')} className="vocabularyTopic-sortable">
              Topic name
              <i className={`fas ${sortField === 'vocabularyTopic.topicName' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('vocabularyTopic.imageUrl')} className="vocabularyTopic-sortable image-url-column">
              Image
              {/* <i className={`fas ${sortField === 'vocabularyTopic.imageUrl' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} /> */}
            </th>
            <th onClick={() => handleSort('count')} className="vocabularyTopic-sortable">
              Number of words
              <i className={`fas ${sortField === 'count' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('vocabularyTopic.createdAt')} className="vocabularyTopic-sortable">
              Date created
              <i className={`fas ${sortField === 'vocabularyTopic.createdAt' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
            <tr key={item.vocabularyTopic.id}>
              <td className="vocabularyTopic-id-column">
                <div className="vocabularyTopic-id-cell">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.vocabularyTopic.id)}
                    onChange={() => handleSelectItem(item.vocabularyTopic.id)}
                  />
                  <span>{item.vocabularyTopic.id}</span>
                </div>
              </td>
              <td>{item.vocabularyTopic.topicName}</td>
              <td className="vocabularyTopic-image-cell">
                {item.vocabularyTopic.imageUrl && (
                  <img 
                    src={item.vocabularyTopic.imageUrl} 
                    alt={item.vocabularyTopic.topicName} 
                    className="vocabularyTopic-image" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/50?text=No+Image";
                    }} 
                  />
                )}
              </td>
              <td>{item.count}</td>
              <td>
                <span className={item.vocabularyTopic.createdAt.split('T')[0]} >
                  {item.vocabularyTopic.createdAt.split('T')[0]}
                </span>
              </td>
              <td>
                <button 
                  className="vocabularyTopic-view-btn"
                  onClick={() => navigate(`/admin/vocabularyTopic/${item.vocabularyTopic.id}/vocabularies`)}
                >
                  <i className="fa-solid fa-eye"></i>
                </button>

                <button 
                  className="vocabularyTopic-edit-btn"
                  onClick={() => handleEditClick(item)}
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
                <button 
                  className="vocabularyTopic-delete-btn"
                  onClick={() => {
                    setItemToDelete(item);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="vocabularyTopic-pagination">
        <span>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
        </span>
        <div className="vocabularyTopic-pagination-buttons">
          <button 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="vocabularyTopic-page-btn"
          >
            Previous
          </button>
          
          {getPageNumbers(currentPage, totalPages).map((item, index) => (
            item === '...' ? (
              <span key={`dots-${index}`} className="vocabularyTopic-page-dots">...</span>
            ) : (
              <button
                key={item}
                onClick={() => setCurrentPage(item)}
                className={`vocabularyTopic-page-btn ${currentPage === item ? 'active' : ''}`}
              >
                {item}
              </button>
            )
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="vocabularyTopic-page-btn"
          >
            Next
          </button>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="vocabularyTopic-table-action-bar">
          <div className="vocabularyTopic-action-bar-content">
            <span>{selectedItems.length} items selected</span>
            <button 
              className="vocabularyTopic-delete-selected-btn"
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

      {/* Thêm Modal vào cuối component với logic xử lý cả hai trường hợp */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={async () => {
          try {
            if (itemToDelete) {
              // Xử lý xóa một item
              console.log("Deleting single item:", itemToDelete);
              await vocabularyTopicService.deleteVocabularyTopic(itemToDelete.vocabularyTopic.id);
              displaySuccessMessage(`Topic "${itemToDelete.vocabularyTopic.topicName}" deleted successfully!`);

            } else {
              // Xử lý xóa nhiều items
              console.log("Deleting multiple items:", selectedItems);
              // Implement batch delete if your API supports it
              // For now, we'll delete them one by one
              for (const id of selectedItems) {
                await vocabularyTopicService.deleteVocabularyTopic(id);
              }
              displaySuccessMessage(`Topic "${itemToDelete.vocabularyTopic.topicName}" deleted successfully!`);

            }
            
            // Refresh the list
            await fetchVocabularyTopics();
            // Reset selected items
            setSelectedItems([]);
            
          } catch (error) {
            console.error("Error deleting items:", error);
            alert("Failed to delete items. Please try again.");
          }
          
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        itemToDelete={itemToDelete}
        selectedItems={selectedItems}
      />

      <AddTopicModal
        isOpen={isAddModalOpen}
        onClose={() => {
          if(!isSubmitting) {
            setIsAddModalOpen(false);
            setEditMode(false);
            setTopicToEdit(null);
          }
          
        }}
        onAdd={handleAddOrUpdateTopic}
        editMode={editMode}
        topicToEdit={topicToEdit}
        isSubmitting={isSubmitting} // Pass isSubmitting state
      />
    </div>
  );  
};   

export default ManageVocabularyTopic;