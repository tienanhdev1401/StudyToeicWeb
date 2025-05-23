import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ManageTest.css';
import SuccessAlert from '../../components/SuccessAlert';
import ErrorAlert from '../../components/ErrorAlert';
import testService from '../../services/admin/admin.testService';
import { parseQuestionExcel } from '../../utils/excelUtils';

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
  const [isDeleting, setIsDeleting] = useState(false);

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
      setTestList(data);
    } catch (err) {
      setError(err.message || 'An error occurred while loading data');
    } finally {
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
  const handleAddOrUpdateTest = async (testData, isEdit) => {
    try {
      setIsSubmitting(true);
      
      let savedTest;
      
      if (isEdit) {
        // Update test using service
        savedTest = await testService.updateTest(testData.id, testData);
        // Update local state after successful API call
        setTestList(prevList => 
          prevList.map(item => item.id === testData.id ? savedTest : item)
        );
        displaySuccessMessage('Test updated successfully!');
      } else {
        // Add new test using service
        savedTest = await testService.createTest(testData);
        // Update local state after successful API call
        setTestList(prevList => [...prevList, savedTest]);
        displaySuccessMessage('Test added successfully!');
      }
      
      setIsAddModalOpen(false);
      setEditMode(false);
      setTestToEdit(null);
      
      return savedTest;
    } catch (error) {
      console.error('Error:', error);
      displayErrorMessage(error.message || 'An error occurred. Please try again.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      if (itemToDelete) {
        console.log(itemToDelete.id);
        // Delete single item using service
        await testService.deleteTest(itemToDelete.id);
        // Update local state after successful API call
        setTestList(prevList => prevList.filter(item => item.id !== itemToDelete.id));
        displaySuccessMessage(`Test "${itemToDelete.title}" deleted successfully`);
      } else {
        // Delete multiple items using service
        for(const id of selectedItems){
          await testService.deleteTest(id);
        }
        // Update local state after successful API call
        setTestList(prevList => prevList.filter(item => !selectedItems.includes(item.id)));
        displaySuccessMessage(`${selectedItems.length} tests deleted successfully`);
      }
      
      // Reset selection
      setSelectedItems([]);
    } catch (error) {
      console.error("Error deleting test:", error);
      displayErrorMessage("Failed to delete test(s). Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // Filter data based on search term
  const filteredData = testList.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.testCollection?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.duration?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
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
            <th onClick={() => handleSort('testCollection')} className="manageTest-sortable">
              Collection
              <i className={`fas ${sortField === 'testCollection' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('duration')} className="manageTest-sortable">
              Duration
              <i className={`fas ${sortField === 'duration' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('numberOfAttempts')} className="manageTest-sortable">
              Number of Attempts
              <i className={`fas ${sortField === 'numberOfAttempts' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('averageScore')} className="manageTest-sortable">
              Average Score
              <i className={`fas ${sortField === 'averageScore' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
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
                <td>{item.testCollection }</td>
                    <td>{item.duration}</td>
                 
                {/* <td>{item.numberOfAttempts}</td> */}
                <td>100</td>
                {/* <td>{item.averageScore}</td> */}
                <td>550/990</td>
                
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
              <button className="manageTest-close-btn" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
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
              <button className="manageTest-cancel-btn" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>Cancel</button>
              <button className="manageTest-confirm-delete-btn" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? (
                  'Deleting...'
                ) : (
                  <>
                    <i className="fas fa-trash"></i>
                    Delete
                  </>
                )}
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
          displayErrorMessage={displayErrorMessage}
          displaySuccessMessage={displaySuccessMessage}
          testList={testList}
        />
      )}
    </div>
  );
};

// Test Form Modal Component
const TestFormModal = ({ isOpen, onClose, onSubmit, editMode = false, testItem = null, isSubmitting = false, displayErrorMessage, displaySuccessMessage, testList }) => {
  const [formData, setFormData] = useState({
    title: '',
    testCollection: ''
  });

  const [errors, setErrors] = useState({
    title: '',
    testCollection: ''
  });

  const [touched, setTouched] = useState({
    title: false,
    testCollection: false
  });

  const [collections, setCollections] = useState([]);
  const [isNewCollection, setIsNewCollection] = useState(false);
  
  // File upload states
  const [testFile, setTestFile] = useState(null);
  const [solutionFile, setSolutionFile] = useState(null);
  const [fileErrors, setFileErrors] = useState({
    testFile: '',
    solutionFile: ''
  });
  const [uploadProgress, setUploadProgress] = useState({
    testFile: 0,
    solutionFile: 0
  });
  const [isUploading, setIsUploading] = useState(false);

  const [questionExcelFile, setQuestionExcelFile] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);

  const [isExcelImporting, setIsExcelImporting] = useState(false);
  const [excelImportError, setExcelImportError] = useState(null);

  // Fetch test collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const collectionsData = await testService.getTestCollections();
        setCollections(collectionsData);
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };

    fetchCollections();
  }, []);

  // Initialize form data when editing an existing item
  useEffect(() => {
    if (isOpen && editMode && testItem) {
      setFormData({
        title: testItem.title || '',
        testCollection: testItem.testCollection || ''
      });
      // Nếu đang chỉnh sửa, kiểm tra xem collection có trong danh sách không
      // Nếu không thì chuyển sang chế độ new collection
      if (collections.length > 0) {
        const collectionExists = collections.some(c => c.title === testItem.testCollection);
        setIsNewCollection(!collectionExists);
      }
    } else if (isOpen && !editMode) {
      // Reset form for adding new item
      setFormData({
        title: '',
        testCollection: ''
      });
      setErrors({
        title: '',
        testCollection: ''
      });
      setTouched({
        title: false,
        testCollection: false
      });
      // Mặc định là chọn collection có sẵn
      setIsNewCollection(false);
      setTestFile(null);
      setSolutionFile(null);
      setFileErrors({
        testFile: '',
        solutionFile: ''
      });
    }
  }, [isOpen, editMode, testItem, collections, testList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (value.trim()) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // If collection changes, validate title to check for duplicates
    if (name === 'testCollection' && formData.title.trim()) {
      validateField('title', formData.title);
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
    
    if (fieldName === 'title') {
      if (!value.trim()) {
        errorMessage = 'Title is required';
      } else if (formData.testCollection) {
        // Check for duplicate test title in the same collection
        const duplicateTest = testList.find(test => 
          test.testCollection === formData.testCollection && 
          test.title.toLowerCase() === value.toLowerCase() &&
          (!editMode || (editMode && test.id !== testItem.id))
        );
        
        if (duplicateTest) {
          errorMessage = `A test with title "${value}" already exists in this collection`;
        }
      }
    }
    
    if (fieldName === 'testCollection' && !value.trim()) {
      errorMessage = 'Collection is required';
    }
    
    setErrors({ ...errors, [fieldName]: errorMessage });
    return !errorMessage;
  };

  const validateForm = () => {
    const newErrors = {
      title: '',
      testCollection: ''
    };
    
    // Check if title is empty
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.testCollection) {
      // Check for duplicate test title in the same collection
      const duplicateTest = testList.find(test => 
        test.testCollection === formData.testCollection && 
        test.title.toLowerCase() === formData.title.toLowerCase() &&
        (!editMode || (editMode && test.id !== testItem?.id))
      );
      
      if (duplicateTest) {
        newErrors.title = `A test with title "${formData.title}" already exists in this collection`;
      }
    }
    
    // Check if collection is empty
    if (!formData.testCollection.trim()) {
      newErrors.testCollection = 'Collection is required';
    }
    
    setErrors(newErrors);
    setTouched({
      title: true,
      testCollection: true
    });
    
    return !Object.values(newErrors).some(error => error);
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      if (fileType === 'test') {
        setTestFile(file);
        setFileErrors({...fileErrors, testFile: ''});
      } else {
        setSolutionFile(file);
        setFileErrors({...fileErrors, solutionFile: ''});
      }
    }
  };

  const validateFiles = () => {
    const errors = {
      testFile: '',
      solutionFile: ''
    };
    
    setFileErrors(errors);
    return !errors.testFile && !errors.solutionFile;
  };

  // Add a validateExcelFile function
  const validateExcelFile = (file) => {
    if (!file) return false;
    
    // Check file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      displayErrorMessage('Invalid file format. Please upload an Excel file (.xlsx or .xls)');
      return false;
    }
    
    return true;
  };

  const handleQuestionExcelFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type immediately on selection
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        displayErrorMessage('Invalid file format. Please upload an Excel file (.xlsx or .xls)');
        return;
      }
      setQuestionExcelFile(file);
      setExcelImportError(null); // Clear previous errors when selecting a new file
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !validateFiles()) {
      return;
    }
    
    try {
      // Prepare data for submission
      const testData = {
        ...formData
      };
      if (editMode && testItem) {
        testData.id = testItem.id;
      }
      
      // First create or update the test
      const savedTest = await onSubmit(testData, editMode);
      
      // Always display success for the test creation/update itself
      const baseSuccessMessage = editMode ? 'Test information updated successfully!' : 'Test created successfully!';
      
      // Then upload files if provided
      setIsUploading(true);
      
      // Import all questions if Excel file is provided
      if (questionExcelFile) {
        // Validate the Excel file format first
        if (!validateExcelFile(questionExcelFile)) {
          displaySuccessMessage(baseSuccessMessage + ' However, the Excel file import failed due to invalid format.');
          setIsUploading(false);
          return;
        }
        
        setIsExcelImporting(true);
        setExcelImportError(null);
        try {
          await testService.importAllQuestionsFile(savedTest.id, questionExcelFile);
          setIsExcelImporting(false);
          displaySuccessMessage(baseSuccessMessage + ' Questions imported successfully!');
          onClose && onClose();
        } catch (error) {
          console.error(`Error importing questions:`, error);
          setIsExcelImporting(false);
          
          // Always show a success message for the test creation/update itself
          displaySuccessMessage(baseSuccessMessage);
          
          let errorMsg = "The test was saved, but importing questions from the Excel file failed. Please check the file format.";
          
          // Get specific error message from server response or use default
          if (error.response?.data?.message) {
            errorMsg = `The test was saved, but importing questions failed: ${error.response.data.message}`;
          } else if (error.message && error.message.includes('format')) {
            errorMsg = "The test was saved, but the Excel file has an invalid format. Please ensure your file matches the required template.";
          }
          
          // Display error notification
          displayErrorMessage(errorMsg);
          
          // Handle validation errors from the server
          if (error.response && error.response.data) {
            const responseData = error.response.data;
            console.log("Server response:", responseData);
            
            if (responseData.isFull === true) {
              // If test is full, close modal after showing alert
              onClose && onClose();
            } else {
              // Show detailed errors in the form
              setExcelImportError({
                message: responseData.message,
                errors: responseData.errors || {},
                isFull: false
              });
              // Keep test data but show import errors
              setIsUploading(false);
            }
          } else {
            // For general errors (network issues, etc.)
            setExcelImportError({
              message: 'Error importing questions. Please check the file and try again.',
              errors: {},
              isFull: false
            });
            // Keep test data but show import errors
            setIsUploading(false);
          }
        }
      } else {
        // If in edit mode and no Excel file is provided
        displaySuccessMessage(baseSuccessMessage + (editMode ? '' : ' You can add questions later.'));
        setIsUploading(false);
        onClose && onClose();
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} test:`, error);
      displayErrorMessage(error.message || `Error ${editMode ? 'updating' : 'adding'} test. Please try again.`);
      setIsUploading(false);
      setIsExcelImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="manageTest-add-modal-overlay">
      <div className="manageTest-add-modal-content">
        <div className="manageTest-add-modal-header">
          <h2>{editMode ? 'Edit Test' : 'Add New Test'}</h2>
          <button type="button" className="manageTest-close-btn" onClick={onClose} disabled={isSubmitting || isUploading}>
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
                disabled={isSubmitting || isUploading}
              />
              {errors.title && touched.title && (
                <div className="manageTest-error-message">{errors.title}</div>
              )}
            </div>
            
            <div className={`manageTest-form-group ${errors.testCollection && touched.testCollection ? 'has-error' : ''}`}>
              <label htmlFor="testCollection">Collection <span className="required">*</span></label>
              <div className="collection-input-group">
                <div className="collection-toggle">
                  <button 
                    type="button" 
                    className={`collection-toggle-btn ${!isNewCollection ? 'active' : ''}`} 
                    onClick={() => setIsNewCollection(false)}
                    disabled={isSubmitting || isUploading || collections.length === 0}
                  >
                    Use Existing
                  </button>
                  <button 
                    type="button" 
                    className={`collection-toggle-btn ${isNewCollection ? 'active' : ''}`} 
                    onClick={() => setIsNewCollection(true)}
                    disabled={isSubmitting || isUploading}
                  >
                    Create New
                  </button>
                </div>
                
                {isNewCollection ? (
                  <input
                    type="text"
                    id="testCollection"
                    name="testCollection"
                    value={formData.testCollection}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    placeholder="Enter new collection name"
                    className={errors.testCollection && touched.testCollection ? 'manageTest-input-error' : ''}
                    disabled={isSubmitting || isUploading}
                  />
                ) : (
                  <select
                    id="testCollection"
                    name="testCollection"
                    value={formData.testCollection}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={errors.testCollection && touched.testCollection ? 'manageTest-input-error' : ''}
                    disabled={isSubmitting || isUploading || collections.length === 0}
                  >
                    <option value="">Select a collection</option>
                    {collections.map((collection) => (
                      <option key={collection.id} value={collection.title}>
                        {collection.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {errors.testCollection && touched.testCollection && (
                <div className="manageTest-error-message">{errors.testCollection}</div>
              )}
              {collections.length === 0 && !isNewCollection && (
                <div className="manageTest-info-message">
                  No collections available. Please create a new one.
                </div>
              )}
            </div>
            
            
            {/* <div className="manageTest-form-group">
              <label htmlFor="testFile">TOEIC Test Excel File {!editMode && <span className="required">*</span>}</label>
              <div className="manageTest-file-upload-container">
                <input
                  type="file"
                  id="testFile"
                  accept=".xlsx,.xls"
                  onChange={(e) => handleFileChange(e, 'test')}
                  disabled={isSubmitting || isUploading}
                  className={fileErrors.testFile ? 'manageTest-file-input-error' : ''}
                />
                <button 
                  type="button"
                  className="manageTest-file-upload-btn"
                  onClick={() => document.getElementById('testFile').click()}
                  disabled={isSubmitting || isUploading}
                >
                  <i className="fas fa-upload"></i> 
                  {testFile ? testFile.name : 'Choose File'}
                </button>
              </div>
              {fileErrors.testFile && (
                <div className="manageTest-error-message">{fileErrors.testFile}</div>
              )}
              {isUploading && testFile && (
                <div className="manageTest-upload-progress">
                  <div className="manageTest-progress-bar" style={{ width: `${uploadProgress.testFile}%` }}></div>
                  <span>{uploadProgress.testFile}%</span>
                </div>
              )}
            </div> */}
            
            {/* <div className="manageTest-form-group">
              <label htmlFor="solutionFile">TOEIC Solution Excel File {!editMode && <span className="required">*</span>}</label>
              <div className="manageTest-file-upload-container">
                <input
                  type="file"
                  id="solutionFile"
                  accept=".xlsx,.xls"
                  onChange={(e) => handleFileChange(e, 'solution')}
                  disabled={isSubmitting || isUploading}
                  className={fileErrors.solutionFile ? 'manageTest-file-input-error' : ''}
                />
                <button 
                  type="button"
                  className="manageTest-file-upload-btn"
                  onClick={() => document.getElementById('solutionFile').click()}
                  disabled={isSubmitting || isUploading}
                >
                  <i className="fas fa-upload"></i> 
                  {solutionFile ? solutionFile.name : 'Choose File'}
                </button>
              </div>
              {fileErrors.solutionFile && (
                <div className="manageTest-error-message">{fileErrors.solutionFile}</div>
              )}
              {isUploading && solutionFile && (
                <div className="manageTest-upload-progress">
                  <div className="progress-bar" style={{ width: `${uploadProgress.solutionFile}%` }}></div>
                  <span>{uploadProgress.solutionFile}%</span>
                </div>
              )}
            </div> */}
            
            <div className="manageTest-form-group">
              <label htmlFor="questionExcelFile">
                Import All Questions (Excel)
              </label>
              <div className="manageTest-file-upload-container">
                <input
                  type="file"
                  id="questionExcelFile"
                  accept=".xlsx,.xls"
                  onChange={handleQuestionExcelFileChange}
                  disabled={isSubmitting || isUploading || isExcelImporting}
                />
                <button 
                  type="button"
                  className="manageTest-file-upload-btn"
                  onClick={() => document.getElementById('questionExcelFile').click()}
                  disabled={isSubmitting || isUploading || isExcelImporting}
                >
                  <i className="fas fa-upload"></i> 
                  {questionExcelFile ? 'Change File' : 'Choose File'}
                </button>
                {questionExcelFile && <span className="manageTest-file-name">{questionExcelFile.name}</span>}
              </div>
              {!questionExcelFile && (
                <div className="manageTest-info-message">
                  <i className="fas fa-info-circle"></i>
                  {editMode 
                    ? "Optional: Upload a file to update test questions. Skipping this will keep existing questions."
                    : "Optional: Upload an Excel file to import questions for this test. You can also add questions later."}
                </div>
              )}
              {isExcelImporting && (
                <div className="manageTest-import-progress">
                  <i className="fas fa-spinner fa-spin"></i> Importing questions from Excel...
                </div>
              )}
              {excelImportError && (
                <div className="manageTest-excel-error">
                  <div className="manageTest-error-message">
                    <i className="fas fa-exclamation-circle"></i> {excelImportError.message}
                  </div>
                  {excelImportError.errors && Object.keys(excelImportError.errors).length > 0 && (
                    <div className="manageTest-error-details">
                      <ul>
                        {Object.entries(excelImportError.errors).map(([partNumber, errorMessage]) => (
                          <li key={partNumber}>
                            <strong>Part {partNumber}:</strong> {errorMessage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="manageTest-error-summary">
                    <i className="fas fa-info-circle"></i> 
                    {excelImportError.isFull 
                      ? "This test already has the full 200 questions according to TOEIC standards. Please create a new test if you want to add more questions."
                      : "This test is almost full of questions according to TOEIC standards. Please check the number of questions in each part."}
                  </div>
                  {excelImportError.isFull && (
                    <div className="manageTest-full-test-badge">
                      <i className="fas fa-check-circle"></i> Test has all required questions
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="manageTest-add-modal-footer">
              <button type="button" className="manageTest-cancel-btn" onClick={onClose} disabled={isSubmitting || isUploading}>
                Cancel
              </button>
              <button type="submit" className="manageTest-submit-btn" disabled={isSubmitting || isUploading}>
                {isSubmitting || isUploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> 
                    {isUploading ? 'Uploading...' : 'Processing...'}
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
