import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExercisesService from '../../services/admin/admin.ExercisesService';
import ExercisesQuestionService from '../../services/admin/admin.ExercisesQuestionService';
import '../../styles/ManageExerciseQuestion.css';

const QuestionFormModal = ({ isOpen, onClose, onSubmit, questionItem, exerciseId, editMode = false }) => {
  const [formData, setFormData] = useState({
    content: '',
    correct_answer: '',
    explain_detail: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    explain_resource: '',
    urlAudio: '',
    urlImage: ''
  });
  
  const [errors, setErrors] = useState({
    content: '',
    correct_answer: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: ''
  });
  
  const [touched, setTouched] = useState({
    content: false,
    correct_answer: false,
    option_a: false,
    option_b: false,
    option_c: false,
    option_d: false
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen && editMode && questionItem) {
      setFormData({
        content: questionItem.content || '',
        correct_answer: questionItem.correct_answer || '',
        explain_detail: questionItem.explain_detail || '',
        option_a: questionItem.option_a || '',
        option_b: questionItem.option_b || '',
        option_c: questionItem.option_c || '',
        option_d: questionItem.option_d || '',
        explain_resource: questionItem.resource?.explain_resource || '',
        urlAudio: questionItem.resource?.urlAudio || '',
        urlImage: questionItem.resource?.urlImage || '',
      });
      
      if (questionItem.resource?.urlImage) {
        setImagePreview(questionItem.resource.urlImage);
      }
    } else if (isOpen && !editMode) {
      setFormData({
        content: '',
        correct_answer: '',
        explain_detail: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        explain_resource: '',
        urlAudio: '',
        urlImage: ''
      });
      setImageFile(null);
      setImagePreview('');
      setErrors({
        content: '',
        correct_answer: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: ''
      });
      setTouched({
        content: false,
        correct_answer: false,
        option_a: false,
        option_b: false,
        option_c: false,
        option_d: false
      });
    }
  }, [isOpen, editMode, questionItem]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (value.trim()) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        alert('Only JPG, PNG or GIF images are allowed');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must not exceed 5MB');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageFile(file);
      setFormData({...formData, urlImage: ''});
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let errorMessage = '';
    
    if (fieldName === 'content' && !value.trim()) {
      errorMessage = 'Question content is required';
    }
    
    if (['correct_answer', 'option_a', 'option_b', 'option_c', 'option_d'].includes(fieldName) && !value.trim()) {
      errorMessage = 'This field is required';
    }
    
    setErrors({ ...errors, [fieldName]: errorMessage });
    return !errorMessage;
  };

  const validateForm = () => {
    const newErrors = {
      content: !formData.content.trim() ? 'Question content is required' : '',
      correct_answer: !formData.correct_answer.trim() ? 'Correct answer is required' : '',
      option_a: !formData.option_a.trim() ? 'Option A is required' : '',
      option_b: !formData.option_b.trim() ? 'Option B is required' : '',
      option_c: !formData.option_c.trim() ? 'Option C is required' : '',
      option_d: !formData.option_d.trim() ? 'Option D is required' : '',
    };
    
    setErrors(newErrors);
    setTouched({
      content: true,
      correct_answer: true,
      option_a: true,
      option_b: true,
      option_c: true,
      option_d: true
    });
    
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      let imageUrl = formData.urlImage;
      
      if (imageFile) {
        setIsUploading(true);
        // You'll need to implement the image upload service
        // imageUrl = await userService.uploadImage(imageFile, 'questions');
        setIsUploading(false);
      }

      const questionData = {
        ...formData,
        urlImage: imageUrl,
        exerciseId: parseInt(exerciseId)
      };

      if (editMode && questionItem) {
        questionData.id = questionItem.id;
        if (questionItem.resource) {
          questionData.resourceId = questionItem.resource.id;
        }
      }

      console.log("Form data prepared:", questionData);
      await onSubmit(questionData);
      
      if (imagePreview && imageFile) {
        URL.revokeObjectURL(imagePreview);
      }
      
      onClose();
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} question:`, error);
      alert(`Failed to ${editMode ? 'update' : 'add'} question. Please try again.`);
      setIsUploading(false);
    }
  };

  return (
    <div className="add-modal-overlay">
      <div className="add-modal-content">
        <div className="add-modal-header">
          <h2>{editMode ? 'Edit Question' : 'Add New Question'}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="add-modal-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className={`form-group ${errors.content && touched.content ? 'has-error' : ''}`}>
              <label htmlFor="content">Question <span className="required">*</span></label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Enter question content"
                className={errors.content && touched.content ? 'input-error' : ''}
                rows="3"
              />
              {errors.content && touched.content && (
                <div className="error-message">{errors.content}</div>
              )}
            </div>
            
            <div className="options-container">
              <div className={`form-group ${errors.option_a && touched.option_a ? 'has-error' : ''}`}>
                <label htmlFor="option_a">Option A <span className="required">*</span></label>
                <input
                  type="text"
                  id="option_a"
                  name="option_a"
                  value={formData.option_a}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Enter option A"
                  className={errors.option_a && touched.option_a ? 'input-error' : ''}
                />
                {errors.option_a && touched.option_a && (
                  <div className="error-message">{errors.option_a}</div>
                )}
              </div>
              
              <div className={`form-group ${errors.option_b && touched.option_b ? 'has-error' : ''}`}>
                <label htmlFor="option_b">Option B <span className="required">*</span></label>
                <input
                  type="text"
                  id="option_b"
                  name="option_b"
                  value={formData.option_b}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Enter option B"
                  className={errors.option_b && touched.option_b ? 'input-error' : ''}
                />
                {errors.option_b && touched.option_b && (
                  <div className="error-message">{errors.option_b}</div>
                )}
              </div>
              
              <div className={`form-group ${errors.option_c && touched.option_c ? 'has-error' : ''}`}>
                <label htmlFor="option_c">Option C <span className="required">*</span></label>
                <input
                  type="text"
                  id="option_c"
                  name="option_c"
                  value={formData.option_c}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Enter option C"
                  className={errors.option_c && touched.option_c ? 'input-error' : ''}
                />
                {errors.option_c && touched.option_c && (
                  <div className="error-message">{errors.option_c}</div>
                )}
              </div>
              
              <div className={`form-group ${errors.option_d && touched.option_d ? 'has-error' : ''}`}>
                <label htmlFor="option_d">Option D <span className="required">*</span></label>
                <input
                  type="text"
                  id="option_d"
                  name="option_d"
                  value={formData.option_d}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Enter option D"
                  className={errors.option_d && touched.option_d ? 'input-error' : ''}
                />
                {errors.option_d && touched.option_d && (
                  <div className="error-message">{errors.option_d}</div>
                )}
              </div>
            </div>
            
            <div className={`form-group ${errors.correct_answer && touched.correct_answer ? 'has-error' : ''}`}>
              <label htmlFor="correct_answer">Correct Answer <span className="required">*</span></label>
              <select
                id="correct_answer"
                name="correct_answer"
                value={formData.correct_answer}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={errors.correct_answer && touched.correct_answer ? 'input-error' : ''}
              >
                <option value="">Select correct answer</option>
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
              {errors.correct_answer && touched.correct_answer && (
                <div className="error-message">{errors.correct_answer}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="explain_detail">Explanation Detail</label>
              <textarea
                id="explain_detail"
                name="explain_detail"
                value={formData.explain_detail}
                onChange={handleChange}
                placeholder="Enter explanation for the correct answer"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="explain_resource">Explanation Resource</label>
              <input
                type="text"
                id="explain_resource"
                name="explain_resource"
                value={formData.explain_resource}
                onChange={handleChange}
                placeholder="Enter explanation resource"
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
                  id="questionImage"
                  name="questionImage"
                  accept="image/jpeg, image/png, image/gif"
                  onChange={handleImageChange}
                  className="file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="questionImage" className="file-input-label">
                  <i className="fas fa-upload"></i> {editMode && formData.urlImage ? 'Change Image' : 'Choose Image'}
                </label>
                <span className="file-name">
                  {imageFile ? imageFile.name : (formData.urlImage && !imageFile ? 'Current image' : "No file chosen")}
                </span>
                
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
                {isUploading ? 'Uploading...' : (editMode ? 'Save Changes' : 'Add Question')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AddExistingQuestionModal = ({ isOpen, onClose, exerciseId, onAddQuestions }) => {
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fallbackMode, setFallbackMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableQuestions();
    } else {
      // Reset state when closing
      setAvailableQuestions([]);
      setSelectedQuestions([]);
      setError('');
      setFallbackMode(false);
      setSearchTerm('');
    }
  }, [isOpen, exerciseId]);

  const fetchAvailableQuestions = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Validate exerciseId is a number
      const id = parseInt(exerciseId);
      if (isNaN(id) || id <= 0) {
        throw new Error('ID bài tập không hợp lệ, phải là một số dương');
      }
      
      console.log('Fetching available questions for exercise ID:', id);
      
      let questionsData;
      try {
        // Try to get questions not in exercise
        questionsData = await ExercisesQuestionService.getQuestionsNotInExercise(id);
        console.log('Available questions:', questionsData);
        setFallbackMode(false);
      } catch (err) {
        console.error('Failed to get questions not in exercise, using fallback:', err);
        // Fallback to get all questions
        setFallbackMode(true);
        questionsData = await ExercisesQuestionService.getAllQuestions();
        console.log('All questions (fallback):', questionsData);
      }
      
      if (!questionsData || questionsData.length === 0) {
        console.log('No questions found');
        setAvailableQuestions([]);
        return;
      }
      
      // Process questions to ensure consistent property naming
      const processedQuestions = questionsData?.map(question => ({
        id: question.id || question.questionId,
        content: question.content || question.question || question.questionContent || '',
        option_a: question.option_a || question.optionA || question.options?.A || '',
        option_b: question.option_b || question.optionB || question.options?.B || '',
        option_c: question.option_c || question.optionC || question.options?.C || '',
        option_d: question.option_d || question.optionD || question.options?.D || '',
        correct_answer: question.correct_answer || question.correctAnswer || question.answer || '',
        explain_detail: question.explain_detail || question.explainDetail || question.explanation || '',
        resource: question.resource || null
      })) || [];
      
      setAvailableQuestions(processedQuestions);
    } catch (err) {
      setError(`Failed to load available questions: ${err.message}`);
      console.error('Error in fetchAvailableQuestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter the questions based on search term
  const filteredQuestions = availableQuestions.filter(question => 
    question.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectQuestion = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedQuestions(availableQuestions.map(q => q.id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedQuestions.length === 0) {
      setError('Please select at least one question');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      console.log('Selected questions to add:', selectedQuestions);
      console.log('Exercise ID to add to:', exerciseId);
      
      // Add all selected questions to the exercise
      let successCount = 0;
      let errorCount = 0;
      
      for (const questionId of selectedQuestions) {
        try {
          console.log(`Adding question ${questionId} to exercise ${exerciseId}`);
          await ExercisesQuestionService.addQuestionToExercise(exerciseId, questionId);
          successCount++;
        } catch (err) {
          console.error(`Failed to add question ${questionId}:`, err);
          errorCount++;
        }
      }
      
      if (errorCount > 0) {
        setError(`Added ${successCount} questions, but failed to add ${errorCount} questions.`);
      }
      
      if (successCount > 0) {
        await onAddQuestions(); // Refresh the question list
        
        if (errorCount === 0) {
          onClose();
        }
      }
    } catch (err) {
      setError(`Failed to add questions: ${err.message}`);
      console.error('Error in handleSubmit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-modal-overlay">
      <div className="add-modal-content">
        <div className="add-modal-header">
          <h2>Add Existing Questions {fallbackMode ? "(Fallback Mode)" : ""}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="add-modal-body">
          {isLoading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i> Loading...
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={fetchAvailableQuestions} 
                disabled={isLoading}
              >
                <i className="fas fa-sync"></i> Retry
              </button>
            </div>
          ) : availableQuestions.length === 0 ? (
            <div className="empty-message">No available questions to add</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="add-modal-top-actions">
                <div className="search-question-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search questions by content..."
                    className="search-question-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="add-modal-top-buttons">
                  <button type="button" className="cancel-btn" onClick={onClose}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn" 
                    disabled={isLoading || selectedQuestions.length === 0}
                  >
                    {isLoading ? 'Adding...' : `Add ${selectedQuestions.length} Question(s)`}
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
                          checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
                        />
                      </th>
                      <th>Question</th>
                      <th>Option A</th>
                      <th>Option B</th>
                      <th>Option C</th>
                      <th>Option D</th>
                      <th>Correct Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map(question => (
                      <tr key={question.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => handleSelectQuestion(question.id)}
                          />
                        </td>
                        <td>{question.content}</td>
                        <td>{question.option_a}</td>
                        <td>{question.option_b}</td>
                        <td>{question.option_c}</td>
                        <td>{question.option_d}</td>
                        <td>{question.correct_answer}</td>
                      </tr>
                    ))}
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

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemToDelete, selectedItems }) => {
  if (!isOpen) return null;

  const isMultiDelete = !itemToDelete;
  const message = isMultiDelete 
    ? `Are you sure you want to delete ${selectedItems.length} selected questions?`
    : `Are you sure you want to delete this question?`;

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

const ManageExerciseQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [exerciseInfo, setExerciseInfo] = useState(null);
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
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isAddExistingModalOpen, setIsAddExistingModalOpen] = useState(false);

  const entriesOptions = [5, 10, 25, 50, 100];

  useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching exercise data for ID:', id);
        
        // Fetch exercise info
        const exerciseData = await ExercisesService.getExerciseById(id);
        setExerciseInfo(exerciseData);
        
        // Fetch questions for this exercise
        const questionsData = await ExercisesQuestionService.getAllQuestionsByExerciseId(id);
        console.log('Questions Data:', questionsData); // Log to check data structure
        
        // Get the first question to analyze its structure (if available)
        if (questionsData && questionsData.length > 0) {
          console.log('Sample question structure:', JSON.stringify(questionsData[0], null, 2));
        }
        
        // Ensure we have all required fields or provide defaults
        // Handle different possible property naming conventions
        const processedQuestions = questionsData?.map(question => ({
          id: question.id || question.questionId,
          content: question.content || question.question || question.questionContent || '',
          option_a: question.option_a || question.optionA || question.options?.A || '',
          option_b: question.option_b || question.optionB || question.options?.B || '',
          option_c: question.option_c || question.optionC || question.options?.C || '',
          option_d: question.option_d || question.optionD || question.options?.D || '',
          correct_answer: question.correct_answer || question.correctAnswer || question.answer || '',
          explain_detail: question.explain_detail || question.explainDetail || question.explanation || '',
          resource: question.resource || null
        })) || [];
        
        setQuestions(processedQuestions);
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching exercise data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExerciseData();
  }, [id]);

  const handleEntriesChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const filteredData = questions.filter(item =>
    item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.option_a?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.option_b?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.option_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.option_d?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const valueA = a[sortField] || '';
    const valueB = b[sortField] || '';

    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm]);

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

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
  };

  const getPageNumbers = (currentPage, totalPages) => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    range.push(1);

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i);
      }
    }

    if (totalPages > 1) {
      range.push(totalPages);
    }

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

  const handleEditClick = (item) => {
    setCurrentQuestion(item);
    setEditMode(true);
    setIsFormModalOpen(true);
  };

  const handleAddQuestion = () => {
    setCurrentQuestion(null);
    setEditMode(false);
    setIsFormModalOpen(true);
  };

  const handleAddExistingQuestions = () => {
    setIsAddExistingModalOpen(true);
  };

  const handleQuestionSubmit = async (questionData) => {
    try {
      // This would need to be implemented based on your API
      // For now, we'll just simulate it
      if (editMode) {
        // Update existing question
        // const updatedQuestion = await ExercisesQuestionService.updateQuestion(questionData);
        // setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
        alert('Question updated successfully (simulated)');
      } else {
        // Add new question
        // const newQuestion = await ExercisesQuestionService.addQuestion(questionData);
        // setQuestions(prev => [...prev, newQuestion]);
        alert('Question added successfully (simulated)');
      }
      
      // Refresh questions list
      const questionsData = await ExercisesQuestionService.getAllQuestionsByExerciseId(id);
      setQuestions(questionsData || []);
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} question:`, error);
      alert(`Failed to ${editMode ? 'update' : 'add'} question. Please try again.`);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await ExercisesQuestionService.removeQuestionFromExercise(id, questionId);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      setSelectedItems(prev => prev.filter(itemId => itemId !== questionId));
      alert('Question removed from exercise successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question. Please try again.');
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const deletePromises = selectedItems.map(questionId => 
        ExercisesQuestionService.removeQuestionFromExercise(id, questionId)
      );
      await Promise.all(deletePromises);
      setQuestions(prev => prev.filter(q => !selectedItems.includes(q.id)));
      setSelectedItems([]);
      alert(`${selectedItems.length} questions removed from exercise successfully`);
    } catch (error) {
      console.error('Error deleting questions:', error);
      alert('Failed to delete questions. Please try again.');
    }
  };

  const refreshQuestions = async () => {
    try {
      setIsLoading(true);
      const questionsData = await ExercisesQuestionService.getAllQuestionsByExerciseId(id);
      
      // Process questions to ensure consistent property naming
      const processedQuestions = questionsData?.map(question => ({
        id: question.id || question.questionId,
        content: question.content || question.question || question.questionContent || '',
        option_a: question.option_a || question.optionA || question.options?.A || '',
        option_b: question.option_b || question.optionB || question.options?.B || '',
        option_c: question.option_c || question.optionC || question.options?.C || '',
        option_d: question.option_d || question.optionD || question.options?.D || '',
        correct_answer: question.correct_answer || question.correctAnswer || question.answer || '',
        explain_detail: question.explain_detail || question.explainDetail || question.explanation || '',
        resource: question.resource || null
      })) || [];
      
      setQuestions(processedQuestions);
    } catch (err) {
      console.error('Error refreshing questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="word-container">
      <div className="topic-header">
        <button className="back-btn" onClick={() => navigate(`/admin/exercise`)}>
          <i className="fas fa-arrow-left"></i> Back to Exercise
        </button>
        <h1 className="header-title">
          Manage Questions: {exerciseInfo ? exerciseInfo.title : 'Loading...'}
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
                
          <button className="add-existing-btn" onClick={handleAddExistingQuestions}>
            <i className="fas fa-copy"></i>
            Add Existing
          </button>
          {selectedItems.length > 0 && (
            <button 
              className="delete-selected-btn"
              onClick={() => {
                setItemToDelete(null);
                setIsDeleteModalOpen(true);
              }}
            >
              <i className="fas fa-trash"></i>
              Delete Selected
            </button>
          )}
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
                  ID
                  <i className={`fas ${sortField === 'id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                </span>
              </div>
            </th>
            <th onClick={() => handleSort('content')} className="sortable content-column">
              Question
              <i className={`fas ${sortField === 'content' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('option_a')} className="sortable option-column">
              Option A
              <i className={`fas ${sortField === 'option_a' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('option_b')} className="sortable option-column">
              Option B
              <i className={`fas ${sortField === 'option_b' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('option_c')} className="sortable option-column">
              Option C
              <i className={`fas ${sortField === 'option_c' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('option_d')} className="sortable option-column">
              Option D
              <i className={`fas ${sortField === 'option_d' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('correct_answer')} className="sortable answer-column">
              Correct Answer
              <i className={`fas ${sortField === 'correct_answer' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('explain_detail')} className="sortable explain-column">
              Explanation
              <i className={`fas ${sortField === 'explain_detail' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th className="action-column">Action</th>
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
                      onClick={handleCheckboxClick}
                    />
                    <span>{item.id}</span>
                  </div>
                </td>
                <td className="content-cell">{item.content || "-"}</td>
                <td className="option-cell">{item.option_a || "-"}</td>
                <td className="option-cell">{item.option_b || "-"}</td>
                <td className="option-cell">{item.option_c || "-"}</td>
                <td className="option-cell">{item.option_d || "-"}</td>
                <td className="correct-answer-cell">{item.correct_answer || "-"}</td>
                <td className="explanation-cell">{item.explain_detail || "-"}</td>
                <td className="action-column">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditClick(item)}
                    title="Edit question"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => {
                      setItemToDelete(item);
                      setIsDeleteModalOpen(true);
                    }}
                    title="Delete question"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="empty-table">
                <div className="empty-message">
                  <i className="fas fa-question-circle"></i>
                  <p>No questions found for this exercise</p>
                  <div className="empty-actions">
                    <button className="add-existing-btn" onClick={handleAddExistingQuestions}>
                      <i className="fas fa-copy"></i> Add Existing Question
                    </button>
                  </div>
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

      {/* Modals */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={async () => {
          if (itemToDelete) {
            await handleDeleteQuestion(itemToDelete.id);
          } else {
            await handleDeleteSelected();
          }
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        itemToDelete={itemToDelete}
        selectedItems={selectedItems}
      />

      <QuestionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setCurrentQuestion(null);
          setEditMode(false);
        }}
        onSubmit={handleQuestionSubmit}
        questionItem={currentQuestion}
        exerciseId={id}
        editMode={editMode}
      />
      
      <AddExistingQuestionModal
        isOpen={isAddExistingModalOpen}
        onClose={() => setIsAddExistingModalOpen(false)}
        exerciseId={id}
        onAddQuestions={refreshQuestions}
      />
    </div>
  );
};

export default ManageExerciseQuestion;