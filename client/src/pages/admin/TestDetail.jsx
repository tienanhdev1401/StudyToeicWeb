import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/TestDetail.css';
import testService from '../../services/admin/admin.testService';
import questionService from '../../services/admin/admin.questionService';
import SuccessAlert from '../../components/SuccessAlert';
import ErrorAlert from '../../components/ErrorAlert';
import { Editor } from '@tinymce/tinymce-react';
import { parseQuestionExcel, isValidExcelFile } from '../../utils/excelUtils';

// TOEIC part limits and question number ranges
const TOEIC_PART_LIMITS = {
  1: { start: 1, end: 6, maxQuestions: 6 },
  2: { start: 7, end: 32, maxQuestions: 25 },
  3: { start: 32, end: 69, maxQuestions: 37 },
  4: { start: 70, end: 100, maxQuestions: 30 },
  5: { start: 101, end: 130, maxQuestions: 30 },
  6: { start: 131, end: 146, maxQuestions: 16 },
  7: { start: 147, end: 200, maxQuestions: 54 }
};

const TestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePart, setActivePart] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isBatchQuestionModalOpen, setIsBatchQuestionModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    content: '',
    explainDetail: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explain_resource: '',
    audioUrl: '',
    imageUrl: '',
  });
  const [batchQuestions, setBatchQuestions] = useState([
    {
      content: '',
      explainDetail: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
    }
  ]);
  const [sharedResource, setSharedResource] = useState({
    explainResource: '',
    audioUrl: '',
    imageUrl: '',
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Add state for alerts
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [explainDetailPreview, setExplainDetailPreview] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionIdToDelete, setQuestionIdToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);

  const displaySuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessAlert(true);
    
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 3000);
  };
  
  const displayErrorMessage = (message) => {
    setErrorMessage(message);
    setShowErrorAlert(true);
    
    setTimeout(() => {
      setShowErrorAlert(false);
    }, 5000);
  };

  // Fetch test details
  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        setLoading(true);
        const response = await testService.getTestById(id);
        console.log("Test data:", response);
        
        const testData = response.data || response;
        
        setTest(testData);
        if (testData && testData.parts && testData.parts.length > 0) {
          setActivePart(testData.parts[0]);
        }
      } catch (err) {
        console.error("Error loading test:", err);
        setError(err.message || 'Failed to load test details');
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [id]);

  // Fetch questions when active part changes
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!activePart || !activePart.id) return;
      
      try {
        setQuestionLoading(true);
        console.log(`Fetching questions for part ID: ${activePart.id}`);
        const questionsData = await questionService.getQuestionsByPartId(activePart.id);
        console.log(`Questions data:`, questionsData);
        setQuestions(Array.isArray(questionsData) ? questionsData : []);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setQuestions([]);
      } finally {
        setQuestionLoading(false);
      }
    };

    fetchQuestions();
  }, [activePart]);

  const handlePartClick = (part) => {
    if (part && part.id) {
      setActivePart(part);
    } else {
      console.warn("Attempted to set invalid part as active:", part);
    }
  };

  // Format explainDetail to HTML for preview and saving
  function formatExplainDetailToHtml(text) {
    if (!text) return '';
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) return '';

    // Dòng đầu là câu hỏi
    const question = lines[0];
    // Các dòng sau là đáp án
    const options = lines.slice(1).map(line => {
      // Đáp án đúng có &larr; hoặc Đáp án đúng
      if (line.includes('&larr;') || line.toLowerCase().includes('correct answer')) {
        return `<li><span style="color: green; font-weight: bold;">${line}</span></li>`;
      }
      return `<li>${line}</li>`;
    });

    return `<p><strong>${question}</strong></p>\n<ul>\n${options.join('\n')}\n</ul>`;
  }

  // Update preview when explainDetail changes
  const handleExplainDetailChange = (e) => {
    const value = e.target.value;
    setNewQuestion(prev => ({ ...prev, explainDetail: value }));
    setExplainDetailPreview(formatExplainDetailToHtml(value));
  };

  const openQuestionModal = () => {
    setEditingQuestionId(null);
    setNewQuestion({
      content: '',
      explainDetail: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explain_resource: '',
      audioUrl: '',
      imageUrl: '',
    });
    setExplainDetailPreview('');
    setSubmitError(null);
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (question) => {
    setEditingQuestionId(question.id);
    setNewQuestion({
      content: question.content || '',
      explainDetail: question.explainDetail || '',
      optionA: question.optionA || '',
      optionB: question.optionB || '',
      optionC: question.optionC || '',
      optionD: question.optionD || '',
      correctAnswer: question.correctAnswer || 'A',
      explainResource: question.resource?.explain_resource || '',
      audioUrl: question.resource?.urlAudio || '',
      imageUrl: question.resource?.urlImage || '',
      questionNumber: question.questionNumber
    });
    setExplainDetailPreview(formatExplainDetailToHtml(question.explainDetail || ''));
    setSubmitError(null);
    setIsQuestionModalOpen(true);
  };

  const closeQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setEditingQuestionId(null);
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const getNextQuestionNumber = (partNumber) => {
    const partLimit = TOEIC_PART_LIMITS[partNumber];
    if (!partLimit) return 1;

    // Find all question numbers in the current part
    const partQuestions = questions.filter(q => {
      const qNumber = q.questionNumber || 0;
      return qNumber >= partLimit.start && qNumber <= partLimit.end;
    });

    if (partQuestions.length === 0) {
      return partLimit.start;
    }

    // Get all used question numbers
    const usedNumbers = partQuestions.map(q => q.questionNumber || 0);
    
    // Find all available numbers (gaps) in the valid range
    const availableNumbers = [];
    for (let i = partLimit.start; i <= partLimit.end; i++) {
      if (!usedNumbers.includes(i)) {
        availableNumbers.push(i);
      }
    }
    
    // If there are available numbers, return the lowest one
    if (availableNumbers.length > 0) {
      return Math.min(...availableNumbers);
    }

    // If no gaps found, return the next number after the highest
    const maxNumber = Math.max(...usedNumbers);
    return maxNumber + 1;
  };

  const validateQuestionNumber = (partNumber, questionNumber) => {
    const partLimit = TOEIC_PART_LIMITS[partNumber];
    if (!partLimit) return false;

    return questionNumber >= partLimit.start && questionNumber <= partLimit.end;
  };

  const validatePartQuestionCount = (partNumber) => {
    const partLimit = TOEIC_PART_LIMITS[partNumber];
    if (!partLimit) return false;

    const partQuestions = questions.filter(q => {
      const qNumber = q.questionNumber || 0;
      return qNumber >= partLimit.start && qNumber <= partLimit.end;
    });

    return partQuestions.length < partLimit.maxQuestions;
  };

  // Add this new function before handleQuestionSubmit
  const formatExplainDetail = (question) => {
    const { content, optionA, optionB, optionC, optionD, correctAnswer } = question;
    
    // Format the question content
    const formattedContent = `<p><strong>${content}</strong></p>`;
    
    // Format options with correct answer highlighted
    const options = [
      { letter: 'A', text: optionA },
      { letter: 'B', text: optionB },
      { letter: 'C', text: optionC },
      { letter: 'D', text: optionD }
    ];
    
    const formattedOptions = options.map(option => {
      const isCorrect = option.letter === correctAnswer;
      if (isCorrect) {
        return `<li><span style="color: green; font-weight: bold;">(${option.letter}) ${option.text} &larr; Correct Answer</span></li>`;
      }
      return `<li>(${option.letter}) ${option.text}</li>`;
    }).join('\n');
    
    // Combine content and options with HTML formatting
    return `${formattedContent}\n<ul>\n${formattedOptions}\n</ul>`;
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!activePart || !activePart.id) {
      setSubmitError('No active part selected');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      // Only validate question count when creating new question
      if (!editingQuestionId && !validatePartQuestionCount(activePart.partNumber)) {
        setSubmitError(`Part ${activePart.partNumber} has reached its maximum question limit of ${TOEIC_PART_LIMITS[activePart.partNumber].maxQuestions} questions`);
        return;
      }

      // Get next question number for the part
      const nextQuestionNumber = getNextQuestionNumber(activePart.partNumber);
      
      if (editingQuestionId) {
        // Update existing question
        const questionData = {
          content: newQuestion.content,
          optionA: newQuestion.optionA,
          optionB: newQuestion.optionB,
          optionC: newQuestion.optionC,
          optionD: newQuestion.optionD,
          correctAnswer: newQuestion.correctAnswer,
          explainDetail: formatExplainDetailToHtml(newQuestion.explainDetail),
          resourceData: {
            explainResource: newQuestion.explain_resource,
            audioUrl: newQuestion.audioUrl,
            imageUrl: newQuestion.imageUrl
          },
          questionNumber: newQuestion.questionNumber
        };

        // Validate question number for update
        if (!validateQuestionNumber(activePart.partNumber, questionData.questionNumber)) {
          setSubmitError(`Question number must be between ${TOEIC_PART_LIMITS[activePart.partNumber].start} and ${TOEIC_PART_LIMITS[activePart.partNumber].end} for Part ${activePart.partNumber}`);
          return;
        }

        await questionService.updateQuestionByPartId(
          activePart.id,
          editingQuestionId,
          questionData
        );
      } else {
        // Create new question
        const questionData = {
          content: newQuestion.content,
          optionA: newQuestion.optionA,
          optionB: newQuestion.optionB,
          optionC: newQuestion.optionC,
          optionD: newQuestion.optionD,
          correctAnswer: newQuestion.correctAnswer,
          explainDetail: formatExplainDetailToHtml(newQuestion.explainDetail),
          resourceData: {
            explainResource: newQuestion.explain_resource,
            audioUrl: newQuestion.audioUrl,
            imageUrl: newQuestion.imageUrl
          },
          questionNumber: nextQuestionNumber
        };

        // Create the question
        await questionService.createQuestionByPartId(id, activePart.id, questionData);
      }
      
      // Refresh the questions list
      const updatedQuestions = await questionService.getQuestionsByPartId(activePart.id);
      setQuestions(Array.isArray(updatedQuestions) ? updatedQuestions : []);
      
      // Display success message BEFORE closing the modal
      displaySuccessMessage(editingQuestionId ? 'Question updated successfully' : 'Question added successfully');
      
      // Close the modal after a short delay to ensure the alert is visible
      setTimeout(() => {
        closeQuestionModal();
      }, 500);
    } catch (err) {
      console.error(`Error ${editingQuestionId ? 'updating' : 'creating'} question:`, err);
      setSubmitError(err.message || `Failed to ${editingQuestionId ? 'update' : 'create'} question`);
      
      // Display error message
      displayErrorMessage('Failed to save question');
    } finally {
      setSubmitting(false);
    }
  };

  // Function to open the delete modal
  const openDeleteModal = (questionId) => {
    setQuestionIdToDelete(questionId);
    setShowDeleteModal(true);
  };

  // Function to close the delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setQuestionIdToDelete(null);
  };

  // Update handleDeleteQuestion to use modal
  const handleDeleteQuestion = async () => {
    if (!activePart || !activePart.id || !questionIdToDelete) {
      closeDeleteModal();
      return;
    }
    try {
      await questionService.deleteQuestionByPartId(activePart.id, questionIdToDelete);
      // Refresh the questions list
      const updatedQuestions = await questionService.getQuestionsByPartId(activePart.id);
      setQuestions(Array.isArray(updatedQuestions) ? updatedQuestions : []);
      // Display success message
      displaySuccessMessage('Question deleted successfully');
    } catch (err) {
      console.error('Error deleting question:', err);
      alert(`Failed to delete question: ${err.message || 'Unknown error'}`);
      // Display error message
      displayErrorMessage('Failed to delete question');
    } finally {
      closeDeleteModal();
    }
  };

  const openBatchQuestionModal = () => {
    setBatchQuestions([
      {
        content: '',
        explainDetail: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
      }
    ]);
    setSharedResource({
      explainResource: '',
      audioUrl: '',
      imageUrl: '',
    });
    setSubmitError(null);
    setIsBatchQuestionModalOpen(true);
  };

  const closeBatchQuestionModal = () => {
    setIsBatchQuestionModalOpen(false);
  };

  const handleBatchQuestionChange = (index, field, value) => {
    const updatedQuestions = [...batchQuestions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setBatchQuestions(updatedQuestions);
  };

  const handleSharedResourceChange = (e) => {
    const { name, value } = e.target;
    setSharedResource(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addQuestionToBatch = () => {
    setBatchQuestions([
      ...batchQuestions,
      {
        content: '',
        explainDetail: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
      }
    ]);
  };

  const removeQuestionFromBatch = (index) => {
    if (batchQuestions.length > 1) {
      const updatedQuestions = [...batchQuestions];
      updatedQuestions.splice(index, 1);
      setBatchQuestions(updatedQuestions);
    }
  };

  const handleBatchQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!activePart || !activePart.id) {
      setSubmitError('No active part selected');
      return;
    }

    // Validate all questions in batch
    const hasEmptyFields = batchQuestions.some(q => 
      !q.content || !q.optionA || !q.optionB || !q.optionC || !q.optionD
    );

    if (hasEmptyFields) {
      setSubmitError('All questions must have content and options filled');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      // Validate part question count for batch
      const partLimit = TOEIC_PART_LIMITS[activePart.partNumber];
      const currentQuestionCount = questions.filter(q => {
        const qNumber = q.questionNumber || 0;
        return qNumber >= partLimit.start && qNumber <= partLimit.end;
      }).length;

      if (currentQuestionCount + batchQuestions.length > partLimit.maxQuestions) {
        setSubmitError(`Cannot add ${batchQuestions.length} questions. Part ${activePart.partNumber} can only have ${partLimit.maxQuestions} questions total.`);
        return;
      }
      
      // Create shared resource first if any resource data is provided
      let resourceId = null;
      if (sharedResource.explainResource || sharedResource.audioUrl || sharedResource.imageUrl) {
        const resourceResponse = await questionService.createResource({
          explainResource: sharedResource.explainResource,
          audioUrl: sharedResource.audioUrl,
          imageUrl: sharedResource.imageUrl
        });
        console.log("resourceResponse: ", resourceResponse);
        resourceId = resourceResponse.data;
        console.log("resourceId: ", resourceId);
      }
      
      // Find all available question numbers in the range
      const partQuestions = questions.filter(q => {
        const qNumber = q.questionNumber || 0;
        return qNumber >= partLimit.start && qNumber <= partLimit.end;
      });
      
      const usedNumbers = partQuestions.map(q => q.questionNumber || 0);
      const availableNumbers = [];
      
      for (let i = partLimit.start; i <= partLimit.end; i++) {
        if (!usedNumbers.includes(i)) {
          availableNumbers.push(i);
        }
      }
      
      // Create all questions with shared resource
      for (let i = 0; i < batchQuestions.length; i++) {
        const q = batchQuestions[i];
        // Use available numbers if possible, otherwise use sequential numbers after the max
        let questionNumber;
        
        if (i < availableNumbers.length) {
          questionNumber = availableNumbers[i];
        } else {
          const maxNumber = Math.max(...usedNumbers, ...availableNumbers.slice(0, i));
          questionNumber = maxNumber + 1;
        }

        if (!validateQuestionNumber(activePart.partNumber, questionNumber)) {
          setSubmitError(`Question number ${questionNumber} is outside the valid range for Part ${activePart.partNumber}`);
          return;
        }

        const questionData = {
          content: q.content,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          explainDetail: formatExplainDetailToHtml(q.explainDetail),
          resourceData: resourceId ? {
            resourceId: resourceId
          } : null,
          questionNumber: questionNumber
        };
        
        await questionService.createQuestionByPartId(id, activePart.id, questionData);
      }
      
      const updatedQuestions = await questionService.getQuestionsByPartId(activePart.id);
      setQuestions(Array.isArray(updatedQuestions) ? updatedQuestions : []);
      
      displaySuccessMessage(`${batchQuestions.length} questions added successfully`);
      
      setTimeout(() => {
        closeBatchQuestionModal();
      }, 500);
    } catch (err) {
      console.error('Error creating batch questions:', err);
      setSubmitError(err.message || 'Failed to create questions');
      
      displayErrorMessage('Failed to save batch questions');
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm tạo mảng số trang với dấu ... 
  const getPageNumbers = (currentPage, totalPages) => {
    const delta = 1; // Số trang hiển thị ở hai bên trang hiện tại
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

  // Modal import excel cho câu hỏi
  const ImportExcelModal = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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
      if (!isValidExcelFile(selectedFile)) {
        setError('Only Excel (.xlsx, .xls) or CSV (.csv) files are allowed');
        setQuestions([]);
        return;
      }
      setFile(selectedFile);
      setIsLoading(true);
      try {
        const result = await parseQuestionExcel(selectedFile);
        console.log(result);
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
      <div className="test-detail-modal-overlay">
        <div className="test-detail-modal-content" style={{ maxWidth: 600 }}>
          <div className="test-detail-modal-header">
            <h3>Import Questions from Excel</h3>
            <button className="test-detail-modal-close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="test-detail-question-form">
            <div className="test-detail-form-group">
              <label htmlFor="excelFile">Select Excel File</label>
              <input
                type="file"
                id="excelFile"
                onChange={handleFileChange}
                accept=".xlsx, .xls, .csv"
              />
              <div style={{ marginTop: 8 }}>
                <a href="/templates/part1Question.xlsx" download style={{ color: '#409efd', textDecoration: 'underline', fontSize: 13 }}>
                  <i className="fas fa-download"></i> Download Template
                </a>
              </div>
            </div>
            {error && <div className="test-detail-form-error-message" style={{ marginBottom: 12 }}>{error}</div>}
            {questions.length > 0 && (
              <div style={{ margin: '12px 0' }}>
                <b>Preview ({questions.length} questions):</b>
                <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Content</th>
                        <th>A</th>
                        <th>B</th>
                        <th>C</th>
                        <th>D</th>
                        <th>Correct</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.slice(0, 5).map((q, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{q.content}</td>
                          <td>{q.optionA}</td>
                          <td>{q.optionB}</td>
                          <td>{q.optionC}</td>
                          <td>{q.optionD}</td>
                          <td>{q.correctAnswer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {questions.length > 5 && <div style={{ color: '#888', fontStyle: 'italic', marginTop: 4 }}>...and {questions.length - 5} more</div>}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button type="button" className="test-detail-cancel-btn" onClick={onClose} disabled={isLoading}>Cancel</button>
              <button type="submit" className="test-detail-submit-btn" disabled={isLoading || questions.length === 0}>
                {isLoading ? <><i className="fas fa-spinner fa-spin"></i> Importing...</> : 'Import Questions'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Hàm xử lý import câu hỏi từ excel cho part hiện tại (có validate số lượng tối đa)
  const handleImportQuestions = async (importedQuestions) => {
    if (!activePart || !activePart.id) return;
    const partLimit = TOEIC_PART_LIMITS[activePart.partNumber];
    if (!partLimit) return;
    const currentCount = questions.length;
    const maxAllowed = partLimit.maxQuestions;
    if (currentCount >= maxAllowed) {
      displayErrorMessage(`Part ${activePart.partNumber} has reached the maximum number of questions (${maxAllowed}). Cannot import more.`);
      return;
    }
    // Chỉ lấy số lượng câu hỏi vừa đủ
    const canImport = Math.min(importedQuestions.length, maxAllowed - currentCount);
    if (canImport <= 0) {
      displayErrorMessage(`No space left to import new questions for this part.`);
      return;
    }
    const questionsToImport = importedQuestions.slice(0, canImport);
    if (questionsToImport.length < importedQuestions.length) {
      displayErrorMessage(`Can only import ${questionsToImport.length} questions, as this part only has ${maxAllowed - currentCount} available slots.`);
    }

    // Tìm tất cả các số câu hỏi đã được sử dụng
    const partQuestions = questions.filter(q => {
      const qNumber = q.questionNumber || 0;
      return qNumber >= partLimit.start && qNumber <= partLimit.end;
    });
    
    const usedNumbers = partQuestions.map(q => q.questionNumber || 0);
    const availableNumbers = [];
    
    for (let i = partLimit.start; i <= partLimit.end; i++) {
      if (!usedNumbers.includes(i)) {
        availableNumbers.push(i);
      }
    }
    
    // Thêm question number cho các câu hỏi được import
    for (let i = 0; i < questionsToImport.length; i++) {
      // Sử dụng các số câu hỏi có sẵn hoặc số tiếp theo nếu không đủ
      let questionNumber;
      
      if (i < availableNumbers.length) {
        questionNumber = availableNumbers[i];
      } else {
        const maxNumber = Math.max(...usedNumbers, ...availableNumbers.slice(0, i));
        questionNumber = maxNumber + 1;
      }
      
      // Kiểm tra nếu số câu hỏi vượt quá giới hạn cho phép
      if (questionNumber > partLimit.end) {
        displayErrorMessage(`Can only import ${i} questions, as question numbers would exceed the allowed limit for Part ${activePart.partNumber}`);
        // Only import questions that don't exceed the limit
        questionsToImport.splice(i);
        break;
      }
      
      // Thêm thuộc tính questionNumber vào đối tượng câu hỏi
      questionsToImport[i] = {
        ...questionsToImport[i],
        questionNumber: questionNumber,
        explainDetail: formatExplainDetailToHtml(questionsToImport[i].explainDetail || '')
      };
      console.log(questionsToImport[i]);
    }
    
    for (const question of questionsToImport) {
      console.log(question);
      await questionService.createQuestionByPartId(id, activePart.id, question);
    }
    
    const updatedQuestions = await questionService.getQuestionsByPartId(activePart.id);
    setQuestions(Array.isArray(updatedQuestions) ? updatedQuestions : []);
    displaySuccessMessage(`Successfully imported  ${questionsToImport.length} questions!`);
  };

  if (loading) {
    return <div className="test-detail-loading">Loading test details...</div>;
  }

  if (error) {
    return <div className="test-detail-error">Error: {error}</div>;
  }

  if (!test) {
    return <div className="test-detail-not-found">Test not found</div>;
  }

  return (
    <div className="test-detail-container">
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

      <div className="test-detail-header">
        <button 
          className="test-detail-back-btn" 
          onClick={() => navigate('/admin/test')}
        >
          <i className="fas fa-arrow-left"></i> Back to Tests
        </button>
        <h1>{test.title}</h1>
        <div className="test-detail-meta">
          <span><i className="fas fa-layer-group"></i> Collection: {test.testCollection}</span>
          <span><i className="fas fa-clock"></i> Duration: {test.duration}</span>
        </div>
      </div>

      <div className="test-detail-parts-container">
        <div className="test-detail-parts-header">
          <h2>Test Parts</h2>
        
        </div>

        <div className="test-detail-parts">
          {test.parts && test.parts.length > 0 ? (
            test.parts.map((part) => (
              part && part.id ? (
                <div 
                  key={part.id} 
                  className={`test-detail-part-card ${activePart && activePart.id === part.id ? 'active' : ''}`}
                  onClick={() => handlePartClick(part)}
                >
                  <div className="test-detail-part-number">Part {part.partNumber}</div>
                  <div className="test-detail-part-info">
                    <h3>{part.title || `Part ${part.partNumber}`}</h3>
                    <span className="test-detail-question-count">
                      {part.questions?.length || 0} Questions
                    </span>
                  </div>
                </div>
              ) : null
            ))
          ) : (
            <div className="test-detail-no-parts">
              <i className="fas fa-exclamation-circle"></i>
              <p>No parts available for this test</p>
              <button 
                className="test-detail-add-first-part-btn"
                onClick={() => navigate(`/admin/test/${id}/parts/new`)}
              >
                <i className="fas fa-plus"></i> Add First Part
              </button>
            </div>
          )
          }
        </div>
      </div>

      {activePart && (
        <div className="test-detail-questions-container">
          <div className="test-detail-questions-header">
            <h2>PART {activePart.partNumber}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label htmlFor="entriesSelect" style={{ fontSize: 14, marginTop: 4, color: '#a19d9b' }}>Show</label>
              <select
                id="entriesSelect"
                value={itemsPerPage}
                onChange={e => setItemsPerPage(Number(e.target.value))}
                className="test-detail-items-per-page-select"
                style={{ minWidth: 70 }}
              >
                {[5, 10, 20, 50, 100].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <label htmlFor="entriesSelect" style={{ fontSize: 14,  marginTop: 4, color: '#a19d9b' }}>entries</label>

            </div>
            <div className="test-detail-questions-action">
              <button 
                className="test-detail-add-question-btn"
                onClick={openQuestionModal}
              >
                <i className="fas fa-plus"></i> Add Question
              </button>
              <button 
                className="test-detail-add-batch-btn"
                onClick={openBatchQuestionModal}
              >
                <i className="fas fa-layer-group"></i> Add Group Questions
              </button>
              <button
                className="test-detail-import-excel-btn"
                onClick={() => setIsImportExcelModalOpen(true)}
              >
                <i className="fas fa-file-excel"></i> Import Excel
              </button>
            </div>
          </div>
          
         

          {questionLoading ? (
            <div className="test-detail-questions-loading">Loading questions...</div>
          ) : (
            <div className="test-detail-questions">
              {questions && questions.length > 0 ? (
                questions
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((question, index) => (
                    question && question.id ? (
                      <div key={question.id} className="test-detail-question-card">
                        <div className="test-detail-question-number">Question {question.questionNumber || index + 1}</div>
                        <div className="test-detail-question-content">
                          {question.resource && question.resource.audioUrl && (
                            <div className="test-detail-question-audio">
                              <audio controls>
                                <source src={question.resource.audioUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          )}
                          
                          {question.resource && question.resource.imageUrl && (
                            <div className="test-detail-question-image">
                              <img src={question.resource.imageUrl} alt={`Question ${question.questionNumber || index + 1}`} />
                            </div>
                          )}
                          
                          <div className="test-detail-question-text">
                            <p>{question.content || 'No content available'}</p>
                          </div>
                          
                          <div className="test-detail-options">
                            {question.optionA && (
                              <div className={`test-detail-option ${question.correctAnswer === 'A' ? 'correct' : ''}`}>
                                <span className="test-detail-option-letter">A</span>
                                <span className="test-detail-option-text">{question.optionA}</span>
                              </div>
                            )}
                            {question.optionB && (
                              <div className={`test-detail-option ${question.correctAnswer === 'B' ? 'correct' : ''}`}>
                                <span className="test-detail-option-letter">B</span>
                                <span className="test-detail-option-text">{question.optionB}</span>
                              </div>
                            )}
                            {question.optionC && (
                              <div className={`test-detail-option ${question.correctAnswer === 'C' ? 'correct' : ''}`}>
                                <span className="test-detail-option-letter">C</span>
                                <span className="test-detail-option-text">{question.optionC}</span>
                              </div>
                            )}
                            {question.optionD && (
                              <div className={`test-detail-option ${question.correctAnswer === 'D' ? 'correct' : ''}`}>
                                <span className="test-detail-option-letter">D</span>
                                <span className="test-detail-option-text">{question.optionD}</span>
                              </div>
                            )}
                          </div>

                          {question.explainDetail && (
                            <div className="test-detail-question-explanation">
                              <h4>Explanation of the answer:</h4>
                              <div dangerouslySetInnerHTML={{ __html: question.explainDetail }} />
                            </div>
                          )}
                        </div>
                        
                        {question.resource && question.resource.explain_resource && (
                          <div className="test-detail-question-text">
                            <div className="test-detail-question-paragraph">
                            <p>Translation and explanation:</p>
                            <p dangerouslySetInnerHTML={{ __html: question.resource.explain_resource }} />
                          </div>
                          </div>
                          
                        )}
                          
                          
                          <div className="test-detail-question-actions">
                            <button 
                              className="test-detail-edit-question-btn"
                              onClick={() => openEditQuestionModal(question)}
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button 
                              className="test-detail-delete-question-btn"
                              onClick={() => openDeleteModal(question.id)}
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          </div>
                      </div>
                    ) : null
                  ))
              ) : (
                <div className="test-detail-no-questions">
                  <i className="fas fa-question-circle"></i>
                  <p>No questions available for this part</p>
                  <button 
                    className="test-detail-add-first-question-btn"
                    onClick={openQuestionModal}
                  >
                    <i className="fas fa-plus"></i> Add First Question
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Pagination controls */}
          {questions.length > 0 && (
            <div className="test-detail-pagination-flex">
              <span className="test-detail-pagination-info">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, questions.length)} of {questions.length} entries
              </span>
              <div className="test-detail-pagination-buttons">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="test-detail-page-btn"
                >
                  Previous
                </button>
                {getPageNumbers(currentPage, Math.ceil(questions.length / itemsPerPage)).map((item, idx) => (
                  item === '...'
                    ? <span key={`dots-${idx}`} className="test-detail-page-dots">...</span>
                    : <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`test-detail-page-btn${currentPage === item ? ' active' : ''}`}
                      >
                        {item}
                      </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === Math.ceil(questions.length / itemsPerPage)}
                  className="test-detail-page-btn"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Question Modal */}
      {isQuestionModalOpen && (
        <div className="test-detail-modal-overlay">
          <div className="test-detail-modal-content">
            <div className="test-detail-modal-header">
              <h3>{editingQuestionId ? 'Edit Question' : 'Add New Question'} - Part {activePart?.partNumber}</h3>
              <button className="test-detail-modal-close-btn" onClick={closeQuestionModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleQuestionSubmit} className="test-detail-question-form">
              {submitError && (
                <div className="test-detail-form-error-message">
                  <i className="fas fa-exclamation-circle"></i> {submitError}
                </div>
              )}
              
              <div className="test-detail-form-group">
                <label htmlFor="content">Question Content:</label>
                <textarea
                  id="content"
                  name="content"
                  value={newQuestion.content}
                  onChange={handleQuestionChange}
                  rows={4}
                  placeholder="Enter the question text here..."
                />
              </div>
              
              <div className="test-detail-form-group">
                <label htmlFor="explainDetail">Explanation:</label>
                <Editor
                  apiKey="1w6cv14vn9vxpte2rrukp3g2j77lllo2ths7s5j3qad698cx"
                  value={newQuestion.explainDetail}
                  onEditorChange={value => setNewQuestion(prev => ({ ...prev, explainDetail: value }))}
                  init={{
                    height: 120,
                    menubar: false,
                    plugins: 'lists link',
                    toolbar: 'undo redo | bold italic underline | forecolor | bullist numlist | removeformat',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                  }}
                />
                {newQuestion.explainDetail && (
                  <div style={{ marginTop: '8px', background: '#f6f6f6', padding: '8px', borderRadius: '4px' }}>
                    <b>Preview:</b>
                    <div dangerouslySetInnerHTML={{ __html: newQuestion.explainDetail }} />
                  </div>
                )}
              </div>
              
              <div className="test-detail-form-group">
                <label htmlFor="explainResource">Translation/Explanation Resource:</label>
                <Editor
                  apiKey="1w6cv14vn9vxpte2rrukp3g2j77lllo2ths7s5j3qad698cx"
                  value={newQuestion.explain_resource}
                  onEditorChange={value => setNewQuestion(prev => ({ ...prev, explain_resource: value }))}
                  init={{
                    height: 120,
                    menubar: false,
                    plugins: 'lists link',
                    toolbar: 'undo redo | bold italic underline | forecolor | bullist numlist | removeformat',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                  }}
                />
                {newQuestion.explain_resource && (
                  <div style={{ marginTop: '8px', background: '#f6f6f6', padding: '8px', borderRadius: '4px' }}>
                    <b>Preview:</b>
                    <div dangerouslySetInnerHTML={{ __html: newQuestion.explain_resource }} />
                  </div>
                )}
              </div>
              
              <div className="test-detail-form-group">
                <label htmlFor="optionA">Option A:</label>
                <input
                  type="text"
                  id="optionA"
                  name="optionA"
                  value={newQuestion.optionA}
                  onChange={handleQuestionChange}   
                  placeholder="Enter option A..."
                />
              </div>
              
              <div className="test-detail-form-group">
                <label htmlFor="optionB">Option B:</label>
                <input
                  type="text"
                  id="optionB"
                  name="optionB"
                  value={newQuestion.optionB}
                  onChange={handleQuestionChange}
                  
                  placeholder="Enter option B..."
                />
              </div>
              
              <div className="test-detail-form-group">
                <label htmlFor="optionC">Option C:</label>
                <input
                  type="text"
                  id="optionC"
                  name="optionC"
                  value={newQuestion.optionC}
                  onChange={handleQuestionChange}
                  
                  placeholder="Enter option C..."
                />
              </div>
              
              <div className="test-detail-form-group">
                <label htmlFor="optionD">Option D:</label>
                <input
                  type="text"
                  id="optionD"
                  name="optionD"
                  value={newQuestion.optionD}
                  onChange={handleQuestionChange}
                  
                  placeholder="Enter option D..."
                />
              </div>
              
              <div className="test-detail-form-group">
                <label htmlFor="correctAnswer">Correct Answer:</label>
                <select
                  id="correctAnswer"
                  name="correctAnswer"
                  value={newQuestion.correctAnswer}
                  onChange={handleQuestionChange}
                  required
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              
              <div className="test-detail-form-group">
                <label htmlFor="audioUrl">Audio URL (optional):</label>
                <input
                  type="text"
                  id="audioUrl"
                  name="audioUrl"
                  value={newQuestion.audioUrl}
                  onChange={handleQuestionChange}
                  placeholder="Enter audio URL if applicable..."
                />
                {newQuestion.audioUrl && (
                  <div className="test-detail-preview-container">
                    <audio controls className="test-detail-audio-preview">
                      <source src={newQuestion.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
              
              <div className="test-detail-form-group">
                <label htmlFor="imageUrl">Image URL (optional):</label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={newQuestion.imageUrl}
                  onChange={handleQuestionChange}
                  placeholder="Enter image URL if applicable..."
                />
                {newQuestion.imageUrl && (
                  <div className="test-detail-preview-container">
                    <img 
                      src={newQuestion.imageUrl} 
                      alt="Question image preview" 
                      className="test-detail-image-preview"
                    />
                  </div>
                )}
              </div>
              
              <div className="test-detail-form-actions">
                <button 
                  type="button" 
                  className="test-detail-cancel-btn"
                  onClick={closeQuestionModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="test-detail-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingQuestionId ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Question Modal */}
      {isBatchQuestionModalOpen && (
        <div className="test-detail-modal-overlay">
          <div className="test-detail-modal-content test-detail-batch-modal">
            <div className="test-detail-modal-header">
              <h3>Add Multiple Questions with Shared Resource</h3>
              <button className="test-detail-modal-close-btn" onClick={closeBatchQuestionModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleBatchQuestionSubmit} className="test-detail-question-form">
              {submitError && (
                <div className="test-detail-form-error-message">
                  <i className="fas fa-exclamation-circle"></i> {submitError}
                </div>
              )}
              
              <div className="test-detail-form-info-box">
                <i className="fas fa-info-circle"></i>
                <p>
                  Create multiple questions sharing the same resources. Ideal for Part 3, 4, 6, and 7 
                  where multiple questions reference the same audio, image, or passage.
                </p>
              </div>
              
              <div className="test-detail-shared-resource-section">
                <h4>Shared Resource</h4>
                
                <div className="test-detail-form-group">
                  <label htmlFor="batchAudioUrl">Shared Audio URL (optional):</label>
                  <input
                    type="text"
                    id="batchAudioUrl"
                    name="audioUrl"
                    value={sharedResource.audioUrl}
                    onChange={handleSharedResourceChange}
                    placeholder="Enter shared audio URL..."
                  />
                  {sharedResource.audioUrl && (
                    <div className="test-detail-preview-container">
                      <audio controls className="test-detail-audio-preview">
                        <source src={sharedResource.audioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </div>
                
                <div className="test-detail-form-group">
                  <label htmlFor="batchImageUrl">Shared Image URL (optional):</label>
                  <input
                    type="text"
                    id="batchImageUrl"
                    name="imageUrl"
                    value={sharedResource.imageUrl}
                    onChange={handleSharedResourceChange}
                    placeholder="Enter shared image URL..."
                  />
                  {sharedResource.imageUrl && (
                    <div className="test-detail-preview-container">
                      <img 
                        src={sharedResource.imageUrl} 
                        alt="Shared resource preview" 
                        className="test-detail-image-preview"
                      />
                    </div>
                  )}
                </div>
                
                <div className="test-detail-form-group">
                  <label htmlFor="batchExplainResource">Shared Text/Passage (optional):</label>
                  <Editor
                    apiKey="1w6cv14vn9vxpte2rrukp3g2j77lllo2ths7s5j3qad698cx"
                    value={sharedResource.explainResource}
                    onEditorChange={value => setSharedResource(prev => ({ ...prev, explainResource: value }))}
                    init={{
                      height: 120,
                      menubar: false,
                      plugins: 'lists link',
                      toolbar: 'undo redo | bold italic underline | forecolor | bullist numlist | removeformat',
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                  />
                  {sharedResource.explainResource && (
                    <div style={{ marginTop: '8px', background: '#f6f6f6', padding: '8px', borderRadius: '4px' }}>
                      <b>Preview:</b>
                      <div dangerouslySetInnerHTML={{ __html: sharedResource.explainResource }} />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="test-detail-questions-section">
                <div className="test-detail-questions-header-with-add">
                  <h4>Questions</h4>
                  <button 
                    type="button" 
                    className="test-detail-add-question-to-batch-btn"
                    onClick={addQuestionToBatch}
                  >
                    <i className="fas fa-plus"></i> Add Question
                  </button>
                </div>
                
                {batchQuestions.map((question, index) => (
                  <div key={index} className="test-detail-batch-question">
                    <div className="test-detail-batch-question-header">
                      <h5>Question {index + 1}</h5>
                      {batchQuestions.length > 1 && (
                        <button 
                          type="button"
                          className="test-detail-remove-question-btn"
                          onClick={() => removeQuestionFromBatch(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                    
                    <div className="test-detail-form-group">
                      <label htmlFor={`content-${index}`}>Question Content:</label>
                      <textarea
                        id={`content-${index}`}
                        value={question.content}
                        onChange={(e) => handleBatchQuestionChange(index, 'content', e.target.value)}
                        required
                        rows={3}
                        placeholder="Enter the question text here..."
                      />
                    </div>
                    
                    <div className="test-detail-form-group">
                      <label htmlFor={`optionA-${index}`}>Option A:</label>
                      <input
                        type="text"
                        id={`optionA-${index}`}
                        value={question.optionA}
                        onChange={(e) => handleBatchQuestionChange(index, 'optionA', e.target.value)}
                        required
                        placeholder="Enter option A..."
                      />
                    </div>
                    
                    <div className="test-detail-form-group">
                      <label htmlFor={`optionB-${index}`}>Option B:</label>
                      <input
                        type="text"
                        id={`optionB-${index}`}
                        value={question.optionB}
                        onChange={(e) => handleBatchQuestionChange(index, 'optionB', e.target.value)}
                        required
                        placeholder="Enter option B..."
                      />
                    </div>
                    
                    <div className="test-detail-form-group">
                      <label htmlFor={`optionC-${index}`}>Option C:</label>
                      <input
                        type="text"
                        id={`optionC-${index}`}
                        value={question.optionC}
                        onChange={(e) => handleBatchQuestionChange(index, 'optionC', e.target.value)}
                        required
                        placeholder="Enter option C..."
                      />
                    </div>
                    
                    <div className="test-detail-form-group">
                      <label htmlFor={`optionD-${index}`}>Option D:</label>
                      <input
                        type="text"
                        id={`optionD-${index}`}
                        value={question.optionD}
                        onChange={(e) => handleBatchQuestionChange(index, 'optionD', e.target.value)}
                        required
                        placeholder="Enter option D..."
                      />
                    </div>
                    
                    <div className="test-detail-form-group">
                      <label htmlFor={`correctAnswer-${index}`}>Correct Answer:</label>
                      <select
                        id={`correctAnswer-${index}`}
                        value={question.correctAnswer}
                        onChange={(e) => handleBatchQuestionChange(index, 'correctAnswer', e.target.value)}
                        required
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    
                    <div className="test-detail-form-group">
                      <label htmlFor={`explainDetail-${index}`}>Explanation (optional):</label>
                      <Editor
                        apiKey="1w6cv14vn9vxpte2rrukp3g2j77lllo2ths7s5j3qad698cx"
                        value={question.explainDetail}
                        onEditorChange={value => {
                          const updatedQuestions = [...batchQuestions];
                          updatedQuestions[index].explainDetail = value;
                          setBatchQuestions(updatedQuestions);
                        }}
                        init={{
                          height: 120,
                          menubar: false,
                          plugins: 'lists link',
                          toolbar: 'undo redo | bold italic underline | forecolor | bullist numlist | removeformat',
                          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                        }}
                      />
                      {question.explainDetail && (
                        <div style={{ marginTop: '8px', background: '#f6f6f6', padding: '8px', borderRadius: '4px' }}>
                          <b>Preview:</b>
                          <div dangerouslySetInnerHTML={{ __html: question.explainDetail }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="test-detail-form-actions">
                <button 
                  type="button" 
                  className="test-detail-cancel-btn"
                  onClick={closeBatchQuestionModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="test-detail-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : `Save ${batchQuestions.length} Questions`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: 600 ,background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <h3>Confirm question deletion</h3>
            <p>Are you sure you want to delete this question? This action cannot be undone..</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
              <button onClick={closeDeleteModal} style={{ padding: '6px 16px', borderRadius: 4, border: 'none', background: '#ccc', color: '#222', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteQuestion} style={{ padding: '6px 16px', borderRadius: 4, border: 'none', background: '#d32f2f', color: '#fff', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal import excel */}
      <ImportExcelModal
        isOpen={isImportExcelModalOpen}
        onClose={() => setIsImportExcelModalOpen(false)}
        onImport={handleImportQuestions}
      />
    </div>
  );
};

export default TestDetail; 