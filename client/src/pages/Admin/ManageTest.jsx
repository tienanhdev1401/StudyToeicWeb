import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ManageTest.css';
import SuccessAlert from '../../components/SuccessAlert';
import ErrorAlert from '../../components/ErrorAlert';
import testService from '../../services/admin/admin.testService';
const ManageTest = () => {
  const navigate = useNavigate();
  const [testList, setTestList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  // Selection states
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [testToEdit, setTestToEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Alert states
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Mẫu dữ liệu test tạm thời
 

  // Fetch data function
  const fetchTests = async () => {
    try {
      setIsLoading(true);
      // Trong thực tế, bạn sẽ gọi API ở đây    
      const data = await testService.getAllTests();
      
      // Sử dụng dữ liệu mẫu
      setTimeout(() => {
        setTestList(data);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchTests();
  }, []);

  // Alert display functions
  const displaySuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessAlert(true);
  };
  
  const displayErrorMessage = (message) => {
    setErrorMessage(message);
    setShowErrorAlert(true);
  };

  // Handle adding or updating a test
  const handleAddOrUpdateTest = async (test, isEdit) => {
    try {
      setIsSubmitting(true);
      
      // Mô phỏng việc gọi API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (isEdit) {
        // Update test logic
        setTestList(prevList => 
          prevList.map(item => item.id === test.id ? test : item)
        );
        displaySuccessMessage('Test updated successfully!');
      } else {
        // Add new test logic
        const newTest = {
          ...test,
          id: Math.max(...testList.map(t => t.id), 0) + 1,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setTestList(prevList => [...prevList, newTest]);
        displaySuccessMessage('Test added successfully!');
      }
      
      setIsAddModalOpen(false);
      setEditMode(false);
      setTestToEdit(null);
    } catch (error) {
      console.error('Error:', error);
      displayErrorMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      // Mô phỏng việc gọi API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (itemToDelete) {
        // Delete single item
        setTestList(prevList => prevList.filter(item => item.id !== itemToDelete.id));
        displaySuccessMessage(`Test "${itemToDelete.title}" deleted successfully`);
      } else {
        // Delete multiple items
        setTestList(prevList => prevList.filter(item => !selectedItems.includes(item.id)));
        displaySuccessMessage(`${selectedItems.length} tests deleted successfully`);
      }
      
      // Reset selection
      setSelectedItems([]);
    } catch (error) {
      console.error("Error deleting test:", error);
      displayErrorMessage("Failed to delete test(s). Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // Filter data based on search term
  const filteredData = testList.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.testCollection.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.duration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];

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
  const entriesOptions = [5, 10, 25, 50, 100];

  // Reset to page 1 when changing itemsPerPage or searchTerm
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm]);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(sortedData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Handle select individual item
  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle edit click
  const handleEditClick = (item) => {
    setTestToEdit(item);
    setEditMode(true);
    setIsAddModalOpen(true);
  };

  // Prevent sort when clicking checkbox
  const handleCheckboxClick = (e) => {
    e.stopPropagation();
  };

  // Generate page numbers for pagination
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

  // Loading and error states
  if (isLoading) {
    return <div className="manageTest-loading">Loading...</div>;
  }

  if (error) {
    return <div className="manageTest-error">Error: {error}</div>;
  }

  return (
    <div className="manageTest-container">
      {/* Alerts */}
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
      
      <h1 className="manageTest-header-title">Manage TOEIC Tests</h1>
      
      <div className="manageTest-pagination">
        <div className="manageTest-entries-select">
          <p>Show </p>
          <select 
            value={itemsPerPage} 
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="manageTest-entries-dropdown"
          >
            {entriesOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <p>entries </p>
        </div>

        <div className="manageTest-action-section">
          <div className="manageTest-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search..."
              className="manageTest-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
                
          <button className="manageTest-add-btn" onClick={() => setIsAddModalOpen(true)}>
            <i className="fas fa-plus"></i>
            Add New
          </button>
          
          <button className="manageTest-trash-btn">
            <i className="fas fa-trash"></i>
            Trash
          </button>
        </div>
      </div>
      
      <table className="manageTest-table">
        <thead>
          <tr>
            <th className="manageTest-id-column">
              <div className="manageTest-id-header">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedItems.length === sortedData.length && sortedData.length > 0}
                  onClick={handleCheckboxClick}
                />
                <span onClick={() => handleSort('id')} className="manageTest-sortable">
                  ID
                  <i className={`fas ${sortField === 'id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                </span>
              </div>
            </th>
            <th onClick={() => handleSort('title')} className="manageTest-sortable">
              Title
              <i className={`fas ${sortField === 'title' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('collection')} className="manageTest-sortable">
              Collection
              <i className={`fas ${sortField === 'collection' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('numberOfAttempts')} className="manageTest-sortable">
              Number of Attempts
              <i className={`fas ${sortField === 'numberOfAttempts' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('averageScore')} className="manageTest-sortable">
              Average Score
              <i className={`fas ${sortField === 'averageScore' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('createdAt')} className="manageTest-sortable">
              Date Created
              <i className={`fas ${sortField === 'createdAt' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <tr key={item.id}>
                <td className="manageTest-id-column">
                  <div className="manageTest-id-cell">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                    <span>{item.id}</span>
                  </div>
                </td>
                <td>{item.title}</td>
                <td>{item.collection}</td>
                <td>{item.numberOfAttempts}</td>
                <td>{item.averageScore}</td>
                <td>{item.createdAt}</td>
                <td>
                  <button 
                    className="manageTest-view-btn"
                    onClick={() => navigate(`/admin/test/${item.id}`)}
                  >
                    <i className="fa-solid fa-eye"></i>
                  </button>
                  <button 
                    className="manageTest-edit-btn"
                    onClick={() => handleEditClick(item)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button 
                    className="manageTest-delete-btn"
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
              <td colSpan="7" className="manageTest-empty-table">
                <div className="manageTest-empty-message">
                  <i className="fas fa-clipboard-list"></i>
                  <p>No tests found</p>
                  <button className="manageTest-add-btn" onClick={() => setIsAddModalOpen(true)}>
                    <i className="fas fa-plus"></i> Add Test
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {currentItems.length > 0 && (
        <div className="manageTest-pagination">
          <span>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="manageTest-pagination-buttons">
            <button 
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="manageTest-page-btn"
            >
              Previous
            </button>
            
            {getPageNumbers(currentPage, totalPages).map((item, index) => (
              item === '...' ? (
                <span key={`dots-${index}`} className="manageTest-page-dots">...</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`manageTest-page-btn ${currentPage === item ? 'active' : ''}`}
                >
                  {item}
                </button>
              )
            ))}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="manageTest-page-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="manageTest-table-action-bar">
          <div className="manageTest-action-bar-content">
            <span>{selectedItems.length} items selected</span>
            <button 
              className="manageTest-delete-selected-btn"
              onClick={() => {
                setItemToDelete(null);
                setIsDeleteModalOpen(true);
              }}
            >
              <i className="fas fa-trash"></i>
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="manageTest-modal-overlay">
          <div className="manageTest-modal-content">
            <div className="manageTest-modal-header">
              <h2>Confirm Delete</h2>
              <button className="manageTest-close-btn" onClick={() => setIsDeleteModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="manageTest-modal-body">
              <p>
                {itemToDelete 
                  ? `Are you sure you want to delete "${itemToDelete.title}"?`
                  : `Are you sure you want to delete ${selectedItems.length} selected items?`}
              </p>
            </div>
            <div className="manageTest-modal-footer">
              <button className="manageTest-cancel-btn" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="manageTest-confirm-delete-btn" onClick={handleDeleteConfirm}>
                <i className="fas fa-trash"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Test Modal */}
      {isAddModalOpen && (
        <TestFormModal
          isOpen={isAddModalOpen}
          onClose={() => {
            if (!isSubmitting) {
              setIsAddModalOpen(false);
              setEditMode(false);
              setTestToEdit(null);
            }
          }}
          onSubmit={handleAddOrUpdateTest}
          editMode={editMode}
          testItem={testToEdit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

// Test Form Modal Component
const TestFormModal = ({ isOpen, onClose, onSubmit, editMode = false, testItem = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Intermediate',
    duration: 120
  });

  const [errors, setErrors] = useState({
    title: '',
    description: ''
  });

  const [touched, setTouched] = useState({
    title: false,
    description: false
  });

  // Initialize form data when editing an existing item
  useEffect(() => {
    if (isOpen && editMode && testItem) {
      setFormData({
        title: testItem.title || '',
        description: testItem.description || '',
        level: testItem.level || 'Intermediate',
        duration: testItem.duration || 120
      });
    } else if (isOpen && !editMode) {
      // Reset form for adding new item
      setFormData({
        title: '',
        description: '',
        level: 'Intermediate',
        duration: 120
      });
      setErrors({
        title: '',
        description: ''
      });
      setTouched({
        title: false,
        description: false
      });
    }
  }, [isOpen, editMode, testItem]);

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
    
    if (fieldName === 'title' && !value.trim()) {
      errorMessage = 'Title is required';
    }
    
    if (fieldName === 'description' && !value.trim()) {
      errorMessage = 'Description is required';
    }
    
    setErrors({ ...errors, [fieldName]: errorMessage });
    return !errorMessage;
  };

  const validateForm = () => {
    const newErrors = {
      title: !formData.title.trim() ? 'Title is required' : '',
      description: !formData.description.trim() ? 'Description is required' : ''
    };
    
    setErrors(newErrors);
    setTouched({
      title: true,
      description: true
    });
    
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare data for submission
      const testData = {
        ...formData,
        duration: Number(formData.duration)
      };

      if (editMode && testItem) {
        testData.id = testItem.id;
        testData.createdAt = testItem.createdAt;
      }

      await onSubmit(testData, editMode);
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} test:`, error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="manageTest-add-modal-overlay">
      <div className="manageTest-add-modal-content">
        <div className="manageTest-add-modal-header">
          <h2>{editMode ? 'Edit Test' : 'Add New Test'}</h2>
          <button type="button" className="manageTest-close-btn" onClick={onClose} disabled={isSubmitting}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="manageTest-add-modal-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className={`manageTest-form-group ${errors.title && touched.title ? 'has-error' : ''}`}>
              <label htmlFor="title">Title <span className="required">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Enter test title"
                className={errors.title && touched.title ? 'manageTest-input-error' : ''}
                disabled={isSubmitting}
              />
              {errors.title && touched.title && (
                <div className="manageTest-error-message">{errors.title}</div>
              )}
            </div>
            
            <div className={`manageTest-form-group ${errors.description && touched.description ? 'has-error' : ''}`}>
              <label htmlFor="description">Description <span className="required">*</span></label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Enter test description"
                className={errors.description && touched.description ? 'manageTest-input-error' : ''}
                disabled={isSubmitting}
                rows={3}
              ></textarea>
              {errors.description && touched.description && (
                <div className="manageTest-error-message">{errors.description}</div>
              )}
            </div>
            
            <div className="manageTest-form-group">
              <label htmlFor="level">Level</label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            <div className="manageTest-form-group">
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min={1}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="manageTest-add-modal-footer">
              <button type="button" className="manageTest-cancel-btn" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="manageTest-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> 
                    Loading...
                  </>
                ) : (
                  editMode ? 'Save Changes' : 'Add Test'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageTest;
