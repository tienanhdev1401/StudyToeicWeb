import React, { useState, useEffect } from 'react';
import  '../../styles/ManageExerciseGrammar.css';
import ExercisegrammarService from '../../services/admin/admin.ExercisegrammarService';
import userService from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { parseDocxToHtml, isValidDocxFile } from '../../utils/wordUtils';

const EditExercisesModal = ({ isOpen, onClose, grammarTopicId, grammarTopicTitle, onUpdateSuccess }) => {
  const [availableExercises, setAvailableExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && grammarTopicId) {
      fetchExercises();
    } else {
      // Reset state when closing
      setAvailableExercises([]);
      setSelectedExercises([]);
      setError('');
      setSearchTerm('');
    }
  }, [isOpen, grammarTopicId]);

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Validate grammar topic ID
      const id = parseInt(grammarTopicId);
      if (isNaN(id) || id <= 0) {
        throw new Error('ID chủ đề không hợp lệ');
      }
      
      console.log('Fetching exercises for grammar topic ID:', id);
      
      try {
        // Try to get exercises not in this grammar topic
        const exercises = await ExercisegrammarService.getExercisesNotInGrammarTopicExercise(id);
        console.log('Available exercises:', exercises);
        setAvailableExercises(exercises || []);
      } catch (err) {
        console.error('Error fetching exercises not in grammar topic:', err);
        
        // Fallback: Fetch all exercises
        console.log('Falling back to fetch all exercises');
        setError('Không thể tải danh sách bài tập chuyên biệt. Đang tải tất cả bài tập...');
        
        const allExercises = await ExercisegrammarService.getAllExercisesExercise();
        
        // Get exercises already in this topic to filter them out
        const topicExercises = await ExercisegrammarService.getExercisesByGrammarTopicIdExercise(id);
        const topicExerciseIds = topicExercises.map(ex => ex.id);
        
        // Filter out exercises that are already in the topic
        const availableExercises = allExercises.filter(ex => !topicExerciseIds.includes(ex.id));
        
        setAvailableExercises(availableExercises || []);
        setError(''); // Clear error if we successfully got exercises
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError('Không thể tải danh sách bài tập. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter exercises based on search term
  const filteredExercises = availableExercises
    .filter(exercise => exercise && (
      (exercise.title && exercise.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (exercise.exerciseName && exercise.exerciseName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (exercise.exercise && exercise.exercise.exerciseName && 
       exercise.exercise.exerciseName.toLowerCase().includes(searchTerm.toLowerCase()))
    ))
    .map(exercise => ({
      id: exercise.id || (exercise.exercise && exercise.exercise.id),
      title: exercise.title || exercise.exerciseName || (exercise.exercise && exercise.exercise.exerciseName) || "Không có tiêu đề"
    }));

  console.log('Filtered exercises for adding:', filteredExercises);
  console.log('Available exercises structure:', availableExercises);

  // Check if we have any valid exercises with titles
  const hasValidExercises = availableExercises && availableExercises.length > 0 && 
    availableExercises.some(ex => ex && (ex.title || ex.exerciseName));

  const handleSelectExercise = (exerciseId) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all visible exercises
      setSelectedExercises(filteredExercises.map(exercise => exercise.id));
      console.log('Selected all:', filteredExercises.map(exercise => exercise.id));
    } else {
      // Deselect all
      setSelectedExercises([]);
      console.log('Deselected all');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedExercises.length === 0) {
      setError('Vui lòng chọn ít nhất một bài tập để thêm.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Add new exercises
      let successCount = 0;
      let errorCount = 0;
      
      console.log('Submitting selected exercises:', selectedExercises);
      
      for (const exerciseId of selectedExercises) {
        try {
          await ExercisegrammarService.addExerciseToGrammarTopicExercise(grammarTopicId, exerciseId);
          successCount++;
        } catch (err) {
          console.error(`Failed to add exercise ${exerciseId}:`, err);
          errorCount++;
        }
      }
      
      if (errorCount > 0) {
        setError(`Đã thêm ${successCount} bài tập, nhưng có ${errorCount} bài tập thất bại.`);
      }
      
      if (successCount > 0) {
        // Notify parent component
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
        
        if (errorCount === 0) {
          alert('Thêm bài tập thành công!');
          onClose();
        }
      }
    } catch (error) {
      console.error('Error adding exercises:', error);
      setError('Không thể thêm bài tập. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-modal-overlay">
      <div className="add-modal-content">
        <div className="add-modal-header">
          <h2>Add Exercises to Topic: {grammarTopicTitle}</h2>
          <button type="button" className="close-btn" onClick={onClose} disabled={isLoading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="add-modal-body">
          {isLoading && !availableExercises.length ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i> Loading exercises...
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={fetchExercises} 
                disabled={isLoading}
              >
                <i className="fas fa-sync"></i> Retry
              </button>
            </div>
          ) : !hasValidExercises ? (
            <div className="empty-message">
              <p>No exercises available to add to this topic.</p>
              <button className="close-btn" onClick={onClose}>Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="add-modal-top-actions">
                <div className="search-question-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search exercises by title..."
                    className="search-question-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="add-modal-top-buttons">
                  <button type="button" className="cancel-btn" onClick={onClose} disabled={isLoading}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn" 
                    disabled={isLoading || selectedExercises.length === 0}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Adding...
                      </>
                    ) : (
                      `Add ${selectedExercises.length} Exercise(s)`
                    )}
                  </button>
                </div>
              </div>
              
              <div className="table-container">
                <table className="question-table">
                  <thead>
                    <tr>
                      <th>
                        <input 
                          type="checkbox" 
                          onChange={handleSelectAll}
                          checked={selectedExercises.length === filteredExercises.length && filteredExercises.length > 0}
                        />
                      </th>
                      <th>ID</th>
                      <th className="text-left">Exercise Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExercises.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="no-exercises">
                          {availableExercises.length === 0 ? 
                            "No exercises found" : 
                            "No matching exercises found"}
                        </td>
                      </tr>
                    ) : (
                      filteredExercises.map(exercise => (
                        <tr key={exercise.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedExercises.includes(exercise.id)}
                              onChange={() => handleSelectExercise(exercise.id)}
                            />
                          </td>
                          <td>
                            <div className="id-cell">
                              <span>{exercise.id}</span>
                            </div>
                          </td>
                          <td className="text-left">{exercise.title}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

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
        const data = await ExercisegrammarService.getAllGrammarTopicsExercise();
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
    <div className="ManageExerciseGrammar-modal-overlay">
      <div className="ManageExerciseGrammar-modal-content">
        <div className="ManageExerciseGrammar-modal-header">
          <h2>{editMode ? 'Chỉnh sửa chủ đề' : 'Thêm chủ đề mới'}</h2>
          <button type="button" className="ManageExerciseGrammar-close-btn" onClick={onClose} disabled={isLoading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="ManageExerciseGrammar-modal-body">
          {serverError && (
            <div className="ManageExerciseGrammar-error-message">{serverError}</div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className={`ManageExerciseGrammar-form-group ${errors.title && touched.title ? 'has-error' : ''}`}>
              <label htmlFor="title">Tiêu đề <span className="ManageExerciseGrammar-required">*</span></label>
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
                <div className="ManageExerciseGrammar-error-message">{errors.title}</div>
              )}
            </div>
            
            <div className="ManageExerciseGrammar-form-group">
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
            
            <div className="ManageExerciseGrammar-doc-file-upload">
              <label htmlFor="wordFile" className="ManageExerciseGrammar-doc-file-label">
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
              <span className="ManageExerciseGrammar-doc-file-name">
                {wordFile ? wordFile.name : "Chưa chọn file nào"}
              </span>
            </div>
            
            <div className={`ManageExerciseGrammar-form-group ${errors.topicImage && touched.topicImage ? 'has-error' : ''}`}>
              <label htmlFor="topicImage">Hình ảnh <span className="ManageExerciseGrammar-required">*</span></label>
              <div className="ManageExerciseGrammar-image-upload-container">
                <label htmlFor="topicImage" className="ManageExerciseGrammar-image-file-label">
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
                <span className="ManageExerciseGrammar-image-file-name">
                  {topicImage ? topicImage.name : (imagePreview && editMode ? "Hình ảnh hiện tại" : "Chưa chọn hình ảnh")}
                </span>
              </div>
              {errors.topicImage && touched.topicImage && (
                <div className="ManageExerciseGrammar-error-message">{errors.topicImage}</div>
              )}
              <div className="ManageExerciseGrammar-image-preview">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" />
                )}
              </div>
            </div>
            
            <div className="ManageExerciseGrammar-modal-footer">
              <button type="button" className="ManageExerciseGrammar-cancel-btn" onClick={onClose} disabled={isLoading}>
                Hủy bỏ
              </button>
              <button type="submit" className="ManageExerciseGrammar-save-btn" disabled={isLoading}>
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

const DeleteExercisesModal = ({ isOpen, onClose, grammarTopicId, grammarTopicTitle, onUpdateSuccess }) => {
  const [topicExercises, setTopicExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && grammarTopicId) {
      fetchExercises();
    } else {
      // Reset state when closing
      setTopicExercises([]);
      setSelectedExercises([]);
      setError('');
      setSearchTerm('');
    }
  }, [isOpen, grammarTopicId]);

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Validate grammar topic ID
      const id = parseInt(grammarTopicId);
      if (isNaN(id) || id <= 0) {
        throw new Error('ID chủ đề không hợp lệ');
      }
      
      console.log('Fetching exercises for grammar topic ID:', id);
      
      try {
        // Get exercises already associated with this grammar topic
        const exercises = await ExercisegrammarService.getExercisesByGrammarTopicIdExercise(id);
        console.log('Topic exercises:', exercises);
        setTopicExercises(exercises || []);
      } catch (err) {
        console.error('Error fetching exercises in grammar topic:', err);
        
        // Fallback: Fetch all exercises and filter
        console.log('Falling back to fetch all exercises');
        setError('Không thể tải danh sách bài tập chuyên biệt. Đang tải tất cả bài tập...');
        
        const allExercises = await ExercisegrammarService.getAllExercisesExercise();
        // This is where we'd need additional information to know which exercises 
        // are connected to this topic. For now, we'll use an empty array.
        setTopicExercises([]);
        setError('Không thể xác định bài tập trong chủ đề này. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError('Không thể tải danh sách bài tập. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter exercises based on search term
  const filteredExercises = topicExercises
    .filter(exercise => exercise && (
      (exercise.title && exercise.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (exercise.exerciseName && exercise.exerciseName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (exercise.exercise && exercise.exercise.exerciseName && 
       exercise.exercise.exerciseName.toLowerCase().includes(searchTerm.toLowerCase()))
    ))
    .map(exercise => ({
      id: exercise.id || (exercise.exercise && exercise.exercise.id),
      title: exercise.title || exercise.exerciseName || (exercise.exercise && exercise.exercise.exerciseName) || "Không có tiêu đề"
    }));

  console.log('Filtered exercises for deletion:', filteredExercises);
  console.log('Topic exercises structure:', topicExercises);

  // Check if we have any valid exercises with titles
  const hasValidExercises = topicExercises && topicExercises.length > 0 && 
    topicExercises.some(ex => ex && (ex.title || ex.exerciseName || (ex.exercise && ex.exercise.exerciseName)));

  const handleSelectExercise = (exerciseId) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all visible exercises
      setSelectedExercises(filteredExercises.map(exercise => exercise.id));
      console.log('Selected all:', filteredExercises.map(exercise => exercise.id));
    } else {
      // Deselect all
      setSelectedExercises([]);
      console.log('Deselected all');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedExercises.length === 0) {
      setError('Vui lòng chọn ít nhất một bài tập để xóa.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Remove selected exercises
      let successCount = 0;
      let errorCount = 0;
      
      console.log('Submitting exercises for deletion:', selectedExercises);
      
      for (const exerciseId of selectedExercises) {
        try {
          await ExercisegrammarService.removeExerciseFromGrammarTopicExercise(grammarTopicId, exerciseId);
          successCount++;
        } catch (err) {
          console.error(`Failed to remove exercise ${exerciseId}:`, err);
          errorCount++;
        }
      }
      
      if (errorCount > 0) {
        setError(`Đã xóa ${successCount} bài tập, nhưng có ${errorCount} bài tập thất bại.`);
      }
      
      if (successCount > 0) {
        // Notify parent component
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
        
        if (errorCount === 0) {
          alert('Xóa bài tập thành công!');
          onClose();
        } else {
          // Refresh the exercise list to show updated state
          fetchExercises();
        }
      }
    } catch (error) {
      console.error('Error removing exercises:', error);
      setError('Không thể xóa bài tập. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-modal-overlay">
      <div className="add-modal-content">
        <div className="add-modal-header">
          <h2>Delete Exercises From Topic: {grammarTopicTitle}</h2>
          <button type="button" className="close-btn" onClick={onClose} disabled={isLoading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="add-modal-body">
          {isLoading && !topicExercises.length ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i> Loading exercises...
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={fetchExercises} 
                disabled={isLoading}
              >
                <i className="fas fa-sync"></i> Retry
              </button>
            </div>
          ) : !hasValidExercises ? (
            <div className="empty-message">
              <p>No exercises found in this topic.</p>
              <button className="close-btn" onClick={onClose}>Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="add-modal-top-actions">
                <div className="search-question-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search exercises by title..."
                    className="search-question-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="add-modal-top-buttons">
                  <button type="button" className="cancel-btn" onClick={onClose} disabled={isLoading}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn" 
                    disabled={isLoading || selectedExercises.length === 0}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Removing...
                      </>
                    ) : (
                      `Remove ${selectedExercises.length} Exercise(s)`
                    )}
                  </button>
                </div>
              </div>
              
              <div className="table-container">
                <table className="question-table">
                  <thead>
                    <tr>
                      <th>
                        <input 
                          type="checkbox" 
                          onChange={handleSelectAll}
                          checked={selectedExercises.length === filteredExercises.length && filteredExercises.length > 0}
                        />
                      </th>
                      <th>ID</th>
                      <th className="text-left">Exercise Title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExercises.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="no-exercises">
                          {topicExercises.length === 0 ? 
                            "No exercises found" : 
                            "No matching exercises found"}
                        </td>
                      </tr>
                    ) : (
                      filteredExercises.map(exercise => (
                        <tr key={exercise.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedExercises.includes(exercise.id)}
                              onChange={() => handleSelectExercise(exercise.id)}
                            />
                          </td>
                          <td>{exercise.id}</td>
                          <td className="text-left">{exercise.title}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const ManageExerciseGrammar = () => {
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
  
  // Add state for exercises modal
  const [isExercisesModalOpen, setIsExercisesModalOpen] = useState(false);
  const [currentGrammarTopic, setCurrentGrammarTopic] = useState(null);

  // Add state for delete exercises modal
  const [isDeleteExercisesModalOpen, setIsDeleteExercisesModalOpen] = useState(false);

  useEffect(() => {
    fetchGrammarTopics();
  }, []);

  const fetchGrammarTopics = async () => {
    try {
      setIsLoading(true);
      const data = await ExercisegrammarService.getAllGrammarTopicsExercise();
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
        await ExercisegrammarService.updateGrammarTopicExercise(topicToEdit.id, topic);
        alert('Cập nhật chủ đề thành công!');
      } else {
        // Add new topic
        await ExercisegrammarService.addGrammarTopicExercise(topic);
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

  // Handle opening the exercises modal
  const handleEditExercises = (topic) => {
    setCurrentGrammarTopic(topic);
    setIsExercisesModalOpen(true);
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
      <div className="ManageExerciseGrammar-modal-overlay">
        <div className="ManageExerciseGrammar-modal-content">
          <div className="ManageExerciseGrammar-modal-header">
            <h2>Xác nhận xóa</h2>
            <button className="ManageExerciseGrammar-close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="ManageExerciseGrammar-modal-body">
            <p>{message}</p>
          </div>
          <div className="ManageExerciseGrammar-modal-footer">
            <button className="ManageExerciseGrammar-cancel-btn" onClick={onClose}>Hủy bỏ</button>
            <button className="ManageExerciseGrammar-confirm-delete-btn" onClick={onConfirm}>
              <i className="fas fa-trash"></i>
              Xóa
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
    return <div className="ManageExerciseGrammar-loading">Loading...</div>;
  }

  if (error) {
    return <div className="ManageExerciseGrammar-error">Error: {error}</div>;
  }

  return (
    <div className="ManageExerciseGrammar-container">
      <h1 className="ManageExerciseGrammar-header-title">Quản lý chủ đề ngữ pháp</h1>
      
      <div className="ManageExerciseGrammar-pagination">
        <div className="ManageExerciseGrammar-entries-select">
          <p>Hiển thị </p>
          <select 
            value={itemsPerPage} 
            onChange={handleEntriesChange}
            className="ManageExerciseGrammar-entries-dropdown"
          >
            {entriesOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p>mục </p>
        </div>

        <div className="ManageExerciseGrammar-action-section">
          <div className="ManageExerciseGrammar-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="ManageExerciseGrammar-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
        
      {filteredData.length === 0 ? (
        <div className="ManageExerciseGrammar-empty-table">
          <div className="ManageExerciseGrammar-empty-message">
            <i className="fas fa-folder-open"></i>
            <p>Không có chủ đề ngữ pháp nào được tìm thấy</p>
          </div>
        </div>
      ) : (
        <table className="ManageExerciseGrammar-table">
          <thead>
            <tr>
              <th className="ManageExerciseGrammar-id-column">
                <div className="ManageExerciseGrammar-id-header">
                  <span onClick={() => handleSort('grammarTopic.id')} className="sortable">
                    ID
                    <i className={`fas ${sortField === 'grammarTopic.id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                  </span>
                </div>
              </th>
              <th 
                onClick={() => handleSort('grammarTopic.title')} 
                className="ManageExerciseGrammar-title-column sortable"
              >
                Tiêu đề
                <i className={`fas ${sortField === 'grammarTopic.title' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </th>
              <th 
                onClick={() => handleSort('exerciseCount')} 
                className="ManageExerciseGrammar-exercise-count-column sortable"
              >
                Số bài tập
                <i className={`fas ${sortField === 'exerciseCount' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </th>
              <th className="ManageExerciseGrammar-actions-column">Quản lý bài tập</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.grammarTopic.id}>
                <td>
                  <div className="ManageExerciseGrammar-id-cell">
                    <span>{item.grammarTopic.id}</span>
                  </div>
                </td>
                <td className="ManageExerciseGrammar-title">{item.grammarTopic.title}</td>
                <td>
                  <span className="ManageExerciseGrammar-exercise-count-badge">
                    {item.exerciseCount}
                  </span>
                </td>
                <td>
                  <div className="ManageExerciseGrammar-action-buttons">
                    <button 
                      className="ManageExerciseGrammar-add-exercises-btn"
                      onClick={() => handleEditExercises(item.grammarTopic)}
                      title="Thêm bài tập vào chủ đề"
                    >
                      <i className="fas fa-plus-circle"></i>
                    </button>
                    <button 
                      className="ManageExerciseGrammar-remove-exercises-btn"
                      onClick={() => {
                        setCurrentGrammarTopic(item.grammarTopic);
                        setIsDeleteExercisesModalOpen(true);
                      }}
                      disabled={item.exerciseCount === 0}
                      title="Xóa bài tập khỏi chủ đề"
                    >
                      <i className="fas fa-minus-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="ManageExerciseGrammar-pagination">
        <span>
          Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredData.length)} của {filteredData.length} mục
        </span>
        <div className="ManageExerciseGrammar-pagination-buttons">
          <button 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="ManageExerciseGrammar-page-btn"
          >
            Trước
          </button>
          
          {getPageNumbers(currentPage, totalPages).map((item, index) => (
            item === '...' ? (
              <span key={`dots-${index}`} className="ManageExerciseGrammar-page-dots">...</span>
            ) : (
              <button
                key={item}
                onClick={() => setCurrentPage(item)}
                className={`ManageExerciseGrammar-page-btn ${currentPage === item ? 'active' : ''}`}
              >
                {item}
              </button>
            )
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ManageExerciseGrammar-page-btn"
          >
            Tiếp
          </button>
        </div>
      </div>

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
              await ExercisegrammarService.deleteGrammarTopicExercise(itemToDelete.grammarTopic.id);
            } else {
              // Delete multiple items
              for (const id of selectedItems) {
                await ExercisegrammarService.deleteGrammarTopicExercise(id);
              }
            }
            
            // Refresh the list
            await fetchGrammarTopics();
            // Reset selected items
            setSelectedItems([]);
            
          } catch (error) {
            console.error("Error deleting items:", error);
            alert("Lỗi khi xóa. Vui lòng thử lại.");
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
      
      {/* Add the EditExercisesModal */}
      <EditExercisesModal
        isOpen={isExercisesModalOpen}
        onClose={() => setIsExercisesModalOpen(false)}
        grammarTopicId={currentGrammarTopic?.id}
        grammarTopicTitle={currentGrammarTopic?.title}
        onUpdateSuccess={fetchGrammarTopics}
      />

      {/* Add the DeleteExercisesModal */}
      <DeleteExercisesModal
        isOpen={isDeleteExercisesModalOpen}
        onClose={() => setIsDeleteExercisesModalOpen(false)}
        grammarTopicId={currentGrammarTopic?.id}
        grammarTopicTitle={currentGrammarTopic?.title}
        onUpdateSuccess={fetchGrammarTopics}
      />
    </div>
  );  
};   

export default ManageExerciseGrammar;