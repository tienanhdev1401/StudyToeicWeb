import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import vocabularyService from '../../services/admin/admin.vocabularyService';
import vocabularyTopicService from '../../services/admin/admin.vocabularyTopicService';
import userService from '../../services/userService';
import '../../styles/ManageVocabulary.css';
import VocabularyExcelPreview from '../../components/VocabularyExcelPreview';
import { parseVocabularyExcel, isValidExcelFile } from '../../utils/excelUtils';
import SuccessAlert from '../../components/SuccessAlert';
import ErrorAlert from '../../components/ErrorAlert';

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
  
  // Add state for error alert
  const [showServerErrorAlert, setShowServerErrorAlert] = useState(false);
  const [serverError, setServerError] = useState('');

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
    setServerError('');
    setShowServerErrorAlert(false);

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
      setServerError(`Failed to ${editMode ? 'update' : 'add'} vocabulary. ${error.message || 'Please try again.'}`);
      setShowServerErrorAlert(true);
      setIsUploading(false);
    }
  };

  return (
    <div className="vocabulary-add-modal-overlay">
      <div className="vocabulary-add-modal-content">
        <div className="vocabulary-add-modal-header">
          <h2>{editMode ? 'Edit Word' : 'Add New Word'}</h2>
          <button type="button" className="vocabulary-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="vocabulary-add-modal-body">
          {/* Add ErrorAlert for server errors */}
          <ErrorAlert
            show={showServerErrorAlert}
            message={serverError}
            onClose={() => setShowServerErrorAlert(false)}
          />
          
          <form onSubmit={handleSubmit} noValidate>
            <div className={`vocabulary-form-group ${errors.content && touched.content ? 'has-error' : ''}`}>
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
                <div className="vocabulary-error-message">{errors.content}</div>
              )}
            </div>
            
            <div className={`vocabulary-form-group ${errors.meaning && touched.meaning ? 'has-error' : ''}`}>
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
                <div className="vocabulary-error-message">{errors.meaning}</div>
              )}
            </div>
            
            <div className="vocabulary-form-group">
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

            <div className="vocabulary-form-group">
              <label htmlFor="synonym">Synonym (JSON format)</label>
              <textarea
                id="synonym"
                name="synonym"
                value={formData.synonym}
                onChange={handleChange}
                placeholder='Enter synonyms (e.g., ["word1", "word2"])'
              />
            </div>
            
            <div className="vocabulary-form-group">
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
            
            <div className="vocabulary-form-group">
              <label htmlFor="urlImage">Image</label>
              <div className="vocabulary-image-upload-container">
                <input
                  type="file"
                  id="vocabularyImage"
                  name="vocabularyImage"
                  accept="image/jpeg, image/png, image/gif"
                  onChange={handleImageChange}
                  className="vocabulary-file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="vocabularyImage" className="vocabulary-file-input-label">
                  <i className="fas fa-upload"></i> {editMode && formData.urlImage ? 'Change Image' : 'Choose Image'}
                </label>
                <span className="vocabulary-file-name">
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
              <div className={`vocabulary-image-preview ${isUploading ? 'uploading' : ''}`}>
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
            
            <div className="vocabulary-add-modal-footer">
              <button type="button" className="vocabulary-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="vocabulary-submit-btn" disabled={isUploading}>
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
  const [vocabularies, setVocabularies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Add state for error alerts
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset state khi đóng modal
      setFile(null);
      setVocabularies([]);
      setShowErrorAlert(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    if (!isValidExcelFile(selectedFile)) {
      setErrorMessage('Only Excel (.xlsx, .xls) or CSV (.csv) files are allowed');
      setShowErrorAlert(true);
      return;
    }
    
    setFile(selectedFile);
    setIsLoading(true);
    
    try {
      const result = await parseVocabularyExcel(selectedFile);
      if (result.error) {
        setErrorMessage(result.error);
        setShowErrorAlert(true);
        setVocabularies([]);
      } else {
        setVocabularies(result.vocabularies);
        setShowErrorAlert(false);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      setErrorMessage(error.message || 'Could not parse the file. Please check the format.');
      setShowErrorAlert(true);
      setVocabularies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || vocabularies.length === 0) {
      setErrorMessage('Please select a valid file with vocabulary data.');
      setShowErrorAlert(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onImport(vocabularies);
      onClose();
    } catch (error) {
      console.error('Error importing vocabularies:', error);
      setErrorMessage(error.message || 'Failed to import vocabularies. Please try again.');
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="vocabulary-add-modal-overlay">
      <div className="vocabulary-add-modal-content vocabulary-import-modal">
        <div className="vocabulary-add-modal-header">
          <h2>Import Vocabulary from Excel</h2>
          <button className="vocabulary-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="vocabulary-add-modal-body">
          {/* Add ErrorAlert component */}
          <ErrorAlert
            show={showErrorAlert}
            message={errorMessage}
            onClose={() => setShowErrorAlert(false)}
          />
          
          <form onSubmit={handleSubmit}>
            <div className="vocabulary-form-group">
              <label htmlFor="excelFile">Select Excel File</label>
              <input
                type="file"
                id="excelFile"
                onChange={handleFileChange}
                accept=".xlsx, .xls, .csv"
                className="vocabulary-file-input"
              />
              <div className="vocabulary-template-download">
                <a href="/templates/vocabulary_template.xlsx" download>
                  <i className="fas fa-download"></i> Download Template
                </a>
              </div>
            </div>
            
            {vocabularies.length > 0 && (
              <div className="vocabulary-excel-preview">
                <div className="vocabulary-excel-preview-header">
                  Preview ({vocabularies.length} items)
                </div>
                <div className="vocabulary-excel-preview-content">
                  <VocabularyExcelPreview data={vocabularies} />
                </div>
              </div>
            )}
            
            <div className="vocabulary-import-modal-footer">
              <button 
                type="button" 
                className="vocabulary-cancel-btn" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="vocabulary-submit-btn"
                disabled={isLoading || vocabularies.length === 0}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> 
                    Importing...
                  </>
                ) : 'Import Vocabularies'}
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

  // Add state for alerts
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Move fetchVocabularies outside of useEffect to make it accessible throughout the component
  const fetchVocabularies = async () => {
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

  useEffect(() => {
    fetchVocabularies();
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
      <div className="vocabulary-modal-overlay">
        <div className="vocabulary-modal-content">
          <div className="vocabulary-modal-header">
            <h2>Confirm Delete</h2>
            <button className="vocabulary-close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="vocabulary-modal-body">
            <p>{message}</p>
          </div>
          <div className="vocabulary-modal-footer">
            <button className="vocabulary-cancel-btn" onClick={onClose}>Cancel</button>
            <button className="vocabulary-confirm-delete-btn" onClick={onConfirm}>
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

  // Add functions to display alerts
  const displaySuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessAlert(true);
  };
  
  const displayErrorMessage = (message) => {
    setErrorMessage(message);
    setShowErrorAlert(true);
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
        
        displaySuccessMessage('Vocabulary updated successfully');
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
        
        displaySuccessMessage('New vocabulary added successfully');
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} vocabulary:`, error);
      
      // Display error alert instead of using alert()
      displayErrorMessage(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'add'} vocabulary. Please try again.`);
    }
  };

  // Thêm hàm xử lý import
  const handleImportVocabularies = async (vocabularies) => {
    try {
      console.log("Importing vocabularies to topic ID:", id);
      
      // Convert all vocabulary items to the correct format
      const formattedVocabularies = vocabularies.map(item => ({
        ...item,
        VocabularyTopicId: parseInt(id)
      }));
      
      // Use the correct import function from the service
      const importResult = await vocabularyService.importVocabulariesFromExcel(id, formattedVocabularies);
      
      // Refresh the vocabulary list
      await fetchVocabularies();
      
      // Show success message
      displaySuccessMessage(`Successfully imported ${importResult.length} vocabularies`);
    } catch (error) {
      console.error("Error importing vocabularies:", error);
      displayErrorMessage(error.response?.data?.message || "Failed to import vocabularies. Please try again.");
    }
  };

  // Update the Delete confirmation handler to use alerts
  const handleDeleteConfirm = async () => {
    try {
      if (itemToDelete) {
        // Delete single item
        await vocabularyService.deleteVocabulary(itemToDelete.id);
        displaySuccessMessage(`Vocabulary "${itemToDelete.content}" deleted successfully`);
      } else {
        // Delete multiple items
        for (const id of selectedItems) {
          await vocabularyService.deleteVocabulary(id);
        }
        displaySuccessMessage(`${selectedItems.length} vocabularies deleted successfully`);
      }
      
      // Refresh the vocabulary list
      await fetchVocabularies();
      
      // Reset selection
      setSelectedItems([]);
    } catch (error) {
      console.error("Error deleting vocabulary:", error);
      displayErrorMessage(error.response?.data?.message || "Failed to delete vocabularies. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="vocabulary-container">
      {/* Add alert components */}
      <SuccessAlert 
        show={showSuccessAlert} 
        message={successMessage} 
        onClose={() => setShowSuccessAlert(false)} 
      />
      
      <ErrorAlert 
        show={showErrorAlert} 
        message={errorMessage} 
        onClose={() => setShowErrorAlert(false)} 
      />
      
      <div className="vocabulary-topic-header">
        <button className="vocabulary-back-btn" onClick={() => navigate(`/admin/vocabularyTopic/`)}>
          <i className="fas fa-arrow-left"></i> Back to Topics
        </button>
        <h1 className="vocabulary-header-title">
          Manage Words: {topicInfo ? topicInfo.topicName : 'Loading...'}
        </h1>
      </div>
      
      <div className="pagination">
        <div className="vocabulary-entries-select">
          <p>Show </p>
          <select 
            value={itemsPerPage} 
            onChange={handleEntriesChange}
            className="vocabulary-entries-dropdown"
          >
            {entriesOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p>entries </p>
        </div>

        <div className="vocabulary-action-section">
          <div className="vocabulary-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search..."
              className="vocabulary-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
                
          <button className="vocabulary-add-btn" onClick={handleAddVocabulary}>
            <i className="fas fa-plus"></i>
            Add New
          </button>
          <button className="vocabulary-import-btn" onClick={() => setIsImportModalOpen(true)}>
            <i className="fas fa-file-import"></i>
            Import Excel
          </button>
          <button className="manageVocabulary-trash-btn">
            <i className="fas fa-trash"></i>
            Trash
          </button>
        </div>
      </div>
        
      <table className="vocabulary-table">
        <thead>
          <tr>
            <th className="vocabulary-id-column">
              <div className="vocabulary-id-header">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedItems.length === sortedData.length && sortedData.length > 0}
                  onClick={handleCheckboxClick}
                />
                <span onClick={() => handleSort('id')} className="vocabulary-sortable">
                  STT
                  <i className={`fas ${sortField === 'id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                </span>
              </div>
            </th>
            <th onClick={() => handleSort('content')} className="vocabulary-sortable">
              Word
              <i className={`fas ${sortField === 'content' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('meaning')} className="vocabulary-sortable">
              Meaning
              <i className={`fas ${sortField === 'meaning' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('transcribe')} className="vocabulary-sortable">
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
                <td className="vocabulary-id-column">
                  <div className="vocabulary-id-cell">
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
                <td className="vocabulary-image-cell">
                  {item.urlImage && (
                    <img 
                      src={item.urlImage} 
                      alt={item.content} 
                      className="vocabulary-image" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/50?text=No+Image";
                      }} 
                    />
                  )}
                </td>
                <td className="vocabulary-audio-cell">
                  {item.urlAudio && (
                    <audio controls className="vocabulary-audio">
                      <source src={item.urlAudio} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </td>
                <td>
                  <button 
                    className="vocabulary-edit-btn"
                    onClick={() => handleEditClick(item)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button 
                    className="vocabulary-delete-btn"
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
              <td colSpan="7" className="vocabulary-empty-table">
                <div className="vocabulary-empty-message">
                  <i className="fas fa-book"></i>
                  <p>No words found for this topic</p>
                  <button className="vocabulary-add-btn" onClick={handleAddVocabulary}>
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
          <div className="vocabulary-pagination-buttons">
            <button 
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="vocabulary-page-btn"
            >
              Previous
            </button>
            
            {getPageNumbers(currentPage, totalPages).map((item, index) => (
              item === '...' ? (
                <span key={`dots-${index}`} className="vocabulary-page-dots">...</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`vocabulary-page-btn ${currentPage === item ? 'active' : ''}`}
                >
                  {item}
                </button>
              )
            ))}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="vocabulary-page-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="vocabulary-table-action-bar">
          <div className="vocabulary-action-bar-content">
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
        onConfirm={handleDeleteConfirm}
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