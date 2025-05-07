import React, {useState, useEffect} from 'react';
import  '../../styles/ManageGrammarTopic.css';
import grammarTopicService from '../../services/admin/admin.grammarTopicService';
import userService from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { parseDocxToHtml, isValidDocxFile } from '../../utils/wordUtils';

const AddTopicModal = ({isOpen, onClose, onAdd, editMode = false, topicToEdit = null, isSubmitting = false}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [topicImage, setTopicImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [wordFile, setWordFile] = useState(null);
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    topicImage: ''
  });
  const [touched, setTouched] = useState({
    title: false,
    content: false,
    topicImage: false
  });
  const [serverError, setServerError] = useState('');
  // State để lưu danh sách tên topic hiện có
  const [existingTopicTitles, setExistingTopicTitles] = useState([]);
  
  // Tính toán trạng thái loading tổng hợp (từ cả local và parent)
  const isLoading = isUploading || isSubmitting;

  // Lấy danh sách tiêu đề topic hiện có khi component mount
  useEffect(() => {
    const fetchExistingTopics = async () => {
      try {
        const data = await grammarTopicService.getAllGrammarTopics();
        // Lọc danh sách các tiêu đề topic, bỏ qua tiêu đề của topic đang được chỉnh sửa (nếu có)
        const topicTitles = data
          .filter(item => !editMode || item.grammarTopic.id !== topicToEdit?.id)
          .map(item => item.grammarTopic.title.toLowerCase());
        setExistingTopicTitles(topicTitles);
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
        title: topicToEdit.title || '',
        content: topicToEdit.content || '',
      });
      
      // Nếu có ảnh, hiển thị preview
      if (topicToEdit.imageUrl) {
        setImagePreview(topicToEdit.imageUrl);
      }
    } else if (isOpen && !editMode) {
      // Reset form khi mở modal ở chế độ thêm mới
      setFormData({ 
        title: '', 
        content: '' 
      });
      setTopicImage(null);
      setImagePreview('');
      setWordFile(null);
      setErrors({
        title: '',
        content: '',
        topicImage: ''
      });
      setTouched({
        title: false,
        content: false,
        topicImage: false
      });
      setServerError('');
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
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({...touched, [name]: true});
    
    // Validate on blur
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let errorMessage = '';
    
    if (fieldName === 'title') {
      if (!value.trim()) {
        errorMessage = 'Tiêu đề không được để trống';
      } else if (existingTopicTitles.includes(value.trim().toLowerCase())) {
        errorMessage = 'Tiêu đề này đã tồn tại';
      }
    }
    
    setErrors({...errors, [fieldName]: errorMessage});
    return !errorMessage;
  };

  const validateForm = () => {
    const titleValue = formData.title.trim();
    
    const newErrors = {
      title: !titleValue ? 'Tiêu đề không được để trống' : 
            (existingTopicTitles.includes(titleValue.toLowerCase()) && !editMode ? 'Tiêu đề này đã tồn tại' : ''),
      // Không yêu cầu hình ảnh mới nếu đang chỉnh sửa và đã có ảnh cũ
      topicImage: !topicImage && !imagePreview ? 'Hình ảnh không được để trống' : ''
    };
    
    setErrors(newErrors);
    setTouched({
      title: true,
      content: true,
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
        alert('Chỉ chấp nhận file JPG, PNG hoặc GIF');
        return;
      }

      if (file.size > maxSize) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }

      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      
      setImagePreview(previewUrl);
      setTopicImage(file);
      setErrors({...errors, topicImage: ''});
    }
  };

  const handleWordFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Kiểm tra định dạng file
    if (!isValidDocxFile(file)) {
      alert('Chỉ chấp nhận file Word (.docx)');
      return;
    }
    
    setWordFile(file);
    
    try {
      setIsUploading(true); // Thêm loading khi đang xử lý file
      const result = await parseDocxToHtml(file);
      if (result.error) {
        alert(result.error);
      } else {
        setFormData(prev => ({ ...prev, content: result.html }));
        console.log('Đã chuyển đổi file Word thành HTML');
      }
    } catch (error) {
      console.error('Lỗi khi đọc file:', error);
      alert('Không thể đọc file. Vui lòng kiểm tra định dạng file: ' + error.message);
    } finally {
      setIsUploading(false); // Kết thúc loading sau khi xử lý xong
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(''); // Clear server error on new submission

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
        try {
          // Sử dụng userService để upload ảnh
          console.log('Uploading image file:', topicImage);
          imageUrl = await userService.uploadImage(topicImage, 'grammarTopic');
          console.log('Image uploaded successfully, URL:', imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          setServerError('Lỗi khi tải lên hình ảnh. Vui lòng thử lại.');
          setIsUploading(false);
          return;
        }
      } else if (editMode && topicToEdit.imageUrl) {
        // Nếu không có file ảnh mới nhưng đang edit và có URL ảnh cũ
        imageUrl = topicToEdit.imageUrl;
        console.log('Using existing image URL:', imageUrl);
      }
      
      const updatedTopic = {
        title: formData.title,
        content: formData.content,
        imageUrl: imageUrl
      };
      
      console.log('Saving topic with data:', updatedTopic);

      try {
        await onAdd(updatedTopic, editMode);
        // Để cho parent component đóng modal
      } catch (error) {
        // Handle server-side validation errors
        setServerError(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
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
      setServerError(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      setIsUploading(false);
    }
  };

 return (
    <div className="ManageGrammarTopic-modal-overlay">
      <div className="ManageGrammarTopic-modal-content">
        <div className="ManageGrammarTopic-modal-header">
          <h2>{editMode ? 'Chỉnh sửa chủ đề' : 'Thêm chủ đề mới'}</h2>
          <button type="button" className="ManageGrammarTopic-close-btn" onClick={onClose} disabled={isLoading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="ManageGrammarTopic-modal-body">
          {serverError && (
            <div className="ManageGrammarTopic-error-message">{serverError}</div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className={`ManageGrammarTopic-form-group ${errors.title && touched.title ? 'has-error' : ''}`}>
              <label htmlFor="title">Tiêu đề <span className="ManageGrammarTopic-required">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Nhập tiêu đề chủ đề"
                disabled={isLoading}
              />
              {errors.title && touched.title && (
                <div className="ManageGrammarTopic-error-message">{errors.title}</div>
              )}
            </div>
            
            <div className="ManageGrammarTopic-form-group">
              <label htmlFor="content">Nội dung</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={5}
                placeholder="Nhập nội dung hoặc tải lên file Word"
                disabled={isLoading}
              ></textarea>
            </div>
            
            <div className="ManageGrammarTopic-doc-file-upload">
              <label htmlFor="wordFile" className="ManageGrammarTopic-doc-file-label">
                <i className="fas fa-file-word"></i> Tải lên file Word
              </label>
              <input
                type="file"
                id="wordFile"
                accept=".docx"
                onChange={handleWordFileChange}
                style={{ display: 'none' }}
                disabled={isLoading}
              />
              <span className="ManageGrammarTopic-doc-file-name">
                {wordFile ? wordFile.name : "Chưa chọn file nào"}
              </span>
            </div>
            
            <div className={`ManageGrammarTopic-form-group ${errors.topicImage && touched.topicImage ? 'has-error' : ''}`}>
              <label htmlFor="topicImage">Hình ảnh <span className="ManageGrammarTopic-required">*</span></label>
              <div className="ManageGrammarTopic-image-upload-container">
                <label htmlFor="topicImage" className="ManageGrammarTopic-image-file-label">
                  <i className="fas fa-upload"></i> {editMode ? 'Thay đổi hình ảnh' : 'Chọn hình ảnh'}
                </label>
                <input
                  type="file"
                  id="topicImage"
                  name="topicImage"
                  accept="image/jpeg, image/png, image/gif"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  disabled={isLoading}
                />
                <span className="ManageGrammarTopic-image-file-name">
                  {topicImage ? topicImage.name : (imagePreview && editMode ? "Hình ảnh hiện tại" : "Chưa chọn hình ảnh")}
                </span>
              </div>
              {errors.topicImage && touched.topicImage && (
                <div className="ManageGrammarTopic-error-message">{errors.topicImage}</div>
              )}
              <div className="ManageGrammarTopic-image-preview">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" />
                )}
              </div>
            </div>
            
            <div className="ManageGrammarTopic-modal-footer">
              <button type="button" className="ManageGrammarTopic-cancel-btn" onClick={onClose} disabled={isLoading}>
                Hủy bỏ
              </button>
              <button type="submit" className="ManageGrammarTopic-save-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> 
                    Đang xử lý...
                  </>
                ) : (
                  editMode ? 'Lưu thay đổi' : 'Thêm chủ đề'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const ManageGrammarTopic = () => {
  const navigate = useNavigate();
  const [grammarTopicList, setGrammarTopicList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortField, setSortField] = useState('grammarTopic.id');
  const [sortDirection, setSortDirection] = useState('asc');

  const [selectedItems, setSelectedItems] = useState([]);

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState(null);

  useEffect(() => {
    fetchGrammarTopics();
  }, []);

  const fetchGrammarTopics = async () => {
    try {
      setIsLoading(true);
      const data = await grammarTopicService.getAllGrammarTopics();
      console.log('Grammar topics data:', data); // Debug data structure
      
      // Chuẩn hóa dữ liệu trả về, đảm bảo tất cả đều sử dụng trường imageUrl
      const normalizedData = data.map(item => {
        if (item.grammarTopic) {
          // Đảm bảo trường imageUrl tồn tại và được sử dụng
          if (item.grammarTopic.imgUrl && !item.grammarTopic.imageUrl) {
            item.grammarTopic.imageUrl = item.grammarTopic.imgUrl;
          }
        }
        return item;
      });
      
      setGrammarTopicList(normalizedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding or updating a topic
  const handleAddOrUpdateTopic = async (topic, isEdit) => {
    try {
      setIsSubmitting(true);
      if (isEdit) {
        // Update existing topic
        await grammarTopicService.updateGrammarTopic(topicToEdit.id, topic);
        alert('Cập nhật chủ đề thành công!');
      } else {
        // Add new topic
        await grammarTopicService.addGrammarTopic(topic);
        alert('Thêm chủ đề thành công!');
      }
      
      // Refresh the list
      await fetchGrammarTopics();

      setIsAddModalOpen(false);
      setEditMode(false);
      setTopicToEdit(null);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
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
  const filteredData = grammarTopicList.filter(item =>
    item.grammarTopic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.grammarTopic.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.exerciseCount.toString().includes(searchTerm) ||
    item.grammarTopic.id.toString().includes(searchTerm)
  );

  // Sort data
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Reset to page 1 when changing items per page or search term
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
      setSelectedItems(sortedData.map(item => item.grammarTopic.id));
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

  // Edit mode handler
  const handleEditClick = (item) => {
    // Chuẩn hóa dữ liệu trước khi gán cho trạng thái chỉnh sửa
    const imageUrl = item.grammarTopic.imageUrl || item.grammarTopic.imgUrl || '';
    
    setTopicToEdit({
      id: item.grammarTopic.id,
      title: item.grammarTopic.title,
      content: item.grammarTopic.content,
      imageUrl: imageUrl
    });
    setEditMode(true);
    setIsAddModalOpen(true);
  };

  // Delete confirmation modal
  const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemToDelete, selectedItems }) => {
    if (!isOpen) return null;

    const isMultiDelete = !itemToDelete;
    const message = isMultiDelete 
      ? `Bạn có chắc chắn muốn xóa ${selectedItems.length} chủ đề đã chọn không?`
      : `Bạn có chắc chắn muốn xóa chủ đề "${itemToDelete.grammarTopic.title}" không?`;

    return (
      <div className="ManageGrammarTopic-modal-overlay">
        <div className="ManageGrammarTopic-modal-content">
          <div className="ManageGrammarTopic-modal-header">
            <h2>Confirm Delete</h2>
            <button className="ManageGrammarTopic-close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="ManageGrammarTopic-modal-body">
            <p>{message}</p>
          </div>
          <div className="ManageGrammarTopic-modal-footer">
            <button className="ManageGrammarTopic-cancel-btn" onClick={onClose}>Cancel</button>
            <button className="ManageGrammarTopic-confirm-delete-btn" onClick={onConfirm}>
              <i className="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Page numbers with dots
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
    return <div className="ManageGrammarTopic-loading">Loading...</div>;
  }

  if (error) {
    return <div className="ManageGrammarTopic-error">Error: {error}</div>;
  }

  return (
    <div className="ManageGrammarTopic-container">
      <h1 className="ManageGrammarTopic-header-title">Manage Grammar Topic</h1>
      
      <div className="ManageGrammarTopic-pagination">
        <div className="ManageGrammarTopic-entries-select">
          <p>Hiển thị </p>
          <select 
            value={itemsPerPage} 
            onChange={handleEntriesChange}
            className="ManageGrammarTopic-entries-dropdown"
          >
            {entriesOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p>mục </p>
        </div>

        <div className="ManageGrammarTopic-action-section">
          <div className="ManageGrammarTopic-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search..."
              className="ManageGrammarTopic-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
                
          <button className="ManageGrammarTopic-add-btn" onClick={() => setIsAddModalOpen(true)}>
            <i className="fas fa-plus"></i>
            Add New
          </button>
        </div>
      </div>
        
      {filteredData.length === 0 ? (
        <div className="ManageGrammarTopic-empty-table">
          <div className="ManageGrammarTopic-empty-message">
            <i className="fas fa-folder-open"></i>
            <p>No grammar topic found</p>
            <button className="ManageGrammarTopic-add-btn" onClick={() => setIsAddModalOpen(true)}>
              <i className="fas fa-plus"></i>
              Add New
            </button>
          </div>
        </div>
      ) : (
        <table className="ManageGrammarTopic-table">
          <thead>
            <tr>
              <th className="ManageGrammarTopic-id-column">
                <div className="ManageGrammarTopic-id-header">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedItems.length === sortedData.length && sortedData.length > 0}
                    onClick={handleCheckboxClick}
                  />
                  <span onClick={() => handleSort('grammarTopic.id')} className="sortable">
                    ID
                    <i className={`fas ${sortField === 'grammarTopic.id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                  </span>
                </div>
              </th>
              <th 
                onClick={() => handleSort('grammarTopic.title')} 
                className="ManageGrammarTopic-title-column sortable"
              >
                Title
                <i className={`fas ${sortField === 'grammarTopic.title' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </th>
              <th 
                onClick={() => handleSort('grammarTopic.content')} 
                className="ManageGrammarTopic-content-column sortable"
              >
                Content
                <i className={`fas ${sortField === 'grammarTopic.content' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </th>
              <th className="ManageGrammarTopic-image-column">
                Image
              </th>
              <th 
                onClick={() => handleSort('exerciseCount')} 
                className="ManageGrammarTopic-exercise-count-column sortable"
              >
                Number of exercises
                <i className={`fas ${sortField === 'exerciseCount' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </th>
              <th className="ManageGrammarTopic-actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.grammarTopic.id}>
                <td>
                  <div className="ManageGrammarTopic-id-cell">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.grammarTopic.id)}
                      onChange={() => handleSelectItem(item.grammarTopic.id)}
                    />
                    <span>{item.grammarTopic.id}</span>
                  </div>
                </td>
                <td className="ManageGrammarTopic-title">{item.grammarTopic.title}</td>
                <td className="ManageGrammarTopic-content">
                  {item.grammarTopic.content ? 
                    item.grammarTopic.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : 
                    'No content'}
                </td>
                <td className="ManageGrammarTopic-image-column">
                  {item.grammarTopic.imageUrl ? (
                    <img 
                      src={item.grammarTopic.imageUrl} 
                      alt={item.grammarTopic.title} 
                      className="ManageGrammarTopic-image" 
                      onLoad={() => console.log('Image loaded successfully:', item.grammarTopic.imageUrl)}
                      onError={(e) => {
                        console.error('Failed to load image:', item.grammarTopic.imageUrl);
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/50?text=No+Image";
                      }} 
                    />
                  ) : (
                    <span>No image</span>
                  )}
                </td>
                <td>
                  <span className="ManageGrammarTopic-exercise-count-badge">
                    {item.exerciseCount}
                  </span>
                </td>
                <td>
                  <button 
                    className="ManageGrammarTopic-edit-btn"
                    onClick={() => handleEditClick(item)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button 
                    className="ManageGrammarTopic-delete-btn"
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
      )}

      <div className="ManageGrammarTopic-pagination">
        <span>
          Display {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} items
        </span>
        <div className="ManageGrammarTopic-pagination-buttons">
          <button 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="ManageGrammarTopic-page-btn"
          >
            Previous
          </button>
          
          {getPageNumbers(currentPage, totalPages).map((item, index) => (
            item === '...' ? (
              <span key={`dots-${index}`} className="ManageGrammarTopic-page-dots">...</span>
            ) : (
              <button
                key={item}
                onClick={() => setCurrentPage(item)}
                className={`ManageGrammarTopic-page-btn ${currentPage === item ? 'active' : ''}`}
              >
                {item}
              </button>
            )
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ManageGrammarTopic-page-btn"
          >
            Next
          </button>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="ManageGrammarTopic-table-action-bar">
          <div className="ManageGrammarTopic-action-bar-content">
            <span>Selected {selectedItems.length} items</span>
            <button 
              className="ManageGrammarTopic-delete-selected-btn"
              onClick={() => {
                setItemToDelete(null); // null indicates multi-delete
                setIsDeleteModalOpen(true);
              }}
            >
              <i className="fas fa-trash"></i>
              Delete selected items
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={async () => {
          try {
            if (itemToDelete) {
              // Delete a single item
              await grammarTopicService.deleteGrammarTopic(itemToDelete.grammarTopic.id);
            } else {
              // Delete multiple items
              for (const id of selectedItems) {
                await grammarTopicService.deleteGrammarTopic(id);
              }
            }
            
            // Refresh the list
            await fetchGrammarTopics();
            // Reset selected items
            setSelectedItems([]);
            
          } catch (error) {
            console.error("Error deleting items:", error);
            alert("Error deleting. Please try again.");
          }
          
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        itemToDelete={itemToDelete}
        selectedItems={selectedItems}
      />

      {/* Add/Edit modal */}
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
        isSubmitting={isSubmitting}
      />
    </div>
  );  
};   

export default ManageGrammarTopic;