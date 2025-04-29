import React, {useState, useEffect} from 'react';
import '../../styles/ManageExercise.css';
import { useNavigate } from 'react-router-dom';
import ExercisesService from '../../services/admin/admin.ExercisesService';

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return { date: 'N/A', time: 'N/A' };
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return { date: 'Invalid date', time: '' };
  
  const dateFormatted = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const timeFormatted = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return { date: dateFormatted, time: timeFormatted };
};

const AddExerciseModal = ({isOpen, onClose, onAdd, editMode = false, exerciseToEdit = null, isSubmitting = false}) => {
  const [formData, setFormData] = useState({
    exerciseName: '',
  });
  const [errors, setErrors] = useState({
    exerciseName: ''
  });
  const [touched, setTouched] = useState({
    exerciseName: false
  });
  const [serverError, setServerError] = useState('');
  const [existingExerciseNames, setExistingExerciseNames] = useState([]);
  
  // Handle loading existing exercise names when modal opens
  useEffect(() => {
    const fetchExistingExercises = async () => {
      try {
        const exercises = await ExercisesService.getAllExercises();
        // Filter out the current exercise if in edit mode
        const exerciseNames = exercises
          .filter(item => !editMode || item.exercise.id !== exerciseToEdit?.id)
          .map(item => item.exercise.exerciseName.toLowerCase());
        setExistingExerciseNames(exerciseNames);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };
    
    if (isOpen) {
      fetchExistingExercises();
      setServerError(''); // Clear server error when modal opens
    }
  }, [isOpen, editMode, exerciseToEdit]);

  // Initialize form with exercise data when editing
  useEffect(() => {
    if (isOpen && editMode && exerciseToEdit) {
      setFormData({
        exerciseName: exerciseToEdit.exerciseName || '',
      });
    } else if (isOpen && !editMode) {
      // Reset form for adding new exercise
      setFormData({ exerciseName: '' });
      setErrors({ exerciseName: '' });
      setTouched({ exerciseName: false });
      setServerError('');
    }
  }, [isOpen, editMode, exerciseToEdit]);

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
    
    if (fieldName === 'exerciseName') {
      if (!value.trim()) {
        errorMessage = 'Exercise name is required';
      } else if (existingExerciseNames.includes(value.trim().toLowerCase())) {
        errorMessage = 'Exercise name already exists';
      }
    }
    
    setErrors({...errors, [fieldName]: errorMessage});
    return !errorMessage;
  };

  const validateForm = () => {
    const exerciseNameValue = formData.exerciseName.trim();
    
    const newErrors = {
      exerciseName: !exerciseNameValue ? 'Exercise name is required' : 
                (existingExerciseNames.includes(exerciseNameValue.toLowerCase()) ? 'Exercise name already exists' : '')
    };
    
    setErrors(newErrors);
    setTouched({
      exerciseName: true
    });
    
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }
    
    if (isSubmitting) {
      return;
    }

    try {
      const exerciseData = {
        exerciseName: formData.exerciseName.trim()
      };

      await onAdd(exerciseData, editMode);
    } catch (error) {
      console.error('Error:', error);
      setServerError(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="exercise-management-modal-overlay">
      <div className="exercise-management-modal-content">
        <div className="exercise-management-modal-header">
          <h2>{editMode ? 'Edit Exercise' : 'Add New Exercise'}</h2>
          <button type="button" className="exercise-management-close-btn" onClick={onClose} disabled={isSubmitting}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="exercise-management-modal-body">
          {serverError && (
            <div className="exercise-management-error-message">{serverError}</div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className={`exercise-management-form-group ${errors.exerciseName && touched.exerciseName ? 'has-error' : ''}`}>
              <label htmlFor="exerciseName">Exercise Name <span className="exercise-management-required">*</span></label>
              <input
                type="text"
                id="exerciseName"
                name="exerciseName"
                value={formData.exerciseName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Enter exercise name"
                disabled={isSubmitting}
              />
              {errors.exerciseName && touched.exerciseName && (
                <div className="exercise-management-error-message">{errors.exerciseName}</div>
              )}
            </div>
            
            <div className="exercise-management-modal-footer">
              <button type="button" className="exercise-management-cancel-btn" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="exercise-management-save-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> 
                    Loading...
                  </>
                ) : (
                  editMode ? 'Save Changes' : 'Add Exercise'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 

const ManageExercise = () => {
  const navigate = useNavigate();
  const [exerciseList, setExerciseList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortField, setSortField] = useState('exercise.id');
  const [sortDirection, setSortDirection] = useState('asc');

  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      const data = await ExercisesService.getAllExercises();
      setExerciseList(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch exercises');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrUpdateExercise = async (exercise, isEdit) => {
    try {
      setIsSubmitting(true);
      if (isEdit) {
        // Update existing exercise
        await ExercisesService.updateExercise(exerciseToEdit.id, exercise);
        alert('Exercise updated successfully!');
      } else {
        // Add new exercise
        await ExercisesService.addExercise(exercise);
        alert('Exercise added successfully!');
      }
      
      // Refresh the list
      await fetchExercises();

      setIsAddModalOpen(false);
      setEditMode(false);
      setExerciseToEdit(null);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred. Please try again.');
      throw error; // Re-throw so the modal can display the error
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

  // Filter data based on search term
  const filteredData = exerciseList.filter(item =>
    item.exercise.exerciseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.exercise.id.toString().includes(searchTerm) ||
    item.questionCount.toString().includes(searchTerm)
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

  // Reset to page 1 when changing entries per page or search term
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
      setSelectedItems(sortedData.map(item => item.exercise.id));
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

  // Handle edit button click
  const handleEditClick = (item) => {
    setExerciseToEdit({
      id: item.exercise.id,
      exerciseName: item.exercise.exerciseName
    });
    setEditMode(true);
    setIsAddModalOpen(true);
  };

  // Delete confirmation modal component
  const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemToDelete, selectedItems }) => {
    if (!isOpen) return null;

    const isMultiDelete = !itemToDelete;
    const message = isMultiDelete 
      ? `Are you sure you want to delete ${selectedItems.length} selected exercises?`
      : `Are you sure you want to delete "${itemToDelete.exercise.exerciseName}"?`;

    return (
      <div className="exercise-management-modal-overlay">
        <div className="exercise-management-modal-content">
          <div className="exercise-management-modal-header">
            <h2>Confirm Delete</h2>
            <button className="exercise-management-close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="exercise-management-modal-body">
            <p>{message}</p>
          </div>
          <div className="exercise-management-modal-footer">
            <button className="exercise-management-cancel-btn" onClick={onClose}>Cancel</button>
            <button className="exercise-management-confirm-delete-btn" onClick={onConfirm}>
              <i className="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Generate page numbers for pagination
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
    return <div className="exercise-management-container">
      <div className="exercise-management-loading">
        <i className="fas fa-spinner fa-spin"></i> Loading exercises...
      </div>
    </div>;
  }

  if (error) {
    return <div className="exercise-management-container">
      <div className="exercise-management-error">
        <i className="fas fa-exclamation-triangle"></i> Error: {error}
      </div>
    </div>;
  }

  return (
    <div className="exercise-management-container">
      <h1 className="exercise-management-header-title">Manage Exercises</h1>
      <div className="exercise-management-pagination">
        <div className="exercise-management-entries-select">
          <p>Show </p>
          <select 
            value={itemsPerPage} 
            onChange={handleEntriesChange}
            className="exercise-management-entries-dropdown"
          >
            {entriesOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p>entries </p>
        </div>

        <div className="exercise-management-action-section">
          <div className="exercise-management-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search..."
              className="exercise-management-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
                
          <button className="exercise-management-add-btn" onClick={() => setIsAddModalOpen(true)}>
            <i className="fas fa-plus"></i>
            Add New
          </button>
        </div>
      </div>
        
      <table className="exercise-management-table">
        <thead>
          <tr>
            <th className="exercise-id-column">
              <div className="exercise-management-id-header">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedItems.length === sortedData.length && sortedData.length > 0}
                  onClick={handleCheckboxClick}
                />
                <span onClick={() => handleSort('exercise.id')} className="sortable">
                  ID
                  <i className={`fas ${sortField === 'exercise.id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                </span>
              </div>
            </th>
            <th onClick={() => handleSort('exercise.exerciseName')} className="exercise-name-column sortable">
              Exercise Name
              <i className={`fas ${sortField === 'exercise.exerciseName' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('questionCount')} className="exercise-question-count-column sortable">
              Questions
              <i className={`fas ${sortField === 'questionCount' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('exercise.createdAt')} className="exercise-created-column sortable">
              Created At
              <i className={`fas ${sortField === 'exercise.createdAt' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('exercise.updatedAt')} className="exercise-updated-column sortable">
              Updated At
              <i className={`fas ${sortField === 'exercise.updatedAt' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th className="exercise-actions-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <tr key={item.exercise.id}>
                <td>
                  <div className="exercise-management-id-cell">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.exercise.id)}
                      onChange={() => handleSelectItem(item.exercise.id)}
                    />
                    <span>{item.exercise.id}</span>
                  </div>
                </td>
                <td className="exercise-management-name">{item.exercise.exerciseName}</td>
                <td className="text-center">
                  <span className="exercise-question-count-badge">{item.questionCount}</span>
                </td>
                <td className="exercise-created-column">
                  <div className="exercise-date-display">
                    <span className="exercise-date-value">
                      {formatDate(item.exercise.createdAt).date}
                    </span>
                    <span className="exercise-time-value">
                      {formatDate(item.exercise.createdAt).time}
                    </span>
                  </div>
                </td>
                <td className="exercise-updated-column">
                  <div className="exercise-date-display">
                    <span className="exercise-date-value">
                      {formatDate(item.exercise.updatedAt).date}
                    </span>
                    <span className="exercise-time-value">
                      {formatDate(item.exercise.updatedAt).time}
                    </span>
                  </div>
                </td>
                <td>
                  <button 
                    className="exercise-management-view-btn"
                    onClick={() => navigate(`/admin/exercise/${item.exercise.id}/questions`)}
                    title="View Questions"
                  >
                    <i className="fa-solid fa-eye"></i>
                  </button>

                  <button 
                    className="exercise-management-edit-btn"
                    onClick={() => handleEditClick(item)}
                    title="Edit Exercise"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button 
                    className="exercise-management-delete-btn"
                    onClick={() => {
                      setItemToDelete(item);
                      setIsDeleteModalOpen(true);
                    }}
                    title="Delete Exercise"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="exercise-management-empty-table">
                <div className="exercise-management-empty-message">
                  <i className="fas fa-book"></i>
                  <p>No exercises found</p>
                  <button className="exercise-management-add-btn" onClick={() => setIsAddModalOpen(true)}>
                    <i className="fas fa-plus"></i> Add Exercise
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {currentItems.length > 0 && (
        <div className="exercise-management-pagination">
          <span>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="exercise-management-pagination-buttons">
            <button 
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="exercise-management-page-btn"
            >
              Previous
            </button>
            
            {getPageNumbers(currentPage, totalPages).map((item, index) => (
              item === '...' ? (
                <span key={`dots-${index}`} className="exercise-management-page-dots">...</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`exercise-management-page-btn ${currentPage === item ? 'active' : ''}`}
                >
                  {item}
                </button>
              )
            ))}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="exercise-management-page-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="exercise-management-table-action-bar">
          <div className="exercise-management-action-bar-content">
            <span>{selectedItems.length} items selected</span>
            <button 
              className="exercise-management-delete-selected-btn"
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
              // Delete single exercise
              await ExercisesService.deleteExercise(itemToDelete.exercise.id);
            } else {
              // Delete multiple exercises
              const deletePromises = selectedItems.map(id => ExercisesService.deleteExercise(id));
              await Promise.all(deletePromises);
            }
            
            // Refresh the list
            await fetchExercises();
            // Reset selected items
            setSelectedItems([]);
            alert('Exercise(s) deleted successfully!');
          } catch (error) {
            console.error("Error deleting exercises:", error);
            alert("Failed to delete exercises. Please try again.");
          }
          
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        itemToDelete={itemToDelete}
        selectedItems={selectedItems}
      />

      {/* Add/Edit exercise modal */}
      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          if(!isSubmitting) {
            setIsAddModalOpen(false);
            setEditMode(false);
            setExerciseToEdit(null);
          }
        }}
        onAdd={handleAddOrUpdateExercise}
        editMode={editMode}
        exerciseToEdit={exerciseToEdit}
        isSubmitting={isSubmitting}
      />
    </div>
  );  
};   

export default ManageExercise;