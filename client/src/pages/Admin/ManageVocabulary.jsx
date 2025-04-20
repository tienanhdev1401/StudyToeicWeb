import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import vocabularyService from '../../services/admin/admin.vocabularyService';
import '../../styles/ManageVocabulary.css';

const AddVocabularyModal = ({ isOpen, onClose, onAdd, topicId }) => {
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

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (value.trim()) {
      setErrors({ ...errors, [name]: '' });
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newVocabulary = {
      ...formData,
      VocabularyTopicId: topicId,
    };

    // Convert synonym to array or object based on your data model
    if (formData.synonym) {
      try {
        newVocabulary.synonym = JSON.parse(formData.synonym);
      } catch (e) {
        // If not valid JSON, store as string
        newVocabulary.synonym = formData.synonym;
      }
    }

    onAdd(newVocabulary);
    onClose();
  };

  return (
    <div className="add-modal-overlay">
      <div className="add-modal-content">
        <div className="add-modal-header">
          <h2>Add New Word</h2>
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
              <label htmlFor="urlImage">Image URL</label>
              <input
                type="text"
                id="urlImage"
                name="urlImage"
                value={formData.urlImage}
                onChange={handleChange}
                placeholder="Enter image URL"
              />
              <div className="image-preview">
                {formData.urlImage && (
                  <img src={formData.urlImage} alt="Preview" onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Invalid+Image+URL";
                  }} />
                )}
              </div>
            </div>
            
            <div className="add-modal-footer">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Add Word
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);


  const id = useParams().id;

  useEffect(() => {
    const fetchVocabularyTopic = async () => {
      try {
        setIsLoading(true);
        
        // Assuming there's a method to get vocabulary by topic ID
        const data = await vocabularyService.getAllVocabularyByTopicId(id);
       // console.log(data);
        setTopicInfo(data.vocabularyTopic);
        setVocabularyList(data || []);
        console.log(vocabularyList);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVocabularyTopic();
  }, [topicId]);

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

  return (
    <div className="word-container">
      <div className="topic-header">
        <button className="back-btn" onClick={() => navigate(`/admin/vocabularyTopic/`)}>
          <i className="fas fa-arrow-left"></i> Back to Topics
        </button>
        <h1>
          Manage Words: {topicInfo?.topicName || 'Topic'}
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
                
          <button className="add-btn" onClick={() => setIsAddModalOpen(true)}>
            <i className="fas fa-plus"></i>
            Add New
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
                  ID
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
                  <button className="edit-btn">
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
                  <button className="add-btn" onClick={() => setIsAddModalOpen(true)}>
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
        onConfirm={() => {
          if (itemToDelete) {
            // Handle single item delete
            console.log("Deleting single word:", itemToDelete);
            // Call API to delete the item
            // Then update the state after successful deletion
            setVocabularyList(prev => prev.filter(item => item.id !== itemToDelete.id));
          } else {
            // Handle multiple items delete
            console.log("Deleting multiple words:", selectedItems);
            // Call API to delete multiple items
            // Then update the state after successful deletion
            setVocabularyList(prev => prev.filter(item => !selectedItems.includes(item.id)));
          }
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
          setSelectedItems([]);
        }}
        itemToDelete={itemToDelete}
        selectedItems={selectedItems}
      />

      <AddVocabularyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        topicId={topicId}
        onAdd={(newVocabulary) => {
          // In a real app, you would call an API to add the vocabulary item
          // and get back the saved item with an ID
          const mockId = vocabularyList.length > 0 
            ? Math.max(...vocabularyList.map(item => item.id)) + 1 
            : 1;
          
          const newItem = {
            ...newVocabulary,
            id: mockId,
          };
          
          setVocabularyList([...vocabularyList, newItem]);
        }}
      />
    </div>
  );
};

export default ManageVocabulary;
