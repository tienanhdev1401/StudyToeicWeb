import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ManageLesson.css';
import SuccessAlert from '../../components/SuccessAlert';
import ErrorAlert from '../../components/ErrorAlert';
import lessonService from '../../services/admin/admin.lessonService';

const ManageLesson = () => {
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


  const [isCaptionModalOpen, setIsCaptionModalOpen] = useState(false);
  const [currentCaptions, setCurrentCaptions] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  // Mẫu dữ liệu lesson tạm thời

  // Fetch data function
  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      // Trong thực tế, bạn sẽ gọi API ở đây    
      const data = await lessonService.getAllLesson();
      setTestList(data);
    } catch (err) {
      setError(err.message || 'An error occurred while loading data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchLessons();
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

  // Handle adding or updating a lesson
  const handleAddOrUpdateLesson = async (lessonData, isEdit) => {
    try {
      setIsSubmitting(true);
      let savedLesson;
      
      if (isEdit) {
        // Update lesson using service
        savedLesson = await lessonService.updatelesson(lessonData.id, lessonData);
        // Update local state after successful API call
        setTestList(prevList => 
          prevList.map(item => item.id === lessonData.id ? savedLesson : item)
        );
        displaySuccessMessage('Lesson updated successfully!');
      } else {
        savedLesson = await lessonService.createlesson(lessonData);
        // Update local state after successful API call
        setTestList(prevList => [...prevList, savedLesson]);
        displaySuccessMessage('Lesson added successfully!');
      }
      
      setIsAddModalOpen(false);
      setEditMode(false);
      setTestToEdit(null);
      
      return savedLesson;
    } catch (error) {
      console.error('Error:', error);
      displayErrorMessage(error.message || 'An error occurred. Please try again.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewCaptions = async (lessonId) => {
    try {
      setSelectedLessonId(lessonId);
      setIsCaptionModalOpen(true);

      // Gọi API lấy lesson theo ID
      const response = await lessonService.getlessonById(lessonId);

      // Lấy captions từ response
      setCurrentCaptions(response.data.captions || []);
      
    } catch (error) {
      console.error("Lỗi khi lấy phụ đề:", error);
    }
  };

  const handleSaveCaptions = async () => {
  try {
    // Lấy thông tin lesson hiện tại (nếu cần giữ các field khác)
    const lesson = await lessonService.getlessonById(selectedLessonId);

    // Cập nhật lesson, thêm captions vào object lesson
    const updatedLesson = {
      ...lesson,
      captions: currentCaptions, // gán mảng captions hiện tại
    };

    await lessonService.updatelesson(selectedLessonId, updatedLesson);

    setIsCaptionModalOpen(false);
    alert("Lưu phụ đề thành công!");
  } catch (error) {
    console.error("Lỗi khi lưu phụ đề:", error);
    alert("Không thể lưu phụ đề.");
  }
};

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      if (itemToDelete) {
        console.log(itemToDelete.id);
        // Delete single item using service
        await lessonService.deletelesson(itemToDelete.id);
        // Update local state after successful API call
        setTestList(prevList => prevList.filter(item => item.id !== itemToDelete.id));
        displaySuccessMessage(`Lesson "${itemToDelete.title}" deleted successfully`);
      } else {
        // Delete multiple items using service
        for(const id of selectedItems){
          await lessonService.deletelesson(id);
        }
        // Update local state after successful API call
        setTestList(prevList => prevList.filter(item => !selectedItems.includes(item.id)));
        displaySuccessMessage(`${selectedItems.length} lessons deleted successfully`);
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
  const filteredData = testList.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      (item.title || '').toLowerCase().includes(term) ||
      (item.topic || '').toLowerCase().includes(term) ||
      (item.status || '').toLowerCase().includes(term) ||
      (item.level || '').toLowerCase().includes(term) ||
      (item.language || '').toLowerCase().includes(term) ||
      (item.durationSec !== undefined && item.durationSec !== null && String(item.durationSec).toLowerCase().includes(term)) ||
      (item.id !== undefined && String(item.id).toLowerCase().includes(term))
    );
  });

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
    return <div className="manageLesson-loading">Loading...</div>;
  }

  if (error) {
    return <div className="manageLesson-error">Error: {error}</div>;
  }

  return (
    
    <div className="manageLesson-container">
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
      
      <h1 className="manageLesson-header-title">Manage Lessons</h1>

      {isCaptionModalOpen && (
        <div className="caption-modal">
          <div className="caption-modal-content">
            <h3>Phụ đề của bài học</h3>

            {currentCaptions.length === 0 ? (
              <p>Chưa có phụ đề nào.</p>
            ) : (
              <div className="caption-table-wrapper">
              <table className="caption-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Lesson ID</th>
                    <th>Language</th>
                    <th>Start (ms)</th>
                    <th>End (ms)</th>
                    <th>Order</th>
                    <th>Text</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCaptions.map((cap, idx) => (
                    <tr key={cap.id || cap.tempId}>
                      <td>{cap.id || "-"}</td>
                      <td>{cap.lessonId ?? selectedLessonId}</td>

                      {/* Language */}
                      <td>
                        <input
                          type="text"
                          value={cap.language}
                          placeholder="vi"
                          onChange={(e) => {
                            const updated = [...currentCaptions];
                            updated[idx] = { ...updated[idx], language: e.target.value };
                            setCurrentCaptions(updated);
                          }}
                        />
                      </td>

                      {/* Start */}
                      <td>
                        <input
                          type="text"
                          value={cap.startMs}
                          placeholder="0"
                          onChange={(e) => {
                            const updated = [...currentCaptions];
                            updated[idx] = { ...updated[idx], startMs: e.target.value };
                            setCurrentCaptions(updated);
                          }}
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            const updated = [...currentCaptions];
                            if (!val || isNaN(Number(val))) {
                              alert("Start (ms) phải là số và không được để trống!");
                              updated[idx] = { ...updated[idx], startMs: "" };
                            }
                            setCurrentCaptions(updated);
                          }}
                        />
                      </td>

                      {/* End */}
                      <td>
                        <input
                          type="text"
                          value={cap.endMs}
                          placeholder="0"
                          onChange={(e) => {
                            const updated = [...currentCaptions];
                            updated[idx] = { ...updated[idx], endMs: e.target.value };
                            setCurrentCaptions(updated);
                          }}
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            const updated = [...currentCaptions];
                            if (!val || isNaN(Number(val))) {
                              alert("End (ms) phải là số và không được để trống!");
                              updated[idx] = { ...updated[idx], endMs: "" };
                            }
                            setCurrentCaptions(updated);
                          }}
                        />
                      </td>

                      {/* Order */}
                      <td>
                        <input
                          type="text"
                          value={cap.orderIndex}
                          placeholder={idx + 1}
                          onChange={(e) => {
                            const updated = [...currentCaptions];
                            updated[idx] = { ...updated[idx], orderIndex: e.target.value };
                            setCurrentCaptions(updated);
                          }}
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            const updated = [...currentCaptions];
                            if (!val || isNaN(Number(val))) {
                              alert("Order phải là số và không được để trống!");
                              updated[idx] = { ...updated[idx], orderIndex: "" };
                            }
                            setCurrentCaptions(updated);
                          }}
                        />
                      </td>

                      {/* Text */}
                      <td>
                        <input
                          type="text"
                          value={cap.text}
                          onChange={(e) => {
                            const updated = [...currentCaptions];
                            updated[idx] = { ...updated[idx], text: e.target.value };
                            setCurrentCaptions(updated);
                          }}
                        />
                      </td>

                      {/* Delete button */}
                      <td>
                        <button
                          className="delete-caption-btn"
                          onClick={() => {
                            const updated = currentCaptions.filter(
                              c => !(c.id === cap.id && c.tempId === cap.tempId)
                            );
                            setCurrentCaptions(updated);
                          }}
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
            

            <div className="caption-modal-actions">
              <button onClick={() => setIsCaptionModalOpen(false)}>Đóng</button>

              <button
                className="add-caption-btn"
                onClick={() => {
                  const newCaption = {
                    tempId: Date.now(),
                    lessonId: selectedLessonId,
                    language: "",
                    startMs: "",
                    endMs: "",
                    orderIndex: (currentCaptions.length + 1).toString(),
                    text: "",
                  };
                  setCurrentCaptions([...currentCaptions, newCaption]);
                }}
              >
                Thêm phụ đề
              </button>

              <button onClick={handleSaveCaptions}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="manageLesson-pagination">
        <div className="manageLesson-entries-select">
          <p>Show </p>
          <select 
            value={itemsPerPage} 
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="manageLesson-entries-dropdown"
          >
            {entriesOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <p>entries </p>
        </div>

        <div className="manageLesson-action-section">
          <div className="manageLesson-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search..."
              className="manageLesson-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
                
          <button className="manageLesson-add-btn" onClick={() => setIsAddModalOpen(true)}>
            <i className="fas fa-plus"></i>
            Add New
          </button>
          
          <button className="manageLesson-trash-btn">
            <i className="fas fa-trash"></i>
            Trash
          </button>
        </div>
      </div>
      
      <div className="manageLesson-table-container">
        <table className="manageLesson-table">
        <thead>
          <tr>
            <th className="manageLesson-id-column">
              <div className="manageLesson-id-header">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedItems.length === sortedData.length && sortedData.length > 0}
                  onClick={handleCheckboxClick}
                />
                <span onClick={() => handleSort('id')} className="manageLesson-sortable">
                  ID
                  <i className={`fas ${sortField === 'id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                </span>
              </div>
            </th>
            <th onClick={() => handleSort('title')} className="manageLesson-sortable">
              Title
              <i className={`fas ${sortField === 'title' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('topic')} className="manageLesson-sortable">
              Topic
              <i className={`fas ${sortField === 'topic' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('durationSec')} className="manageLesson-sortable">
              Duration (sec)
              <i className={`fas ${sortField === 'durationSec' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('status')} className="manageLesson-sortable">
              Status
              <i className={`fas ${sortField === 'status' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('level')} className="manageLesson-sortable">
              Level
              <i className={`fas ${sortField === 'level' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('language')} className="manageLesson-sortable">
              Language
              <i className={`fas ${sortField === 'language' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th>Tags</th>
            <th>Transcript URL</th>
            <th>Thumbnail</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <tr key={item.id}>
                <td className="manageLesson-id-column">
                  <div className="manageLesson-id-cell">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                    <span>{item.id}</span>
                  </div>
                </td>
                <td>{item.title}</td>
                <td>{item.topic || '-'}</td>
                <td>{item.durationSec ?? '-'}</td>
                <td>{item.status || '-'}</td>
                <td>{item.level || '-'}</td>
                <td>{item.language || '-'}</td>
                <td>
                  {item.tags && item.tags.length > 0 ? (
                    <div className="manageLesson-tags">
                      {item.tags.map((tag, index) => (
                        <span key={index} className="manageLesson-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : '-'}
                </td>
                <td>
                  {item.transcriptUrl ? (
                    <div className="manageLesson-transcript-text">
                      {item.transcriptUrl}
                    </div>
                  ) : '-'}
                </td>
                <td>
                  {item.thumbnailUrl ? (
                    <div className="manageLesson-thumbnail">
                      <img 
                        src={item.thumbnailUrl} 
                        alt="Thumbnail" 
                        className="manageLesson-thumbnail-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="manageLesson-thumbnail-placeholder" style={{display: 'none'}}>
                        <i className="fas fa-image"></i>
                      </div>
                    </div>
                  ) : '-'}
                </td>
                <td>
                  <button 
                    className="manageLesson-view-btn"
                    onClick={() => handleViewCaptions(item.id)}
                  >
                    <i className="fa-solid fa-eye"></i>
                  </button>
                  <button 
                    className="manageLesson-edit-btn"
                    onClick={() => handleEditClick(item)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button 
                    className="manageLesson-delete-btn"
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
              <td colSpan="13" className="manageLesson-empty-table">
                <div className="manageLesson-empty-message">
                  <i className="fas fa-clipboard-list"></i>
                  <p>No lessons found</p>
                  <button className="manageLesson-add-btn" onClick={() => setIsAddModalOpen(true)}>
                    <i className="fas fa-plus"></i> Add Lesson
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
      
      

      {currentItems.length > 0 && (
        <div className="manageLesson-pagination">
          <span>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="manageLesson-pagination-buttons">
            <button 
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="manageLesson-page-btn"
            >
              Previous
            </button>
            
            {getPageNumbers(currentPage, totalPages).map((item, index) => (
              item === '...' ? (
                <span key={`dots-${index}`} className="manageLesson-page-dots">...</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  className={`manageLesson-page-btn ${currentPage === item ? 'active' : ''}`}
                >
                  {item}
                </button>
              )
            ))}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="manageLesson-page-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="manageLesson-table-action-bar">
          <div className="manageLesson-action-bar-content">
            <span>{selectedItems.length} items selected</span>
            <button 
              className="manageLesson-delete-selected-btn"
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
        <div className="manageLesson-modal-overlay">
          <div className="manageLesson-modal-content">
            <div className="manageLesson-modal-header">
              <h2>Confirm Delete</h2>
              <button className="manageLesson-close-btn" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="manageLesson-modal-body">
              <p>
                {itemToDelete 
                  ? `Are you sure you want to delete "${itemToDelete.title}"?`
                  : `Are you sure you want to delete ${selectedItems.length} selected items?`}
              </p>
            </div>
            <div className="manageLesson-modal-footer">
              <button className="manageLesson-cancel-btn" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>Cancel</button>
              <button className="manageLesson-confirm-delete-btn" onClick={handleDeleteConfirm} disabled={isDeleting}>
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

      {/* Add/Edit Lesson Modal */}
      {isAddModalOpen && (
        <LessonFormModal
          isOpen={isAddModalOpen}
          onClose={() => {
            if (!isSubmitting) {
              setIsAddModalOpen(false);
              setEditMode(false);
              setTestToEdit(null);
            }
          }}
          onSubmit={handleAddOrUpdateLesson}
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

// Lesson Form Modal Component
const LessonFormModal = ({ isOpen, onClose, onSubmit, editMode = false, testItem = null, isSubmitting = false, displayErrorMessage }) => {
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    description: '',
    thumbnailUrl: '',
    durationSec: '',
    topic: '',
    status: 'draft',
    level: '',
    language: '',
    tags: '',
    transcriptUrl: ''
  });

  const [errors, setErrors] = useState({
    title: '',
    videoUrl: '',
    durationSec: ''
  });

  // Image upload states
  const [imagePreview, setImagePreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imageInputType, setImageInputType] = useState('url'); // 'url' or 'file'

  useEffect(() => {
    if (isOpen && editMode && testItem) {
      setFormData({
        title: testItem.title || '',
        videoUrl: testItem.videoUrl || '',
        description: testItem.description || '',
        thumbnailUrl: testItem.thumbnailUrl || '',
        durationSec: testItem.durationSec ?? '',
        topic: testItem.topic || '',
        status: testItem.status || 'draft',
        level: testItem.level || '',
        language: testItem.language || '',
        tags: Array.isArray(testItem.tags) ? testItem.tags.join(', ') : (testItem.tags || ''),
        transcriptUrl: testItem.transcriptUrl || ''
      });
      setErrors({ title: '', videoUrl: '', durationSec: '' });
      // Set image preview if thumbnailUrl exists
      setImagePreview(testItem.thumbnailUrl || null);
      setThumbnailFile(null);
      setImageInputType('url');
    } else if (isOpen && !editMode) {
      setFormData({
        title: '',
        videoUrl: '',
        description: '',
        thumbnailUrl: '',
        durationSec: '',
        topic: '',
        status: 'draft',
        level: '',
        language: '',
        tags: '',
        transcriptUrl: ''
      });
      setErrors({ title: '', videoUrl: '', durationSec: '' });
      setImagePreview(null);
      setThumbnailFile(null);
      setImageInputType('url');
    }
  }, [isOpen, editMode, testItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (value !== '') {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle image file upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        displayErrorMessage('Only JPG, PNG or GIF images are allowed');
        return;
      }

      if (file.size > maxSize) {
        displayErrorMessage('File size must not exceed 5MB');
        return;
      }

      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      
      setImagePreview(previewUrl);
      setThumbnailFile(file);
      setFormData(prev => ({ ...prev, thumbnailUrl: '' })); // Clear URL when file is selected
      setErrors(prev => ({ ...prev, thumbnailUrl: '' }));
    }
  };

  // Handle image URL change
  const handleImageUrlChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, thumbnailUrl: value }));
    setImagePreview(value || null);
    setThumbnailFile(null); // Clear file when URL is entered
    if (value !== '') {
      setErrors(prev => ({ ...prev, thumbnailUrl: '' }));
    }
  };

  // Handle image input type toggle
  const handleImageInputTypeChange = (type) => {
    setImageInputType(type);
    if (type === 'url') {
      setThumbnailFile(null);
      setImagePreview(formData.thumbnailUrl || null);
    } else {
      setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
      setImagePreview(null);
    }
  };

  const validate = () => {
    const newErrors = { title: '', videoUrl: '', durationSec: '' };
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.videoUrl.trim()) newErrors.videoUrl = 'Video URL is required';
    if (formData.durationSec !== '' && (Number.isNaN(Number(formData.durationSec)) || Number(formData.durationSec) < 0)) {
      newErrors.durationSec = 'Duration must be a non-negative number';
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      let thumbnailUrl = formData.thumbnailUrl?.trim() || null;

      // Upload file first if present
      if (thumbnailFile) {
        thumbnailUrl = await lessonService.uploadThumbnail(thumbnailFile);
      }

      const payload = {
        title: formData.title.trim(),
        videoUrl: formData.videoUrl.trim(),
        description: formData.description?.trim() || null,
        thumbnailUrl,
        durationSec: formData.durationSec === '' ? null : Number(formData.durationSec),
        topic: formData.topic?.trim() || null,
        status: formData.status || 'draft',
        level: formData.level?.trim() || null,
        language: formData.language?.trim() || null,
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : null,
        transcriptUrl: formData.transcriptUrl?.trim() || null
      };

      if (editMode && testItem) {
        await onSubmit({ id: testItem.id, ...payload }, true);
      } else {
        await onSubmit(payload, false);
      }
      onClose && onClose();
    } catch (err) {
      displayErrorMessage(err.message || 'Failed to save lesson');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="manageLesson-add-modal-overlay">
      <div className="manageLesson-add-modal-content">
        <div className="manageLesson-add-modal-header">
          <h2>{editMode ? 'Edit Lesson' : 'Add New Lesson'}</h2>
          <button type="button" className="manageLesson-close-btn" onClick={onClose} disabled={isSubmitting}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="manageLesson-add-modal-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className={`manageLesson-form-group ${errors.title ? 'has-error' : ''}`}>
              <label htmlFor="title">Title <span className="required">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter lesson title"
                className={errors.title ? 'manageLesson-input-error' : ''}
                disabled={isSubmitting}
              />
              {errors.title && <div className="manageLesson-error-message">{errors.title}</div>}
            </div>

            <div className={`manageLesson-form-group ${errors.videoUrl ? 'has-error' : ''}`}>
              <label htmlFor="videoUrl">Video URL <span className="required">*</span></label>
              <input
                type="text"
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                required
                placeholder="https://..."
                className={errors.videoUrl ? 'manageLesson-input-error' : ''}
                disabled={isSubmitting}
              />
              {errors.videoUrl && <div className="manageLesson-error-message">{errors.videoUrl}</div>}
            </div>

            <div className="manageLesson-form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Lesson description"
                disabled={isSubmitting}
              />
            </div>

            <div className="manageLesson-form-group">
              <label htmlFor="thumbnailUrl">Thumbnail Image</label>
              
              {/* Image Input Type Toggle */}
              <div className="manageLesson-image-input-toggle">
                <button
                  type="button"
                  className={`manageLesson-toggle-btn ${imageInputType === 'url' ? 'active' : ''}`}
                  onClick={() => handleImageInputTypeChange('url')}
                  disabled={isSubmitting}
                >
                  <i className="fas fa-link"></i> URL
                </button>
                <button
                  type="button"
                  className={`manageLesson-toggle-btn ${imageInputType === 'file' ? 'active' : ''}`}
                  onClick={() => handleImageInputTypeChange('file')}
                  disabled={isSubmitting}
                >
                  <i className="fas fa-upload"></i> Upload
                </button>
              </div>

              {/* URL Input */}
              {imageInputType === 'url' && (
                <input
                  type="text"
                  id="thumbnailUrl"
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://..."
                  disabled={isSubmitting}
                />
              )}

              {/* File Upload Input */}
              {imageInputType === 'file' && (
                <div className="manageLesson-file-upload">
                  <input
                    type="file"
                    id="thumbnailFile"
                    name="thumbnailFile"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="thumbnailFile" className="manageLesson-file-upload-label">
                    <i className="fas fa-cloud-upload-alt"></i>
                    Choose Image File
                  </label>
                  {thumbnailFile && (
                    <span className="manageLesson-file-name">{thumbnailFile.name}</span>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="manageLesson-image-preview">
                  <img 
                    src={imagePreview} 
                    alt="Thumbnail preview" 
                    className="manageLesson-preview-image"
                  />
                  <button
                    type="button"
                    className="manageLesson-remove-image"
                    onClick={() => {
                      setImagePreview(null);
                      setThumbnailFile(null);
                      setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
                    }}
                    disabled={isSubmitting}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>

            <div className={`manageLesson-form-group ${errors.durationSec ? 'has-error' : ''}`}>
              <label htmlFor="durationSec">Duration (seconds)</label>
              <input
                type="number"
                id="durationSec"
                name="durationSec"
                value={formData.durationSec}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 1305"
                className={errors.durationSec ? 'manageLesson-input-error' : ''}
                disabled={isSubmitting}
              />
              {errors.durationSec && <div className="manageLesson-error-message">{errors.durationSec}</div>}
            </div>

            <div className="manageLesson-form-group">
              <label htmlFor="topic">Topic</label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="listening, reading, ..."
                disabled={isSubmitting}
              />
            </div>

            <div className="manageLesson-form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} disabled={isSubmitting}>
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
            </div>

            <div className="manageLesson-form-group">
              <label htmlFor="level">Level</label>
              <input
                type="text"
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                placeholder="beginner, intermediate, ..."
                disabled={isSubmitting}
              />
            </div>

            <div className="manageLesson-form-group">
              <label htmlFor="language">Language</label>
              <input
                type="text"
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                placeholder="vi, en, ..."
                disabled={isSubmitting}
              />
            </div>

            <div className="manageLesson-form-group">
              <label htmlFor="tags">Tags (comma separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="toeic, listening, overview"
                disabled={isSubmitting}
              />
            </div>

            <div className="manageLesson-form-group">
              <label htmlFor="transcriptUrl">Transcript URL</label>
              <input
                type="text"
                id="transcriptUrl"
                name="transcriptUrl"
                value={formData.transcriptUrl}
                onChange={handleChange}
                placeholder="https://..."
                disabled={isSubmitting}
              />
            </div>

            <div className="manageLesson-add-modal-footer">
              <button type="button" className="manageLesson-cancel-btn" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="manageLesson-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  editMode ? 'Save Changes' : 'Add Lesson'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageLesson;
