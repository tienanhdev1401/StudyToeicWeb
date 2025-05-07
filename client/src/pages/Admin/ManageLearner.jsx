import React, { useState, useEffect } from 'react';
import '../../styles/ManageLearner.css';
import learnerService from '../../services/admin/admin.LearnerService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ResetPasswordModal = ({ isOpen, onClose, onConfirm, learner }) => {
  if (!isOpen) return null;

  return (
    <div className="learner-modal-overlay">
      <div className="learner-modal-content">
        <div className="learner-modal-header">
          <h2>Reset Password</h2>
          <button className="learner-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="learner-modal-body">
          <p>Bạn có chắc chắn muốn đặt lại mật khẩu cho học viên "{learner.fullname}"?</p>
          <p>Mật khẩu tạm thời của học viên là :123456789</p>
        </div>
        <div className="learner-modal-footer">
          <button className="learner-cancel-btn" onClick={onClose}>Hủy</button>
          <button className="learner-confirm-reset-btn" onClick={onConfirm}>
            <i className="fas fa-key"></i>
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
};

const BlockConfirmModal = ({ isOpen, onClose, onConfirm, itemToBlock, selectedItems, action }) => {
  if (!isOpen) return null;

  const isMultiAction = !itemToBlock;
  const actionText = action === 'block' ? 'block' : 'unblock';
  const message = isMultiAction
    ? `Are you sure you want to ${actionText} ${selectedItems.length} selected learners?`
    : `Are you sure you want to ${actionText} learner "${itemToBlock.fullname}"?`;

  return (
    <div className="learner-modal-overlay">
      <div className="learner-modal-content">
        <div className="learner-modal-header">
          <h2>Confirm {action === 'block' ? 'Block' : 'Unblock'}</h2>
          <button className="learner-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="learner-modal-body">
          <p>{message}</p>
        </div>
        <div className="learner-modal-footer">
          <button className="learner-cancel-btn" onClick={onClose}>Cancel</button>
          <button className={`learner-confirm-${action}-btn`} onClick={onConfirm}>
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
  const [successMessage, setSuccessMessage] = useState(null);
  
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
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
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
      if (isNaN(dob.getTime())) errors.dateOfBirth = 'Invalid date format';
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
          <span className={`learner-status-badge learner-${learner[field]}`}>
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
        <div className="learner-editable-cell">
          <select
            name={field}
            value={learner[field]}
            onChange={(e) => handleInputChange(e, learner.id)}
            className={`learner-edit-input ${hasError ? 'learner-input-error' : ''}`}
          >
            {genderOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {hasError && <span className="learner-error-text">{formErrors[field]}</span>}
        </div>
      );
    } else if (field === 'status') {
      return (
        <div className="learner-editable-cell">
          <select
            name={field}
            value={learner[field]}
            onChange={(e) => handleInputChange(e, learner.id)}
            className={`learner-edit-input ${hasError ? 'learner-input-error' : ''}`}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="BANNED">BANNED</option>
          </select>
          {hasError && <span className="learner-error-text">{formErrors[field]}</span>}
        </div>
      );
    } else if (field === 'password') {
      return (
        <div className="learner-editable-cell">
          <input
            type="password"
            name={field}
            placeholder="Enter new password (optional)"
            onChange={(e) => handleInputChange(e, learner.id)}
            className={`learner-edit-input ${hasError ? 'learner-input-error' : ''}`}
          />
          {hasError && <span className="learner-error-text">{formErrors[field]}</span>}
        </div>
      );
    } else if (field === 'dateOfBirth') {
      return (
        <div className="learner-editable-cell">
          <input
            type="date"
            name={field}
            value={learner[field] ? learner[field].split('T')[0] : ''}
            onChange={(e) => handleInputChange(e, learner.id)}
            className={`learner-edit-input ${hasError ? 'learner-input-error' : ''}`}
          />
          {hasError && <span className="learner-error-text">{formErrors[field]}</span>}
        </div>
      );
    } else {
      return (
        <div className="learner-editable-cell">
          <input
            type={type}
            name={field}
            value={learner[field] || ''}
            onChange={(e) => handleInputChange(e, learner.id)}
            className={`learner-edit-input ${hasError ? 'learner-input-error' : ''}`}
          />
          {hasError && <span className="learner-error-text">{formErrors[field]}</span>}
        </div>
      );
    }
  };

  const renderNewLearnerInput = (field, type = 'text') => {
    const hasError = field in formErrors;
    const isRequired = ['fullname', 'emailAddress', 'phoneNumber', 'password', 'dateOfBirth'].includes(field);
    
    if (field === 'gender') {
      return (
        <div className="learner-editable-cell">
          <select
            name={field}
            value={newLearner[field]}
            onChange={handleInputChange}
            className={`learner-edit-input ${hasError ? 'learner-input-error' : ''}`}
          >
            {genderOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {hasError && <span className="learner-error-text">{formErrors[field]}</span>}
        </div>
      );
    } else if (field === 'status') {
      return (
        <div className="learner-editable-cell">
          <select
            name={field}
            value={newLearner[field]}
            onChange={handleInputChange}
            className={`learner-edit-input ${hasError ? 'learner-input-error' : ''}`}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="BANNED">BANNED</option>
          </select>
          {hasError && <span className="learner-error-text">{formErrors[field]}</span>}
        </div>
      );
    } else if (field === 'dateOfBirth') {
      return (
        <div className="learner-editable-cell">
          <input
            type="date"
            name={field}
            value={newLearner[field] || ''}
            onChange={handleInputChange}
            className={`learner-edit-input ${hasError ? 'learner-input-error' : ''}`}
            placeholder="Select date of birth*"
            required={isRequired}
          />
          {hasError && <span className="learner-error-text">{formErrors[field]}</span>}
        </div>
      );
    } else {
      return (
        <div className="learner-editable-cell">
          <input
            type={type}
            name={field}
            value={newLearner[field] || ''}
            onChange={handleInputChange}
            className={`learner-edit-input ${hasError ? 'learner-input-error' : ''}`}
            placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}${isRequired ? '*' : ''}`}
            required={isRequired}
          />
          {hasError && <span className="learner-error-text">{formErrors[field]}</span>}
        </div>
      );
    }
  };

  const handleResetPassword = async (id) => {
    try {
      await learnerService.resetLearnerPassword(id);
      setError(null);
      setSuccessMessage("Password has been reset successfully. A temporary password has been sent to the learner's email.");
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err.message);
      setSuccessMessage(null);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  if (isLoading) {
    return <div className="learner-loading"><i className="fas fa-spinner fa-spin"></i> Loading learners...</div>;
  }

  if (error) {
    return <div className="learner-error">Error: {error}</div>;
  }

  return (
    <div className="learner-container">
      <h1 className="learner-h1">Manage Learners</h1>
      
      {successMessage && (
        <div className="learner-success">
          <i className="fas fa-check-circle"></i>
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="learner-header-section">
        <div className="learner-entries-select">
          <span>Show </span>
          <select 
            value={itemsPerPage} 
            onChange={handleEntriesChange}
            className="learner-entries-dropdown"
          >
            {entriesOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>

        <div className="learner-action-section">
          <div className="learner-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by name, email, phone or DOB..."
              className="learner-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="learner-button-group">
            <button className="learner-add-btn" onClick={handleAddLearnerClick}>
              <i className="fas fa-plus"></i>
              Add New Learner
            </button>
          </div>
        </div>
      </div>

      <div className="learner-table-container">
        <table className="learner-table">
          <thead>
            <tr>
              <th className="learner-id-column">
                <div className="learner-id-header">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedItems.length === sortedData.length && sortedData.length > 0}
                    onClick={handleCheckboxClick}
                  />
                  <span onClick={() => handleSort('id')} className="learner-sortable">
                    ID
                    <i className={`fas ${sortField === 'id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                  </span>
                </div>
              </th>
              <th className="learner-avatar-column">
                Avatar
              </th>
              <th className="learner-fullname-column learner-sortable" onClick={() => handleSort('fullname')}>
                Full Name
                <i className={`fas ${sortField === 'fullname' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </th>
              <th className="learner-email-column learner-sortable" onClick={() => handleSort('emailAddress')}>
                Email
                <i className={`fas ${sortField === 'emailAddress' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </th>
              <th className="learner-phone-column learner-sortable" onClick={() => handleSort('phoneNumber')}>
                Phone
                <i className={`fas ${sortField === 'phoneNumber' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </th>
              <th className="learner-gender-column learner-sortable" onClick={() => handleSort('gender')}>
                Gender
                <i className={`fas ${sortField === 'gender' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </th>
              <th className="learner-dob-column learner-sortable" onClick={() => handleSort('dateOfBirth')}>
                Date of Birth
                <i className={`fas ${sortField === 'dateOfBirth' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </th>
              <th className="learner-status-column learner-sortable" onClick={() => handleSort('status')}>
                Status
                <i className={`fas ${sortField === 'status' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </th>
              <th className="learner-joined-column learner-sortable" onClick={() => handleSort('joinAt')}>
                Joined At
                <i className={`fas ${sortField === 'joinAt' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
              </th>
              <th className="learner-action-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(learner => (
                <tr key={learner.id} className={editingLearnerId === learner.id ? 'learner-editing-row' : ''}>
                  <td className="learner-id-column">
                    <div className="learner-id-cell">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(learner.id)}
                        onChange={() => handleSelectItem(learner.id)}
                        disabled={editingLearnerId === learner.id}
                        onClick={handleCheckboxClick}
                      />
                      <span>{learner.id}</span>
                    </div>
                  </td>
                  <td className="learner-avatar-column">
                    {learner.avatar ? (
                      <img 
                        src={learner.avatar} 
                        alt="Avatar" 
                        className="learner-avatar-img"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                    ) : (
                      <div className="learner-avatar-placeholder">
                        <i className="fas fa-user-circle"></i>
                      </div>
                    )}
                  </td>
                  <td className="learner-fullname-column">{renderEditableCell(learner, 'fullname')}</td>
                  <td className="learner-email-column">{renderEditableCell(learner, 'emailAddress', 'email')}</td>
                  <td className="learner-phone-column">{renderEditableCell(learner, 'phoneNumber', 'tel')}</td>
                  <td className="learner-gender-column">{renderEditableCell(learner, 'gender')}</td>
                  <td className="learner-dob-column">{renderEditableCell(learner, 'dateOfBirth', 'date')}</td>
                  <td className="learner-status-column">{renderEditableCell(learner, 'status')}</td>
                  <td className="learner-joined-column">
                    {editingLearnerId === learner.id ? (
                      'Cannot edit'
                    ) : (
                      new Date(learner.joinAt).toLocaleDateString()
                    )}
                  </td>
                  <td className="learner-action-column">
                    {editingLearnerId === learner.id ? (
                      <>
                        <button 
                          className="learner-save-btn" 
                          onClick={() => handleSaveEditedLearner(learner.id)}
                        >
                          <i className="fas fa-save"></i>
                        </button>
                        <button 
                          className="learner-cancel-edit-btn" 
                          onClick={handleCancelEdit}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="learner-edit-btn"
                          onClick={() => handleEditLearner(learner)}
                        >
                          <i className="fas fa-pen-to-square"></i>
                        </button>
                        <button 
                          className="learner-reset-password-btn" 
                          onClick={() => {
                            setItemToAction(learner);
                            setIsResetPasswordModalOpen(true);
                          }}
                        >
                          <i className="fas fa-key"></i>
                        </button>
                        {learner.status === 'ACTIVE' ? (
                          <button 
                            className="learner-block-btn" 
                            onClick={() => {
                              setItemToAction(learner);
                              setActionType('block');
                              setIsBlockModalOpen(true);
                            }}
                          >
                            <i className="fas fa-ban"></i>
                          </button>
                        ) : (
                          <button 
                            className="learner-unblock-btn" 
                            onClick={() => {
                              setItemToAction(learner);
                              setActionType('unblock');
                              setIsUnblockModalOpen(true);
                            }}
                          >
                            <i className="fas fa-check-circle"></i>
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="learner-empty-message">
                  No learners found
                </td>
              </tr>
            )}

            {showAddForm && (
              <tr className="learner-add-learner-row">
                <td className="learner-id-column">
                  <div className="learner-id-cell">
                    <span>New</span>
                  </div>
                </td>
                <td className="learner-avatar-column">
                  <div className="learner-avatar-placeholder">
                    <i className="fas fa-user-circle"></i>
                  </div>
                </td>
                <td className="learner-fullname-column">{renderNewLearnerInput('fullname')}</td>
                <td className="learner-email-column">{renderNewLearnerInput('emailAddress', 'email')}</td>
                <td className="learner-phone-column">{renderNewLearnerInput('phoneNumber', 'tel')}</td>
                <td className="learner-gender-column">{renderNewLearnerInput('gender')}</td>
                <td className="learner-dob-column">{renderNewLearnerInput('dateOfBirth', 'date')}</td>
                <td className="learner-status-column">{renderNewLearnerInput('status')}</td>
                <td className="learner-joined-column">Will be set automatically</td>
                <td className="learner-action-column">
                  <div className="learner-password-field">
                    {renderNewLearnerInput('password', 'password')}
                  </div>
                  <div className="learner-add-learner-actions">
                    <button 
                      className="learner-save-btn" 
                      onClick={handleSaveNewLearner}
                    >
                      <i className="fas fa-save"></i>
                    </button>
                    <button 
                      className="learner-cancel-btn" 
                      onClick={handleCancelAdd}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="learner-pagination">
        <span>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
        </span>
        <div className="learner-pagination-buttons">
          <button 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="learner-page-btn"
          >
            Previous
          </button>
          
          {getPageNumbers(currentPage, totalPages).map((item, index) => (
            item === '...' ? (
              <span key={`dots-${index}`} className="learner-page-dots">...</span>
            ) : (
              <button
                key={item}
                onClick={() => setCurrentPage(item)}
                className={`learner-page-btn ${currentPage === item ? 'active' : ''}`}
              >
                {item}
              </button>
            )
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="learner-page-btn"
          >
            Next
          </button>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="learner-table-action-bar">
          <div className="learner-action-bar-content">
            <span>{selectedItems.length} learners selected</span>
            <div>
              <button 
                className="learner-block-selected-btn"
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
                className="learner-unblock-selected-btn"
                onClick={() => {
                  setItemToAction(null);
                  setActionType('unblock');
                  setIsUnblockModalOpen(true);
                }}
                style={{marginLeft: '8px'}}
              >
                <i className="fas fa-check-circle"></i>
                Unblock Selected
              </button>
            </div>
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

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => {
          setIsResetPasswordModalOpen(false);
          setItemToAction(null);
        }}
        onConfirm={() => {
          if (itemToAction) {
            handleResetPassword(itemToAction.id);
          }
          setIsResetPasswordModalOpen(false);
          setItemToAction(null);
        }}
        learner={itemToAction || {}}
      />
    </div>
  );
};

export default ManageLearner;