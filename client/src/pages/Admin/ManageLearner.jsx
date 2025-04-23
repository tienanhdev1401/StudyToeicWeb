import React, { useState, useEffect } from 'react';
import '../../styles/ManageLearner.css';
import learnerService from '../../services/admin/admin.LearnerService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BlockConfirmModal = ({ isOpen, onClose, onConfirm, itemToBlock, selectedItems, action }) => {
  if (!isOpen) return null;

  const isMultiAction = !itemToBlock;
  const actionText = action === 'block' ? 'block' : 'unblock';
  const message = isMultiAction
    ? `Are you sure you want to ${actionText} ${selectedItems.length} selected learners?`
    : `Are you sure you want to ${actionText} learner "${itemToBlock.fullname}"?`;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Confirm {action === 'block' ? 'Block' : 'Unblock'}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className={`confirm-${action}-btn`} onClick={onConfirm}>
            <i className={`fas fa-${action === 'block' ? 'ban' : 'check-circle'}`}></i>
            {action === 'block' ? 'Block' : 'Unblock'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageLearner = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [learnerList, setLearnerList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Table state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Modal state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);
  const [itemToAction, setItemToAction] = useState(null);
  const [actionType, setActionType] = useState(''); // 'block' or 'unblock'

  // New Learner and Edit state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLearnerId, setEditingLearnerId] = useState(null);
  const [newLearner, setNewLearner] = useState({
    fullname: '',
    emailAddress: '',
    phoneNumber: '',
    gender: 'MALE',
    password: '',
    status: 'ACTIVE',
    dateOfBirth: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const entriesOptions = [5, 10, 25, 50, 100];
  const genderOptions = ['MALE', 'FEMALE', 'OTHER'];

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        setIsLoading(true);
        const data = await learnerService.getAllLearners();
        setLearnerList(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearners();
  }, []);

  const handleEntriesChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Filter data based on search term
  const filteredData = learnerList.filter(learner =>
    (learner.avatar?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (learner.fullname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (learner.emailAddress?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (learner.phoneNumber || '').includes(searchTerm) ||
    (learner.dateOfBirth || '').includes(searchTerm)
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

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

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
  };

  const handleBlockLearner = async (id) => {
    try {
      await learnerService.blockLearner(id);
      setLearnerList(learnerList.map(learner => 
        learner.id === id ? { ...learner, status: 'BANNED' } : learner
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnblockLearner = async (id) => {
    try {
      await learnerService.unblockLearner(id);
      setLearnerList(learnerList.map(learner => 
        learner.id === id ? { ...learner, status: 'ACTIVE' } : learner
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBlockSelected = async () => {
    try {
      await Promise.all(selectedItems.map(id => learnerService.blockLearner(id)));
      setLearnerList(learnerList.map(learner => 
        selectedItems.includes(learner.id) ? { ...learner, status: 'BANNED' } : learner
      ));
      setSelectedItems([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnblockSelected = async () => {
    try {
      await Promise.all(selectedItems.map(id => learnerService.unblockLearner(id)));
      setLearnerList(learnerList.map(learner => 
        selectedItems.includes(learner.id) ? { ...learner, status: 'ACTIVE' } : learner
      ));
      setSelectedItems([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddLearnerClick = () => {
    setShowAddForm(true);
    setEditingLearnerId(null);
    setFormErrors({});
    setNewLearner({
      fullname: '',
      emailAddress: '',
      phoneNumber: '',
      gender: 'MALE',
      password: '',
      status: 'ACTIVE',
      dateOfBirth: ''
    });
    setTimeout(() => {
      window.scrollTo({
        top: document.querySelector('.learner-table').scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setFormErrors({});
  };

  const handleEditLearner = (learner) => {
    setShowAddForm(false);
    setEditingLearnerId(learner.id);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setEditingLearnerId(null);
    setFormErrors({});
  };

  const handleInputChange = (e, id = null) => {
    const { name, value } = e.target;
    
    if (id) {
      setLearnerList(learnerList.map(learner => 
        learner.id === id ? { ...learner, [name]: value } : learner
      ));
    } else {
      setNewLearner(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (learner) => {
    const errors = {};
    if (!learner.fullname?.trim()) errors.fullname = 'Full name is required';
    if (!learner.emailAddress?.trim()) errors.emailAddress = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(learner.emailAddress)) errors.emailAddress = 'Invalid email format';
    
    if (!learner.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required';
    else if (!/^\d{10,15}$/.test(learner.phoneNumber.replace(/\D/g, ''))) 
      errors.phoneNumber = 'Phone must be 10-15 digits';
    
    if (!learner.password && !editingLearnerId) errors.password = 'Password is required';
    else if (learner.password && learner.password.length < 6) 
      errors.password = 'Password must be at least 6 characters';
    
    if (!learner.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    else {
      const dob = new Date(learner.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (isNaN(dob.getTime())) errors.dateOfBirth = 'Invalid date format';
      else if (age < 18) errors.dateOfBirth = 'Learner must be at least 18 years old';
    }
    
    return errors;
  };

  const handleSaveNewLearner = async () => {
    const errors = validateForm(newLearner);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }
    
    try {
      const createdLearner = await learnerService.addLearner({
        ...newLearner,
        phoneNumber: newLearner.phoneNumber.replace(/\D/g, ''),
        dateOfBirth: newLearner.dateOfBirth
      });
      setLearnerList([...learnerList, {
        ...createdLearner,
        joinAt: new Date().toISOString()
      }]);
      setShowAddForm(false);
      setFormErrors({});
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveEditedLearner = async (id) => {
    const learnerToUpdate = learnerList.find(learner => learner.id === id);
    const originalLearner = learnerList.find(learner => learner.id === id);
    
    // Tạo object với tất cả các trường
    const updateData = {
      ...learnerToUpdate,
      phoneNumber: learnerToUpdate.phoneNumber.replace(/\D/g, ''),
      // Chuyển đổi định dạng date trước khi gửi
      dateOfBirth: learnerToUpdate.dateOfBirth 
        ? formatDateForMySQL(learnerToUpdate.dateOfBirth) 
        : originalLearner.dateOfBirth
    };
  
    // Validate form
    const errors = validateForm(updateData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
  
    try {
      const updatedLearner = await learnerService.updateLearner(id, updateData);
      setLearnerList(learnerList.map(learner => 
        learner.id === id ? { ...updatedLearner, joinAt: learner.joinAt } : learner
      ));
      setEditingLearnerId(null);
      setFormErrors({});
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Hàm chuyển đổi định dạng date
  const formatDateForMySQL = (dateString) => {
    if (!dateString) return null;
    
    // Nếu dateString đã ở định dạng YYYY-MM-DD thì giữ nguyên
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Nếu là ISO string (có chứa 'T') thì chuyển đổi
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

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

  const renderEditableCell = (learner, field, type = 'text') => {
    const isEditing = learner.id === editingLearnerId;
    const hasError = field in formErrors;
    
    if (!isEditing) {
      if (field === 'gender') {
        return learner[field];
      } else if (field === 'status') {
        return (
          <span className={`status-badge ${learner[field].toLowerCase()}`}>
            {learner[field]}
          </span>
        );
      } else if (field === 'dateOfBirth') {
        return learner[field] ? new Date(learner[field]).toLocaleDateString() : '';
      } else {
        return learner[field];
      }
    }
    
    if (field === 'gender') {
      return (
        <div className="editable-cell">
          <select
            name={field}
            value={learner[field]}
            onChange={(e) => handleInputChange(e, learner.id)}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
          >
            {genderOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {hasError && <span className="error-text">{formErrors[field]}</span>}
        </div>
      );
    } else if (field === 'status') {
      return (
        <div className="editable-cell">
          <select
            name={field}
            value={learner[field]}
            onChange={(e) => handleInputChange(e, learner.id)}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="BANNED">BANNED</option>
          </select>
          {hasError && <span className="error-text">{formErrors[field]}</span>}
        </div>
      );
    } else if (field === 'password') {
      return (
        <div className="editable-cell">
          <input
            type="password"
            name={field}
            placeholder="Enter new password (optional)"
            onChange={(e) => handleInputChange(e, learner.id)}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
          />
          {hasError && <span className="error-text">{formErrors[field]}</span>}
        </div>
      );
    } else if (field === 'dateOfBirth') {
      return (
        <div className="editable-cell">
          <input
            type="date"
            name={field}
            value={learner[field] ? learner[field].split('T')[0] : ''}
            onChange={(e) => handleInputChange(e, learner.id)}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
          />
          {hasError && <span className="error-text">{formErrors[field]}</span>}
        </div>
      );
    } else {
      return (
        <div className="editable-cell">
          <input
            type={type}
            name={field}
            value={learner[field] || ''}
            onChange={(e) => handleInputChange(e, learner.id)}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
          />
          {hasError && <span className="error-text">{formErrors[field]}</span>}
        </div>
      );
    }
  };

  const renderNewLearnerInput = (field, type = 'text') => {
    const hasError = field in formErrors;
    const isRequired = ['fullname', 'emailAddress', 'phoneNumber', 'password', 'dateOfBirth'].includes(field);
    
    if (field === 'gender') {
      return (
        <div className="editable-cell">
          <select
            name={field}
            value={newLearner[field]}
            onChange={handleInputChange}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
          >
            {genderOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {hasError && <span className="error-text">{formErrors[field]}</span>}
        </div>
      );
    } else if (field === 'status') {
      return (
        <div className="editable-cell">
          <select
            name={field}
            value={newLearner[field]}
            onChange={handleInputChange}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="BANNED">BANNED</option>
          </select>
          {hasError && <span className="error-text">{formErrors[field]}</span>}
        </div>
      );
    } else if (field === 'dateOfBirth') {
      return (
        <div className="editable-cell">
          <input
            type="date"
            name={field}
            value={newLearner[field] || ''}
            onChange={handleInputChange}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
            placeholder="Select date of birth*"
            required={isRequired}
          />
          {hasError && <span className="error-text">{formErrors[field]}</span>}
        </div>
      );
    } else {
      return (
        <div className="editable-cell">
          <input
            type={type}
            name={field}
            value={newLearner[field] || ''}
            onChange={handleInputChange}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
            placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}${isRequired ? '*' : ''}`}
            required={isRequired}
          />
          {hasError && <span className="error-text">{formErrors[field]}</span>}
        </div>
      );
    }
  };

  if (isLoading) {
    return <div className="loading">Loading learners...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="learner-container">
      <h1>Manage Learners</h1>
      
      <div className="header-section">
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
              placeholder="Search by name, email, phone or DOB..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className="add-btn" onClick={handleAddLearnerClick}>
            <i className="fas fa-plus"></i>
            Add New Learner
          </button>
        </div>
      </div>

      <table className="learner-table">
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
            <th className="avatar-column" onClick={() => handleSort('avatar')}>
              Avatar
              <i className={`fas ${sortField === 'avatar' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('fullname')} className="sortable">
              Full Name
              <i className={`fas ${sortField === 'fullname' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('emailAddress')} className="sortable">
              Email
              <i className={`fas ${sortField === 'emailAddress' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('phoneNumber')} className="sortable">
              Phone
              <i className={`fas ${sortField === 'phoneNumber' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('gender')} className="sortable">
              Gender
              <i className={`fas ${sortField === 'gender' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('dateOfBirth')} className="sortable">
              Date of Birth
              <i className={`fas ${sortField === 'dateOfBirth' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('status')} className="sortable">
              Status
              <i className={`fas ${sortField === 'status' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th onClick={() => handleSort('joinAt')} className="sortable">
              Joined At
              <i className={`fas ${sortField === 'joinAt' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map(learner => (
              <tr key={learner.id} className={editingLearnerId === learner.id ? 'editing-row' : ''}>
                <td className="id-column">
                  <div className="id-cell">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(learner.id)}
                      onChange={() => handleSelectItem(learner.id)}
                      disabled={editingLearnerId === learner.id}
                    />
                    <span>{learner.id}</span>
                  </div>
                </td>
                <td className="avatar-column">
                  {learner.avatar ? (
                    <img 
                      src={learner.avatar} 
                      alt="Avatar" 
                      className="avatar-img"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      <i className="fas fa-user-circle"></i>
                    </div>
                  )}
                </td>
                <td>{renderEditableCell(learner, 'fullname')}</td>
                <td>{renderEditableCell(learner, 'emailAddress', 'email')}</td>
                <td>{renderEditableCell(learner, 'phoneNumber', 'tel')}</td>
                <td>{renderEditableCell(learner, 'gender')}</td>
                <td>{renderEditableCell(learner, 'dateOfBirth', 'date')}</td>
                <td>{renderEditableCell(learner, 'status')}</td>
                <td>
                  {editingLearnerId === learner.id ? (
                    'Cannot edit'
                  ) : (
                    new Date(learner.joinAt).toLocaleDateString()
                  )}
                </td>
                <td>
                  {editingLearnerId === learner.id ? (
                    <>
                      <button 
                        className="save-btn" 
                        onClick={() => handleSaveEditedLearner(learner.id)}
                      >
                        <i className="fa-solid fa-save"></i>
                      </button>
                      <button 
                        className="cancel-btn" 
                        onClick={handleCancelEdit}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="view-btn"
                        onClick={() => navigate(`/admin/learners/${learner.id}`)}
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditLearner(learner)}
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      {learner.status === 'ACTIVE' ? (
                        <button 
                          className="block-btn" 
                          onClick={() => {
                            setItemToAction(learner);
                            setActionType('block');
                            setIsBlockModalOpen(true);
                          }}
                        >
                          <i className="fa-solid fa-ban"></i>
                        </button>
                      ) : (
                        <button 
                          className="unblock-btn" 
                          onClick={() => {
                            setItemToAction(learner);
                            setActionType('unblock');
                            setIsUnblockModalOpen(true);
                          }}
                        >
                          <i className="fa-solid fa-check-circle"></i>
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="no-data">
                No learners found
              </td>
            </tr>
          )}

          {showAddForm && (
            <tr className="add-learner-row">
              <td className="id-column">
                <div className="id-cell">
                  <span>New</span>
                </div>
              </td>
              <td className="avatar-column">
                <div className="avatar-placeholder">
                  <i className="fas fa-user-circle"></i>
                </div>
              </td>
              <td>{renderNewLearnerInput('fullname')}</td>
              <td>{renderNewLearnerInput('emailAddress', 'email')}</td>
              <td>{renderNewLearnerInput('phoneNumber', 'tel')}</td>
              <td>{renderNewLearnerInput('gender')}</td>
              <td>{renderNewLearnerInput('dateOfBirth', 'date')}</td>
              <td>{renderNewLearnerInput('status')}</td>
              <td>Will be set automatically</td>
              <td>
                <div className="password-field">
                  {renderNewLearnerInput('password', 'password')}
                </div>
                <div className="add-learner-actions">
                  <button 
                    className="save-btn" 
                    onClick={handleSaveNewLearner}
                  >
                    <i className="fa-solid fa-save"></i>
                  </button>
                  <button 
                    className="cancel-btn" 
                    onClick={handleCancelAdd}
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                </div>
              </td>
            </tr>
          )}
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
            disabled={currentPage === totalPages || totalPages === 0}
            className="page-btn"
          >
            Next
          </button>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="table-action-bar">
          <div className="action-bar-content">
            <span>{selectedItems.length} learners selected</span>
            <button 
              className="block-selected-btn"
              onClick={() => {
                setItemToAction(null);
                setActionType('block');
                setIsBlockModalOpen(true);
              }}
            >
              <i className="fas fa-ban"></i>
              Block Selected
            </button>
            <button 
              className="unblock-selected-btn"
              onClick={() => {
                setItemToAction(null);
                setActionType('unblock');
                setIsUnblockModalOpen(true);
              }}
            >
              <i className="fas fa-check-circle"></i>
              Unblock Selected
            </button>
          </div>
        </div>
      )}

      <BlockConfirmModal
        isOpen={isBlockModalOpen}
        onClose={() => {
          setIsBlockModalOpen(false);
          setItemToAction(null);
        }}
        onConfirm={() => {
          if (itemToAction) {
            handleBlockLearner(itemToAction.id);
          } else {
            handleBlockSelected();
          }
          setIsBlockModalOpen(false);
          setItemToAction(null);
        }}
        itemToBlock={itemToAction}
        selectedItems={selectedItems}
        action="block"
      />

      <BlockConfirmModal
        isOpen={isUnblockModalOpen}
        onClose={() => {
          setIsUnblockModalOpen(false);
          setItemToAction(null);
        }}
        onConfirm={() => {
          if (itemToAction) {
            handleUnblockLearner(itemToAction.id);
          } else {
            handleUnblockSelected();
          }
          setIsUnblockModalOpen(false);
          setItemToAction(null);
        }}
        itemToBlock={itemToAction}
        selectedItems={selectedItems}
        action="unblock"
      />
    </div>
  );
};

export default ManageLearner;