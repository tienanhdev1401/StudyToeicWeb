import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import questionService from '../../services/admin/admin.questionService';
import userService from '../../services/userService';
import '../../styles/ManageQuestion.css';
import SuccessAlert from '../../components/SuccessAlert';
import ErrorAlert from '../../components/ErrorAlert';
import { Editor } from '@tinymce/tinymce-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { parseQuestionExcel } from '../../utils/excelUtils';

// Replace QuestionFormModal with a new modal that matches TestDetail's form
const QuestionFormModal = ({ isOpen, onClose, onSubmit, questionItem, editMode = false, submitting = false }) => {
  const [formData, setFormData] = useState({
    content: '',
    explainDetail: '',
    explain_resource: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    audioUrl: '',
    imageUrl: '',
  });
  const [explainDetailPreview, setExplainDetailPreview] = useState('');
  const [explainResourcePreview, setExplainResourcePreview] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && questionItem) {
      setFormData({
        content: questionItem.content || '',
        explainDetail: questionItem.explainDetail || '',
        explain_resource: questionItem.resource?.explain_resource || '',
        optionA: questionItem.optionA || '',
        optionB: questionItem.optionB || '',
        optionC: questionItem.optionC || '',
        optionD: questionItem.optionD || '',
        correctAnswer: ['A', 'B', 'C', 'D'].includes(questionItem.correctAnswer) ? questionItem.correctAnswer : '',
        audioUrl: questionItem.resource?.urlAudio || '',
        imageUrl: questionItem.resource?.urlImage || '',
      });
      setExplainDetailPreview(questionItem.explainDetail || '');
      setExplainResourcePreview(questionItem.resource?.explain_resource || '');
    } else if (isOpen) {
      setFormData({
        content: '',
        explainDetail: '',
        explain_resource: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: '',
        audioUrl: '',
        imageUrl: '',
      });
      setExplainDetailPreview('');
      setExplainResourcePreview('');
    }
  }, [isOpen, questionItem]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="question-modal-overlay">
      <div className="question-modal-content">
        <div className="question-modal-header">
          <h3>{editMode ? 'Edit Question' : 'Add New Question'}</h3>
          <button className="question-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(formData); }} className="question-form-body">
          {error && (
            <div className="question-form-error-message">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
          <div className="question-form-group">
            <label htmlFor="content">Question Content:</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Enter the question text here..."
            />
          </div>
          <div className="question-form-group">
            <label htmlFor="explainDetail">Explanation:</label>
            <Editor
              apiKey="mbktsx5e61er2k8coefqk7u51n3sf1m7z1r9qyqcpv01grpw"
              value={formData.explainDetail}
              onEditorChange={value => setFormData(prev => ({ ...prev, explainDetail: value }))}
              init={{
                height: 120,
                menubar: false,
                plugins: 'lists link',
                toolbar: 'undo redo | bold italic underline | forecolor | bullist numlist | removeformat',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
              }}
            />
            {formData.explainDetail && (
              <div style={{ marginTop: '8px', background: '#f6f6f6', padding: '8px', borderRadius: '4px' }}>
                <b>Preview:</b>
                <div dangerouslySetInnerHTML={{ __html: formData.explainDetail }} />
              </div>
            )}
          </div>
          <div className="question-form-group">
            <label htmlFor="explain_resource">Translation/Explanation Resource:</label>
            <Editor
              apiKey="mbktsx5e61er2k8coefqk7u51n3sf1m7z1r9qyqcpv01grpw"
              value={formData.explain_resource}
              onEditorChange={value => setFormData(prev => ({ ...prev, explain_resource: value }))}
              init={{
                height: 120,
                menubar: false,
                plugins: 'lists link',
                toolbar: 'undo redo | bold italic underline | forecolor | bullist numlist | removeformat',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
              }}
            />
            {formData.explain_resource && (
              <div style={{ marginTop: '8px', background: '#f6f6f6', padding: '8px', borderRadius: '4px' }}>
                <b>Preview:</b>
                <div dangerouslySetInnerHTML={{ __html: formData.explain_resource }} />
              </div>
            )}
          </div>
          <div className="question-form-group">
            <label htmlFor="optionA">Option A:</label>
            <input
              type="text"
              id="optionA"
              name="optionA"
              value={formData.optionA}
              onChange={handleChange}
              required
              placeholder="Enter option A..."
            />
          </div>
          <div className="question-form-group">
            <label htmlFor="optionB">Option B:</label>
            <input
              type="text"
              id="optionB"
              name="optionB"
              value={formData.optionB}
              onChange={handleChange}
              required
              placeholder="Enter option B..."
            />
          </div>
          <div className="question-form-group">
            <label htmlFor="optionC">Option C:</label>
            <input
              type="text"
              id="optionC"
              name="optionC"
              value={formData.optionC}
              onChange={handleChange}
              required
              placeholder="Enter option C..."
            />
          </div>
          <div className="question-form-group">
            <label htmlFor="optionD">Option D:</label>
            <input
              type="text"
              id="optionD"
              name="optionD"
              value={formData.optionD}
              onChange={handleChange}
              required
              placeholder="Enter option D..."
            />
          </div>
          <div className="question-form-group">
            <label htmlFor="correctAnswer">Correct Answer:</label>
            <select
              id="correctAnswer"
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleChange}
              required
            >
              <option value="">Select Correct Answer</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
          <div className="question-form-group">
            <label htmlFor="audioUrl">Audio URL (optional):</label>
            <input
              type="text"
              id="audioUrl"
              name="audioUrl"
              value={formData.audioUrl}
              onChange={handleChange}
              placeholder="Enter audio URL if applicable..."
            />
            {formData.audioUrl && (
              <div className="question-form-preview-container">
                <audio controls style={{ width: '100%' }}>
                  <source src={formData.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
          <div className="question-form-group">
            <label htmlFor="imageUrl">Image URL (optional):</label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="Enter image URL if applicable..."
            />
            {formData.imageUrl && (
              <div className="question-form-preview-container">
                <img
                  src={formData.imageUrl}
                  alt="Question image preview"
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 4, marginTop: 8 }}
                />
              </div>
            )}
          </div>
          <div className="question-modal-footer">
            <button type="button" className="question-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="question-submit-btn" disabled={submitting}>
              {submitting ? 'Saving...' : editMode ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Khai báo component cho modal import Excel
const ImportExcelModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setQuestions([]);
      setError('');
    }
  }, [isOpen]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setError('Only Excel (.xlsx, .xls) files are allowed');
      setQuestions([]);
      return;
    }
    
    setFile(selectedFile);
    setIsLoading(true);
    try {
      const result = await parseQuestionExcel(selectedFile);
      setQuestions(result.questions || []);
      setError('');
    } catch (err) {
      setError('Could not parse the file. Please check the format.');
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || questions.length === 0) {
      setError('Please select a valid file with question data.');
      return;
    }
    setIsLoading(true);
    try {
      await onImport(questions);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to import questions.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="question-modal-overlay">
      <div className="question-modal-content" style={{ maxWidth: 600 }}>
        <div className="question-modal-header">
          <h3>Import Questions from Excel</h3>
          <button className="question-modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="question-form">
          <div className="question-form-group">
            <label htmlFor="excelFile">Select Excel File</label>
            <input
              type="file"
              id="excelFile"
              onChange={handleFileChange}
              accept=".xlsx, .xls"
            />
            <div style={{ marginTop: 8 }}>
              <a href="/templates/par1Question.xlsx" download style={{ color: '#409efd', textDecoration: 'underline', fontSize: 13 }}>
                <i className="fas fa-download"></i> Download Template
              </a>
            </div>
          </div>
          {error && <div className="question-form-error-message" style={{ marginBottom: 12 }}>{error}</div>}
          {questions.length > 0 && (
            <div className="question-form-group">
              <label>Preview ({questions.length} questions found)</label>
              <div className="question-preview-table">
                <table>
                  <thead>
                    <tr>
                      <th>Content</th>
                      <th>Correct Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.slice(0, 5).map((q, index) => (
                      <tr key={index}>
                        <td>{q.content.substring(0, 50)}...</td>
                        <td>{q.correctAnswer}</td>
                      </tr>
                    ))}
                    {questions.length > 5 && (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center' }}>
                          ... and {questions.length - 5} more questions
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button type="button" className="question-cancel-btn" onClick={onClose} disabled={isLoading}>Cancel</button>
            <button type="submit" className="question-submit-btn" disabled={isLoading || questions.length === 0}>
              {isLoading ? <><i className="fas fa-spinner fa-spin"></i> Importing...</> : 'Import Questions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete confirmation modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemToDelete, selectedItems }) => {
  if (!isOpen) return null;

  const isMultiDelete = !itemToDelete;
  const message = isMultiDelete 
    ? `Are you sure you want to delete ${selectedItems.length} selected questions?`
    : `Are you sure you want to delete this question?`;

  return (
    <div className="question-modal-overlay">
      <div className="question-modal-content">
        <div className="question-modal-header">
          <h2>Confirm Delete</h2>
          <button className="question-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="question-modal-body">
          <p>{message}</p>
        </div>
        <div className="question-modal-footer">
          <button className="question-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="question-confirm-delete-btn" onClick={onConfirm}>
            <i className="fas fa-trash"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageQuestions = () => {
  const navigate = useNavigate();
  const [questionList, setQuestionList] = useState([]);
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
  
  // State để theo dõi câu hỏi đang hiển thị chi tiết
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  // Add states for import Excel
  const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importedQuestions, setImportedQuestions] = useState([]);
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Add state for alerts
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch all questions
  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      
      const data = await questionService.getAllQuestions();
      setQuestionList(data || []);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching question data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Add entries options
  const entriesOptions = [5, 10, 25, 50, 100];

  const handleEntriesChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  // Search functionality
  const filteredData = Array.isArray(questionList) ? questionList.filter(item =>
    item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.optionA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.optionB?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.optionC?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.optionD?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

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

  // Add a function to handle edit button click
  const handleEditClick = (item) => {
    setCurrentQuestion(item);
    setEditMode(true);
    setIsFormModalOpen(true);
  };

  // Add a function to handle add new question
  const handleAddQuestion = () => {
    setCurrentQuestion(null);
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

  // Handle question submission (both add and edit)
  const handleQuestionSubmit = async (questionData) => {
    try {
      if (editMode) {
 
        // Update existing question using currentQuestion.id
        const updatedItem = await questionService.updateQuestion(currentQuestion.id, questionData);
        
        // Update local state
        setQuestionList(prevList => 
          prevList.map(item => item.id === updatedItem.id ? updatedItem : item)
        );
        setIsFormModalOpen(false);
        displaySuccessMessage('Question updated successfully');
      } else {
        // Add new question
        const newItem = await questionService.createQuestion(questionData);
        
        // Update local state
        setQuestionList(prevList => [...prevList, newItem]);
        
        displaySuccessMessage('New question added successfully');
        setIsFormModalOpen(false);
        await fetchQuestions();
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} question:`, error);
      
      // Display error alert instead of using alert()
      displayErrorMessage(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'add'} question. Please try again.`);
    }
  };

  // Add handleImportQuestions function
  const handleImportQuestions = async (questions) => {
    setIsImporting(true);
    try {
      // Import each question
      for (const question of questions) {
        await questionService.createQuestion(question);
      }
      
      // Refresh question list
      await fetchQuestions();
      
      displaySuccessMessage(`Successfully imported ${questions.length} questions`);
      setIsImportExcelModalOpen(false);
    } catch (error) {
      console.error('Error importing questions:', error);
      displayErrorMessage(error.response?.data?.message || 'Failed to import questions');
    } finally {
      setIsImporting(false);
    }
  };

  // Update the Delete confirmation handler to use alerts
  const handleDeleteConfirm = async () => {
    try {
      if (itemToDelete) {
        // Delete single item
        await questionService.deleteQuestion(itemToDelete.id);
        displaySuccessMessage('Question deleted successfully');
      } else {
        // Delete multiple items
        console.log("selectedItems: ", selectedItems);
        for (const item of selectedItems) {
          await questionService.deleteQuestion(item);
        }
        displaySuccessMessage(`${selectedItems.length} questions deleted successfully`);
      }
      
      // Refresh the question list
      await fetchQuestions();
      
      // Reset selection
      setSelectedItems([]);
    } catch (error) {
      console.error("Error deleting question:", error);
      displayErrorMessage(error.response?.data?.message || "Failed to delete questions. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // Toggle detail view for a question
  const toggleQuestionDetail = (id) => {
    if (expandedQuestionId === id) {
      setExpandedQuestionId(null);
    } else {
      setExpandedQuestionId(id);
    }
  };

  // Handle loading and error states
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="question-container">
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
      
      <div className="question-topic-header">
        <h1 className="question-header-title">
          Manage Questions
        </h1>
      </div>
      
      <div className="pagination">
        <div className="question-entries-select">
          <p>Show </p>
          <select 
            value={itemsPerPage} 
            onChange={handleEntriesChange}
            className="question-entries-dropdown"
          >
            {entriesOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p>entries </p>
        </div>

        <div className="question-action-section">
          <div className="question-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search..."
              className="question-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
                
          <button className="question-add-btn" onClick={handleAddQuestion}>
            <i className="fas fa-plus"></i>
            Add New
          </button>
          <button 
            className="question-import-excel-btn"
            onClick={() => setIsImportExcelModalOpen(true)}
          >
            <i className="fas fa-file-excel"></i> Import Excel
          </button>
        </div>
      </div>
        
      <table className="question-table">
        <thead>
          <tr>
            <th className="question-id-column">
              <div className="question-id-header">
                <input
                  type="checkbox"
                  className="question-admin-checkbox"
                  onChange={handleSelectAll}
                  checked={selectedItems.length === sortedData.length && sortedData.length > 0}
                  onClick={handleCheckboxClick}
                />
                <span onClick={() => handleSort('id')} className="question-sortable">
                  ID
                  <i className={`fas ${sortField === 'id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                </span>
              </div>
            </th>
            <th onClick={() => handleSort('content')} className="question-content-column">
              <span className="question-sortable">
                Question Content
                <i className={`fas ${sortField === 'content' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </span>
            </th>
            <th onClick={() => handleSort('correctAnswer')} className="question-correct-answer-column">
              <span className="question-sortable">
                Correct Answer
                <i className={`fas ${sortField === 'correctAnswer' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </span>
            </th>
            <th className="question-actions-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <React.Fragment key={item.id}>
                <tr>
                  <td className="question-id-column">
                    <div className="question-id-cell">
                      <input
                        type="checkbox"
                        className="question-admin-checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                      <span className="question-id-number">{item.id}</span>
                    </div>
                  </td>
                  <td className="question-content-column">{item.content}</td>
                  <td className="question-correct-answer-column">
                    <div className="question-correct-answer">
                      {['A', 'B', 'C', 'D'].includes(item.correctAnswer) ? (
                        <span className="option-letter correct">{item.correctAnswer}</span>
                      ) : (
                        <span style={{ color: 'red', fontWeight: 600, fontSize: 20 }}>?</span>
                      )}
                    </div>
                  </td>
                  <td className="question-actions-column">
                    <div className="question-actions-wrapper">
                      <button 
                        className="question-detail-btn"
                        onClick={() => toggleQuestionDetail(item.id)}
                        title={expandedQuestionId === item.id ? "Hide details" : "Show details"}
                      >
                        <i className={`fa-solid ${expandedQuestionId === item.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                      </button>
                      <button 
                        className="question-edit-btn"
                        onClick={() => handleEditClick(item)}
                        title="Edit question"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button 
                        className="question-delete-btn"
                        onClick={() => {
                          setItemToDelete(item);
                          setIsDeleteModalOpen(true);
                        }}
                        title="Delete question"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedQuestionId === item.id && (
                  <tr className="question-detail-row">
                    <td colSpan="4">
                      <div className="question-detail-content">
                        <div className="question-test-format">
                          <div className="question-content-wrapper">
                            {item.resource && item.resource.urlImage && (
                              <div className="question-resource-image-container">
                                <img 
                                  src={item.resource.urlImage} 
                                  alt="Question resource" 
                                  className="question-detail-image" 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/150?text=No+Image";
                                  }}
                                />
                              </div>
                            )}
                            
                            {item.resource && item.resource.urlAudio && (
                              <div className="question-resource-audio-container">
                                <audio 
                                  controls 
                                  className="question-detail-audio"
                                >
                                  <source src={item.resource.urlAudio} type="audio/mpeg" />
                                  Your browser does not support the audio element.
                                </audio>
                              </div>
                            )}
                          
                            <div className="question-content">{item.content}</div>
                          </div>
                          
                          <div className="question-options-list">
                            <div className={`question-option-item ${item.correctAnswer === 'A' ? 'correct-option' : ''}`}>
                              <div className="option-marker">A</div>
                              <div className="option-text">{item.optionA}</div>
                            </div>
                            <div className={`question-option-item ${item.correctAnswer === 'B' ? 'correct-option' : ''}`}>
                              <div className="option-marker">B</div>
                              <div className="option-text">{item.optionB}</div>
                            </div>
                            <div className={`question-option-item ${item.correctAnswer === 'C' ? 'correct-option' : ''}`}>
                              <div className="option-marker">C</div>
                              <div className="option-text">{item.optionC}</div>
                            </div>
                            <div className={`question-option-item ${item.correctAnswer === 'D' ? 'correct-option' : ''}`}>
                              <div className="option-marker">D</div>
                              <div className="option-text">{item.optionD}</div>
                            </div>
                          </div>
                        </div>
                        
                        {item.explainDetail && (
                          <div className="question-explanation-section">
                            <h4><i className="fas fa-info-circle"></i> Explanation</h4>
                            <div dangerouslySetInnerHTML={{ __html: item.explainDetail }} />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="question-empty-table">
                <div className="question-empty-message">
                  <i className="fas fa-question-circle"></i>
                  <p>No questions found</p>
                  <button className="question-add-btn" onClick={handleAddQuestion}>
                    <i className="fas fa-plus"></i> Add Question
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
          <div className="question-pagination-buttons">
            <button 
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="question-page-btn"
            >
              Previous
            </button>
            
            {getPageNumbers(currentPage, totalPages).map((item, index) => (
              item === '...' ? (
                <span key={`dots-${index}`} className="question-page-dots">...</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`question-page-btn ${currentPage === item ? 'active' : ''}`}
                >
                  {item}
                </button>
              )
            ))}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="question-page-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="question-table-action-bar">
          <div className="question-action-bar-content">
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

      <QuestionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setCurrentQuestion(null);
          setEditMode(false);
        }}
        onSubmit={handleQuestionSubmit}
        questionItem={currentQuestion}
        editMode={editMode}
      />
      
      <ImportExcelModal
        isOpen={isImportExcelModalOpen}
        onClose={() => setIsImportExcelModalOpen(false)}
        onImport={handleImportQuestions}
      />
    </div>
  );
};

export default ManageQuestions; 