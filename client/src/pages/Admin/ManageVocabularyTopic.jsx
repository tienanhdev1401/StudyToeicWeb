import React, {useState, useEffect} from 'react';
import  '../../styles/ManageVocabularyTopic.css';
import vocabularyTopicService from '../../services/admin/admin.vocabularyTopicService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';



const AddTopicModal = ({isOpen, onClose, onAdd}) => {
  const [formData, setFormData] = useState({
    topicName: '',
    imageURL: '',
  });
  const [vocabularyFile, setVocabularyFile] = useState(null);
  const [errors, setErrors] = useState({
    topicName: '',
    imageUrl: ''
    // vocabularyFile: '',
  });
  const [touched, setTouched] = useState({
    topicName: false,
    imageUrl: false
    // vocabularyFile: false,
  });

  if(!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
    
    // Clear error when user types
    if (value.trim()) {
      setErrors({...errors, [name]: ''});
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({...touched, [name]: true});
    
    // Validate on blur
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let errorMessage = '';
    
    if (fieldName === 'topicName' && !value.trim()) {
      errorMessage = 'Topic name is required';
    }
    
    if (fieldName === 'imageUrl' && !value.trim()) {
      errorMessage = 'Image URL is required';
    }
    
    setErrors({...errors, [fieldName]: errorMessage});
    return !errorMessage;
  };

  const validateForm = () => {
    const newErrors = {
      topicName: !formData.topicName.trim() ? 'Topic name is required' : '',
      imageUrl: !formData.imageUrl.trim() ? 'Image URL is required' : ''
      // vocabularyFile: !vocabularyFile ? 'Vocabulary file is required' : '',
    };
    
    setErrors(newErrors);
    setTouched({
      topicName: true,
      imageUrl: true
      // vocabularyFile: true,
    });
    
    return !Object.values(newErrors).some(error => error);
  };
  

  const handleVocabularyFileChange = (e) => {
    if (e.target.files[0]) {
      setVocabularyFile(e.target.files[0]);
    }
  };



  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newTopic = {
      topicName: formData.topicName,
      imageURL: formData.imageURL,
      date: new Date().toISOString().split('T'[0]),
    };

        // Here you would handle the Excel files upload
    // You would need to implement file upload logic with FormData

    onAdd(newTopic);
    onClose();
  };

 return (
    <div className="add-modal-overlay">
      <div className="add-modal-content">
        <div className="add-modal-header">
          <h2>Add New Topic</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="add-modal-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className={`form-group ${errors.topicName && touched.topicName ? 'has-error' : ''}`}>
              <label htmlFor="topicName">Topic Name <span className="required">*</span></label>
              <input
                type="text"
                id="topicName"
                name="topicName"
                value={formData.topicName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Enter topic name"
                className={errors.topicName && touched.topicName ? 'input-error' : ''}
              />
              {errors.topicName && touched.topicName && (
                <div className="error-message">{errors.topicName}</div>
              )}
            </div>
            
            <div className={`form-group ${errors.imageUrl && touched.imageUrl ? 'has-error' : ''}`}>
              <label htmlFor="imageUrl">Image URL <span className="required">*</span></label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="Enter image URL"
                className={errors.imageUrl && touched.imageUrl ? 'input-error' : ''}
              />
              {errors.imageUrl && touched.imageUrl && (
                <div className="error-message">{errors.imageUrl}</div>
              )}
              <div className="image-preview">
                {formData.imageUrl && (
                  <img src={formData.imageUrl} alt="Preview" onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Invalid+Image+URL";
                  }} />
                )}
              </div>
            </div>
            
            <div className="file-upload-section">
              <div className={`form-group file-upload ${errors.vocabularyFile && touched.vocabularyFile ? 'file-error' : ''}`}>
                <label htmlFor="vocabularyFile">
                  <i className="fas fa-file-excel"></i>
                  Upload Vocabulary Excel File 
                </label>
                <input
                  type="file"
                  id="vocabularyFile"
                  accept=".xlsx, .xls"
                  onChange={handleVocabularyFileChange}
                  className="file-input"
                  required
                />
                <div className="file-info">
                  {vocabularyFile ? vocabularyFile.name : "No file chosen"}
                </div>
                {errors.vocabularyFile && touched.vocabularyFile && (
                  <div className="error-message">{errors.vocabularyFile}</div>
                )}
              </div>
              
          
            </div>
            
            <div className="add-modal-footer">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Add Topic
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

} 
const ManageVocabularyTopic = () => {
const navigate = useNavigate();
const [vocabularyList, setVocabularyList] = useState([]);
const [isLoading, setIsLoading] = useState(true); // State để quản lý trạng thái loading
const [error, setError] = useState(null); // State để quản lý lỗi

const [searchTerm, setSearchTerm] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(5); // Change from const to state
const [sortField, setSortField] = useState('id');
const [sortDirection, setSortDirection] = useState('asc');

const [selectedItems, setSelectedItems] = useState([]);

// Thêm state để quản lý modal
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [itemToDelete, setItemToDelete] = useState(null); // Thêm state này
const [isAddModalOpen, setIsAddModalOpen] = useState(false); // New state for add modal


useEffect(() => {
  const fetchVocabularyTopics = async () => {
    try {
      setIsLoading(true); // Bắt đầu loading
      const data = await vocabularyTopicService.getAllVocabularyTopics(); // Gọi API
      setVocabularyList(data); // Lưu dữ liệu vào state
    } catch (err) {
      setError(err.message); // Lưu lỗi nếu có
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  fetchVocabularyTopics();
}, []);

// Add entries options
const entriesOptions = [5, 10, 25, 50, 100];

const handleEntriesChange = (e) => {
  setItemsPerPage(Number(e.target.value));
  setCurrentPage(1); // Reset to first page when changing entries per page
};

// Dữ liệu mẫu

// Xử lý tìm kiếm
const filteredData = vocabularyList.filter(item =>
  item.topicName.toLowerCase().includes(searchTerm.toLowerCase())
);

// Đầu tiên sort data
const sortedData = [...filteredData].sort((a, b) => {
  if (sortDirection === 'asc') {
    return a[sortField] > b[sortField] ? 1 : -1;
  } else {
    return a[sortField] < b[sortField] ? 1 : -1;
  }
});

  // Sau đó mới tính toán phân trang
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(sortedData.length / itemsPerPage);

// Thêm useEffect để reset về trang 1 khi thay đổi itemsPerPage hoặc searchTerm
useEffect(() => {
  setCurrentPage(1);
}, [itemsPerPage, searchTerm]);

// Đảm bảo currentPage không vượt quá totalPages
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

  // Add this handler to prevent sort when clicking checkbox
  const handleCheckboxClick = (e) => {
    e.stopPropagation(); // This prevents the click event from bubbling up to the th element
  };

  // Component Modal được sửa để handle cả xóa một và nhiều items
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemToDelete, selectedItems }) => {
  if (!isOpen) return null;

  const isMultiDelete = !itemToDelete;
  const message = isMultiDelete 
    ? `Are you sure you want to delete ${selectedItems.length} selected items?`
    : `Are you sure you want to delete "${itemToDelete.topicName}"?`;

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

  // Thêm hàm tạo mảng số trang với dấu ...
  const getPageNumbers = (currentPage, totalPages) => {
    const delta = 1; // Số trang hiển thị ở hai bên trang hiện tại
    const range = [];
    const rangeWithDots = [];

    // Luôn hiển thị trang đầu
    range.push(1);

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) {
        range.push(i);
      }
    }

    // Luôn hiển thị trang cuối nếu không phải trang 1
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Thêm dấu ... vào các khoảng trống
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

  // Xử lý lỗi hoặc trạng thái loading
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
      <div className="vocabulary-container">
        <h1>Manage Vocabulary Topic</h1>
      <div className="header-section">
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
      

      <table className="vocabulary-table">
        <thead>
          <tr>
            <th className="id-column">
              <div className="id-header">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedItems.length === sortedData.length}
                  onClick={handleCheckboxClick}
                />
                <span onClick={() => handleSort('id')} className="sortable">
                  STT
                  <i className={`fas ${sortField === 'id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                </span>
              </div>
            </th>
            <th onClick={() => handleSort('word')} className="sortable">
              Topic name
              <i className={`fas ${sortField === 'topicName' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('imgURL')} className="sortable">
              Image URL
              <i className={`fas ${sortField === 'word' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('type')} className="sortable">
              Number of words
              <i className={`fas ${sortField === 'type' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            
            <th onClick={() => handleSort('date')} className="sortable">
              Date created
              <i className={`fas ${sortField === 'date' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item) => (
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
              <td>{item.topicName}</td>
              <td>{item.topicName}</td>
              <td>0</td>
              <td>
                <span className={item.date}>
                  0
                </span>
              </td>
              <td>
                <button className="view-btn">
                  <i className="fa-solid fa-eye"></i>
                </button>

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
          ))}
        </tbody>
      </table>

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

      {/* Thêm Modal vào cuối component với logic xử lý cả hai trường hợp */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={() => {
          if (itemToDelete) {
            // Xử lý xóa một item
            console.log("Deleting single item:", itemToDelete);
          } else {
            // Xử lý xóa nhiều items
            console.log("Deleting multiple items:", selectedItems);
          }
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        itemToDelete={itemToDelete}
        selectedItems={selectedItems}
      />

      <AddTopicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(newTopic) => {
          setVocabularyList([...vocabularyList, newTopic]);
        }}
      />
    </div>
  );  
};   





export default ManageVocabularyTopic;