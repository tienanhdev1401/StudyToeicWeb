import React, { useState, useEffect } from 'react';
import  '../../styles/ManageExerciseVocabulary.css';
import ExercisevocabularyService from '../../services/admin/admin.ExercisevocabularyService';
import userService from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { parseDocxToHtml, isValidDocxFile } from '../../utils/wordUtils';

const EditExercisesModal = ({ isOpen, onClose, vocabularyTopicId, vocabularyTopicTitle, onUpdateSuccess }) => {
  const [availableExercises, setAvailableExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && vocabularyTopicId) {
      fetchExercises();
    } else {
      // Reset state when closing
      setAvailableExercises([]);
      setSelectedExercises([]);
      setError('');
      setSearchTerm('');
    }
  }, [isOpen, vocabularyTopicId]);

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Validate vocabulary topic ID
      const id = parseInt(vocabularyTopicId);
      if (isNaN(id) || id <= 0) {
        throw new Error('ID chủ đề không hợp lệ');
      }
      
      console.log('Fetching exercises for vocabulary topic ID:', id);
      
      try {
        // Try to get exercises not in this vocabulary topic
        const exercises = await ExercisevocabularyService.getExercisesNotInVocabularyTopicExerciseVocabulary(id);
        console.log('Available exercises:', exercises);
        setAvailableExercises(exercises || []);
      } catch (err) {
        console.error('Error fetching exercises not in vocabulary topic:', err);
        
        // Fallback: Fetch all exercises
        console.log('Falling back to fetch all exercises');
        setError('Không thể tải danh sách bài tập chuyên biệt. Đang tải tất cả bài tập...');
        
        const allExercises = await ExercisevocabularyService.getAllExercisesExerciseVocabulary();
        
        // Get exercises already in this topic to filter them out
        const topicExercises = await ExercisevocabularyService.getExercisesByVocabularyTopicIdExerciseVocabulary(id);
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
      setError('Please select at least one exercise to add.');
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
          await ExercisevocabularyService.addExerciseToVocabularyTopicExerciseVocabulary(vocabularyTopicId, exerciseId);
          successCount++;
        } catch (err) {
          console.error(`Failed to add exercise ${exerciseId}:`, err);
          errorCount++;
        }
      }
      
      if (errorCount > 0) {
        setError(`Added ${successCount} exercises, but ${errorCount} failed.`);
      }
      
      if (successCount > 0) {
        // Notify parent component
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
        
        if (errorCount === 0) {
          alert('Added exercises successfully!');
          onClose();
        }
      }
    } catch (error) {
      console.error('Error adding exercises:', error);
      setError('Cannot add exercises. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-modal-overlay">
      <div className="add-modal-content">
        <div className="add-modal-header">
          <h2>Add Exercises to Topic: {vocabularyTopicTitle}</h2>
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

const AddTopicModal = ({isOpen, onClose, onAdd, isSubmitting = false}) => {
  const [formData, setFormData] = useState({
    topicName: '',
    vocabularies: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [topicImage, setTopicImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [wordFile, setWordFile] = useState(null);
  const [errors, setErrors] = useState({
    topicName: '',
    vocabularies: '',
    topicImage: ''
  });
  const [touched, setTouched] = useState({
    topicName: false,
    vocabularies: false,
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
        const data = await ExercisevocabularyService.getAllVocabularyTopicsExerciseVocabulary();
        // Lọc danh sách các tiêu đề topic
        const topicTitles = data
          .map(item => item.vocabularyTopic.topicName.toLowerCase());
        setExistingTopicTitles(topicTitles);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };
    
    if (isOpen) {
      fetchExistingTopics();
      setServerError(''); // Clear server error when modal opens
    }
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form khi mở modal ở chế độ thêm mới
      setFormData({ 
        topicName: '', 
        vocabularies: '' 
      });
      setTopicImage(null);
      setImagePreview('');
      setWordFile(null);
      setErrors({
        topicName: '',
        vocabularies: '',
        topicImage: ''
      });
      setTouched({
        topicName: false,
        vocabularies: false,
        topicImage: false
      });
      setServerError('');
    }
  }, [isOpen]);

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
    
    if (fieldName === 'topicName') {
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
    const topicNameValue = formData.topicName.trim();
    
    const newErrors = {
      topicName: !topicNameValue ? 'Tiêu đề không được để trống' : 
            (existingTopicTitles.includes(topicNameValue.toLowerCase()) ? 'Tiêu đề này đã tồn tại' : ''),
      topicImage: !topicImage && !imagePreview ? 'Hình ảnh không được để trống' : ''
    };
    
    setErrors(newErrors);
    setTouched({
      topicName: true,
      vocabularies: true,
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
        setFormData(prev => ({ ...prev, vocabularies: result.html }));
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
          imageUrl = await userService.uploadImage(topicImage, 'vocabularyTopic');
          console.log('Image uploaded successfully, URL:', imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          setServerError('Lỗi khi tải lên hình ảnh. Vui lòng thử lại.');
          setIsUploading(false);
          return;
        }
      } else if (imagePreview) {
        // Use the existing preview URL if no new image was selected
        imageUrl = imagePreview;
        console.log('Using existing image URL:', imageUrl);
      }
      
      const updatedTopic = {
        topicName: formData.topicName,
        vocabularies: formData.vocabularies,
        imageUrl: imageUrl
      };
      
      console.log('Saving topic with data:', updatedTopic);

      try {
        await onAdd(updatedTopic);
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
    <div className="ManageExerciseVocabulary-modal-overlay">
      <div className="ManageExerciseVocabulary-modal-content">
        <div className="ManageExerciseVocabulary-modal-header">
          <h2>Thêm chủ đề mới</h2>
          <button type="button" className="ManageExerciseVocabulary-close-btn" onClick={onClose} disabled={isLoading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="ManageExerciseVocabulary-modal-body">
          {serverError && (
            <div className="ManageExerciseVocabulary-error-message">{serverError}</div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className={`ManageExerciseVocabulary-form-group ${errors.topicName && touched.topicName ? 'has-error' : ''}`}>
              <label htmlFor="topicName">Tiêu đề <span className="ManageExerciseVocabulary-required">*</span></label>
              <input
                type="text"
                id="topicName"
                name="topicName"
                value={formData.topicName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Nhập tiêu đề chủ đề"
                disabled={isLoading}
              />
              {errors.topicName && touched.topicName && (
                <div className="ManageExerciseVocabulary-error-message">{errors.topicName}</div>
              )}
            </div>
            
            <div className="ManageExerciseVocabulary-form-group">
              <label htmlFor="vocabularies">Nội dung từ vựng</label>
              <textarea
                id="vocabularies"
                name="vocabularies"
                value={formData.vocabularies}
                onChange={handleChange}
                rows={5}
                placeholder="Nhập danh sách từ vựng hoặc tải lên file Word"
                disabled={isLoading}
              ></textarea>
            </div>
            
            <div className="ManageExerciseVocabulary-doc-file-upload">
              <label htmlFor="wordFile" className="ManageExerciseVocabulary-doc-file-label">
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
              <span className="ManageExerciseVocabulary-doc-file-name">
                {wordFile ? wordFile.name : "Chưa chọn file nào"}
              </span>
            </div>
            
            <div className={`ManageExerciseVocabulary-form-group ${errors.topicImage && touched.topicImage ? 'has-error' : ''}`}>
              <label htmlFor="topicImage">Hình ảnh <span className="ManageExerciseVocabulary-required">*</span></label>
              <div className="ManageExerciseVocabulary-image-upload-container">
                <label htmlFor="topicImage" className="ManageExerciseVocabulary-image-file-label">
                  <i className="fas fa-upload"></i> Chọn hình ảnh
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
                <span className="ManageExerciseVocabulary-image-file-name">
                  {topicImage ? topicImage.name : (imagePreview ? "Hình ảnh hiện tại" : "Chưa chọn hình ảnh")}
                </span>
              </div>
              {errors.topicImage && touched.topicImage && (
                <div className="ManageExerciseVocabulary-error-message">{errors.topicImage}</div>
              )}
              <div className="ManageExerciseVocabulary-image-preview">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" />
                )}
              </div>
            </div>
            
            <div className="ManageExerciseVocabulary-modal-footer">
              <button type="button" className="ManageExerciseVocabulary-cancel-btn" onClick={onClose} disabled={isLoading}>
                Hủy bỏ
              </button>
              <button type="submit" className="ManageExerciseVocabulary-save-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> 
                    Đang xử lý...
                  </>
                ) : (
                  'Thêm chủ đề'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const DeleteExercisesModal = ({ isOpen, onClose, vocabularyTopicId, vocabularyTopicTitle, onUpdateSuccess }) => {
  const [topicExercises, setTopicExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && vocabularyTopicId) {
      fetchExercises();
    } else {
      // Reset state when closing
      setTopicExercises([]);
      setSelectedExercises([]);
      setError('');
      setSearchTerm('');
    }
  }, [isOpen, vocabularyTopicId]);

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Validate vocabulary topic ID
      const id = parseInt(vocabularyTopicId);
      if (isNaN(id) || id <= 0) {
        throw new Error('ID chủ đề không hợp lệ');
      }
      
      console.log('Fetching exercises for vocabulary topic ID:', id);
      
      try {
        // Get exercises already associated with this vocabulary topic
        const exercises = await ExercisevocabularyService.getExercisesByVocabularyTopicIdExerciseVocabulary(id);
        console.log('Topic exercises:', exercises);
        setTopicExercises(exercises || []);
      } catch (err) {
        console.error('Error fetching exercises in vocabulary topic:', err);
        
        // Fallback: Fetch all exercises and filter
        console.log('Falling back to fetch all exercises');
        setError('Không thể tải danh sách bài tập chuyên biệt. Đang tải tất cả bài tập...');
        
        const allExercises = await ExercisevocabularyService.getAllExercisesExerciseVocabulary();
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
          await ExercisevocabularyService.removeExerciseFromVocabularyTopicExerciseVocabulary(vocabularyTopicId, exerciseId);
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
          <h2>Delete Exercises From Topic: {vocabularyTopicTitle}</h2>
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

const ManageExerciseVocabulary = () => {
  const navigate = useNavigate();
  const [vocabularyTopicList, setVocabularyTopicList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortField, setSortField] = useState('vocabularyTopic.id');
  const [sortDirection, setSortDirection] = useState('asc');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add state for exercises modal
  const [isExercisesModalOpen, setIsExercisesModalOpen] = useState(false);
  const [currentVocabularyTopic, setCurrentVocabularyTopic] = useState(null);

  // Add state for delete exercises modal
  const [isDeleteExercisesModalOpen, setIsDeleteExercisesModalOpen] = useState(false);

  useEffect(() => {
    fetchVocabularyTopics();
  }, []);

  const fetchVocabularyTopics = async () => {
    try {
      setIsLoading(true);
      const data = await ExercisevocabularyService.getAllVocabularyTopicsExerciseVocabulary();
      console.log('Vocabulary topics data:', data); // Debug data structure
      
      // Chuẩn hóa dữ liệu trả về, đảm bảo tất cả đều sử dụng trường imageUrl
      const normalizedData = data.map(item => {
        if (item.vocabularyTopic) {
          // Đảm bảo trường imageUrl tồn tại và được sử dụng
          if (item.vocabularyTopic.imgUrl && !item.vocabularyTopic.imageUrl) {
            item.vocabularyTopic.imageUrl = item.vocabularyTopic.imgUrl;
          }
        }
        return item;
      });
      
      setVocabularyTopicList(normalizedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding or updating a topic
  const handleAddOrUpdateTopic = async (topic) => {
    try {
      setIsSubmitting(true);
      
      // Create a correctly mapped topic object that matches the API expectations
      const mappedTopic = {
        topicName: topic.topicName,
        vocabularies: topic.vocabularies,
        imageUrl: topic.imageUrl
      };
      
      // Add new topic
      await ExercisevocabularyService.addVocabularyTopicExercise(mappedTopic);
      alert('Thêm chủ đề thành công!');
      
      // Refresh the list
      await fetchVocabularyTopics();

      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening the exercises modal
  const handleEditExercises = (topic) => {
    setCurrentVocabularyTopic(topic);
    setIsExercisesModalOpen(true);
  };

  // Add entries options
  const entriesOptions = [5, 10, 25, 50, 100];

  const handleEntriesChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  // Xử lý tìm kiếm
  const filteredData = vocabularyTopicList.filter(item =>
    item.vocabularyTopic.topicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.exerciseCount.toString().includes(searchTerm) ||
    item.vocabularyTopic.id.toString().includes(searchTerm)
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
    return <div className="ManageExerciseVocabulary-loading">Loading...</div>;
  }

  if (error) {
    return <div className="ManageExerciseVocabulary-error">Error: {error}</div>;
  }

  return (
    <div className="ManageExerciseVocabulary-container">
      <h1 className="ManageExerciseVocabulary-header-title">Manage Vocabulary Exercise</h1>
      
      <div className="ManageExerciseVocabulary-pagination">
        <div className="ManageExerciseVocabulary-entries-select">
          <p> Show </p>
          <select 
            value={itemsPerPage} 
            onChange={handleEntriesChange}
            className="ManageExerciseVocabulary-entries-dropdown"
          >
            {entriesOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p>entries</p>
        </div>

        <div className="ManageExerciseVocabulary-action-section">
          <div className="ManageExerciseVocabulary-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search..."
              className="ManageExerciseVocabulary-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
        
      {filteredData.length === 0 ? (
        <div className="ManageExerciseVocabulary-empty-table">
          <div className="ManageExerciseVocabulary-empty-message">
            <i className="fas fa-folder-open"></i>
            <p>No vocabulary topic found</p>
          </div>
        </div>
      ) : (
        <table className="ManageExerciseVocabulary-table">
          <thead>
            <tr>
              <th className="ManageExerciseVocabulary-id-column">
                <div className="ManageExerciseVocabulary-id-header">
                  <span onClick={() => handleSort('vocabularyTopic.id')} className="sortable">
                    ID
                    <i className={`fas ${sortField === 'vocabularyTopic.id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                  </span>
                </div>
              </th>
              <th 
                onClick={() => handleSort('vocabularyTopic.topicName')} 
                className="ManageExerciseVocabulary-title-column sortable"
              >
                Title
                <i className={`fas ${sortField === 'vocabularyTopic.topicName' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </th>
              <th 
                onClick={() => handleSort('exerciseCount')} 
                className="ManageExerciseVocabulary-exercise-count-column sortable"
              >
                Number of exercises
                <i className={`fas ${sortField === 'exerciseCount' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </th>
              <th className="ManageExerciseVocabulary-actions-column">Manage exercises</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.vocabularyTopic.id}>
                <td>
                  <div className="ManageExerciseVocabulary-id-cell">
                    <span>{item.vocabularyTopic.id}</span>
                  </div>
                </td>
                <td className="ManageExerciseVocabulary-title">{item.vocabularyTopic.topicName}</td>
                <td>
                  <span className="ManageExerciseVocabulary-exercise-count-badge">
                    {item.exerciseCount}
                  </span>
                </td>
                <td>
                  <div className="ManageExerciseVocabulary-action-buttons">
                    <button 
                      className="ManageExerciseVocabulary-add-exercises-btn"
                      onClick={() => handleEditExercises(item.vocabularyTopic)}
                      title="Add exercises to the topic"
                    >
                      <i className="fas fa-plus-circle"></i>
                    </button>
                    <button 
                      className="ManageExerciseVocabulary-remove-exercises-btn"
                      onClick={() => {
                        setCurrentVocabularyTopic(item.vocabularyTopic);
                        setIsDeleteExercisesModalOpen(true);
                      }}
                      disabled={item.exerciseCount === 0}
                      title="Delete exercises from the topic"
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

      <div className="ManageExerciseVocabulary-pagination">
        <span>
          Show {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
        </span>
        <div className="ManageExerciseVocabulary-pagination-buttons">
          <button 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="ManageExerciseVocabulary-page-btn"
          >
            Previous
          </button>
          
          {getPageNumbers(currentPage, totalPages).map((item, index) => (
            item === '...' ? (
              <span key={`dots-${index}`} className="ManageExerciseVocabulary-page-dots">...</span>
            ) : (
              <button
                key={item}
                onClick={() => setCurrentPage(item)}
                className={`ManageExerciseVocabulary-page-btn ${currentPage === item ? 'active' : ''}`}
              >
                {item}
              </button>
            )
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ManageExerciseVocabulary-page-btn"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add/Edit modal */}
      <AddTopicModal
        isOpen={isAddModalOpen}
        onClose={() => {
          if(!isSubmitting) {
            setIsAddModalOpen(false);
          }
        }}
        onAdd={handleAddOrUpdateTopic}
        isSubmitting={isSubmitting}
      />
      
      {/* Add the EditExercisesModal */}
      <EditExercisesModal
        isOpen={isExercisesModalOpen}
        onClose={() => setIsExercisesModalOpen(false)}
        vocabularyTopicId={currentVocabularyTopic?.id}
        vocabularyTopicTitle={currentVocabularyTopic?.topicName}
        onUpdateSuccess={fetchVocabularyTopics}
      />

      {/* Add the DeleteExercisesModal */}
      <DeleteExercisesModal
        isOpen={isDeleteExercisesModalOpen}
        onClose={() => setIsDeleteExercisesModalOpen(false)}
        vocabularyTopicId={currentVocabularyTopic?.id}
        vocabularyTopicTitle={currentVocabularyTopic?.topicName}
        onUpdateSuccess={fetchVocabularyTopics}
      />
    </div>
  );  
};   

export default ManageExerciseVocabulary;