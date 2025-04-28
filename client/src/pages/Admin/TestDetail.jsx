import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/TestDetail.css';
import testService from '../../services/admin/admin.testService';
import questionService from '../../services/admin/admin.questionService';

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
  const [newQuestion, setNewQuestion] = useState({
    content: '',
    explainDetail: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explainResource: '',
    audioUrl: '',
    imageUrl: '',
  });
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch test details
  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        setLoading(true);
        const response = await testService.getTestById(id);
        console.log("Test data:", response);
        
        // Check if response has the expected format
        const testData = response.data || response;
        
        setTest(testData);
        // If test data is loaded successfully, set the first part as active by default
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
      explainResource: '',
      audioUrl: '',
      imageUrl: '',
    });
    setSubmitError(null);
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (question) => {
    console.log(question);
    setEditingQuestionId(question.id);
    setNewQuestion({
      content: question.content || '',
      explainDetail: question.explainDetail || '',
      optionA: question.optionA || '',
      optionB: question.optionB || '',
      optionC: question.optionC || '',
      optionD: question.optionD || '',
      correctAnswer: question.correctAnswer || 'A',
      explainResource: question.resource?.explainResource || '',
      audioUrl: question.resource?.urlAudio || '',
      imageUrl: question.resource?.urlImage || '',
      questionNumber: question.questionNumber
    });
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

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!activePart || !activePart.id) {
      setSubmitError('No active part selected');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      
      if (editingQuestionId) {
        // Update existing question
        const questionData = {
          content: newQuestion.content,
          optionA: newQuestion.optionA,
          optionB: newQuestion.optionB,
          optionC: newQuestion.optionC,
          optionD: newQuestion.optionD,
          correctAnswer: newQuestion.correctAnswer,
          explainDetail: newQuestion.explainDetail,
          resourceData: {
            explainResource: newQuestion.explainResource,
            audioUrl: newQuestion.audioUrl,
            imageUrl: newQuestion.imageUrl
          },
          questionNumber: newQuestion.questionNumber
        };

        await questionService.updateQuestionByPartId(
          activePart.id,
          editingQuestionId,
          questionData
        );
      } else {
        // Create new question
        // Determine the next question number
        const nextQuestionNumber = questions.length > 0 
          ? Math.max(...questions.map(q => q.questionNumber || 0)) + 1 
          : 1;
        
        const questionData = {
          content: newQuestion.content,
          optionA: newQuestion.optionA,
          optionB: newQuestion.optionB,
          optionC: newQuestion.optionC,
          optionD: newQuestion.optionD,
          correctAnswer: newQuestion.correctAnswer,
          explainDetail: newQuestion.explainDetail,
          resourceData: {
            explainResource: newQuestion.explainResource,
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
      
      // Close the modal
      closeQuestionModal();
    } catch (err) {
      console.error(`Error ${editingQuestionId ? 'updating' : 'creating'} question:`, err);
      setSubmitError(err.message || `Failed to ${editingQuestionId ? 'update' : 'create'} question`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!activePart || !activePart.id) {
      return;
    }

    if (window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      try {
        await questionService.deleteQuestionByPartId(activePart.id, questionId);
        
        // Refresh the questions list
        const updatedQuestions = await questionService.getQuestionsByPartId(activePart.id);
        setQuestions(Array.isArray(updatedQuestions) ? updatedQuestions : []);
      } catch (err) {
        console.error('Error deleting question:', err);
        alert(`Failed to delete question: ${err.message || 'Unknown error'}`);
      }
    }
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
            <h2>Part {activePart.partNumber}: {activePart.title || ''}</h2>
            <button 
              className="test-detail-add-question-btn"
              onClick={openQuestionModal}
            >
              <i className="fas fa-plus"></i> Add Question
            </button>
          </div>
          
          <div className="test-detail-description">
            <p>{activePart.description || 'No description available'}</p>
          </div>

          {questionLoading ? (
            <div className="test-detail-questions-loading">Loading questions...</div>
          ) : (
            <div className="test-detail-questions">
              {questions && questions.length > 0 ? (
                questions.map((question, index) => (
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
                          
                          {question.resource && question.resource.explainResource && (
                            <div className="test-detail-question-paragraph">
                              <p><i>{question.resource.explainResource}</i></p>
                            </div>
                          )}
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
                            <h4>Explanation:</h4>
                            <p>{question.explainDetail}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="test-detail-question-actions">
                        <button 
                          className="test-detail-edit-question-btn"
                          onClick={() => openEditQuestionModal(question)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button 
                          className="test-detail-delete-question-btn"
                          onClick={() => handleDeleteQuestion(question.id)}
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
                  required
                  rows={4}
                  placeholder="Enter the question text here..."
                />
              </div>
              
              <div className="test-detail-form-group">
                <label htmlFor="explainDetail">Explanation:</label>
                <textarea
                  id="explainDetail"
                  name="explainDetail"
                  value={newQuestion.explainDetail}
                  onChange={handleQuestionChange}
                  rows={3}
                  placeholder="Enter the explanation for the correct answer..."
                />
              </div>
              
              <div className="test-detail-form-group">
                <label htmlFor="explainResource">Translation/Explanation Resource:</label>
                <textarea
                  id="explainResource"
                  name="explainResource"
                  value={newQuestion.explainResource}
                  onChange={handleQuestionChange}
                  rows={3}
                  placeholder="Enter translation or additional explanation..."
                />
              </div>
              
              <div className="test-detail-form-group">
                <label htmlFor="optionA">Option A:</label>
                <input
                  type="text"
                  id="optionA"
                  name="optionA"
                  value={newQuestion.optionA}
                  onChange={handleQuestionChange}
                  required
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
                  required
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
                  required
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
                  required
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
    </div>
  );
};

export default TestDetail; 