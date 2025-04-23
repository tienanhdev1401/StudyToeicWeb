import React, { useState, useEffect } from 'react';
import '../../styles/ManageStaff.css';
import staffService from '../../services/admin/admin.StaffService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BlockConfirmModal = ({ isOpen, onClose, onConfirm, itemToBlock, selectedItems, action }) => {
  if (!isOpen) return null;

  const isMultiAction = !itemToBlock;
  const actionText = action === 'block' ? 'block' : 'unblock';
  const message = isMultiAction
    ? `Are you sure you want to ${actionText} ${selectedItems.length} selected staff members?`
    : `Are you sure you want to ${actionText} staff "${itemToBlock.fullname}"?`;

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

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemToDelete, selectedItems }) => {
  if (!isOpen) return null;

  const isMultiDelete = !itemToDelete;
  const message = isMultiDelete
    ? `Are you sure you want to delete ${selectedItems.length} selected staff members?`
    : `Are you sure you want to delete staff "${itemToDelete.fullname}"?`;

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

const ManageStaff = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [staffList, setStaffList] = useState([]);
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToAction, setItemToAction] = useState(null);
  const [actionType, setActionType] = useState(''); // 'block' or 'unblock'

  // New Staff and Edit state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [newStaff, setNewStaff] = useState({
    fullname: '',
    emailAddress: '',
    phoneNumber: '',
    gender: 'MALE',
    role: 'staff',
    password: '',
    status: 'ACTIVE',
    dateOfBirth: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const entriesOptions = [5, 10, 25, 50, 100];
  const genderOptions = ['MALE', 'FEMALE', 'OTHER'];
  const roleOptions = ['staff'];

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        setIsLoading(true);
        const data = await staffService.getAllStaffs();
        setStaffList(data.filter(staff => staff.role !== 'USER'));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffs();
  }, []);

  const handleEntriesChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Filter data based on search term
  const filteredData = staffList.filter(staff =>
    (staff.avatar?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (staff.fullname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (staff.emailAddress?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (staff.phoneNumber || '').includes(searchTerm) ||
    (staff.dateOfBirth || '').includes(searchTerm)
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

  const handleBlockStaff = async (id) => {
    try {
      await staffService.blockStaff(id);
      setStaffList(staffList.map(staff => 
        staff.id === id ? { ...staff, status: 'BANNED' } : staff
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnblockStaff = async (id) => {
    try {
      await staffService.unblockStaff(id);
      setStaffList(staffList.map(staff => 
        staff.id === id ? { ...staff, status: 'ACTIVE' } : staff
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteStaff = async (id) => {
    try {
      await staffService.deleteStaff(id);
      setStaffList(staffList.filter(staff => staff.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBlockSelected = async () => {
    try {
      await Promise.all(selectedItems.map(id => staffService.blockStaff(id)));
      setStaffList(staffList.map(staff => 
        selectedItems.includes(staff.id) ? { ...staff, status: 'BANNED' } : staff
      ));
      setSelectedItems([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnblockSelected = async () => {
    try {
      await Promise.all(selectedItems.map(id => staffService.unblockStaff(id)));
      setStaffList(staffList.map(staff => 
        selectedItems.includes(staff.id) ? { ...staff, status: 'ACTIVE' } : staff
      ));
      setSelectedItems([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedItems.map(id => staffService.deleteStaff(id)));
      setStaffList(staffList.filter(staff => !selectedItems.includes(staff.id)));
      setSelectedItems([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddStaffClick = () => {
    setShowAddForm(true);
    setEditingStaffId(null);
    setFormErrors({});
    setNewStaff({
      fullname: '',
      emailAddress: '',
      phoneNumber: '',
      gender: 'MALE',
      role: 'STAFF',
      password: '',
      status: 'ACTIVE',
      dateOfBirth: ''
    });
    setTimeout(() => {
      window.scrollTo({
        top: document.querySelector('.staff-table').scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setFormErrors({});
  };

  const handleEditStaff = (staff) => {
    setShowAddForm(false);
    setEditingStaffId(staff.id);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setEditingStaffId(null);
    setFormErrors({});
  };

  const handleInputChange = (e, id = null) => {
    const { name, value } = e.target;
    
    if (id) {
      setStaffList(staffList.map(staff => 
        staff.id === id ? { ...staff, [name]: value } : staff
      ));
    } else {
      setNewStaff(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (staff) => {
    const errors = {};
    if (!staff.fullname?.trim()) errors.fullname = 'Full name is required';
    if (!staff.emailAddress?.trim()) errors.emailAddress = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(staff.emailAddress)) errors.emailAddress = 'Invalid email format';
    
    if (!staff.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required';
    else if (!/^\d{10,15}$/.test(staff.phoneNumber.replace(/\D/g, ''))) 
      errors.phoneNumber = 'Phone must be 10-15 digits';
    
    if (!staff.password && !editingStaffId) errors.password = 'Password is required';
    else if (staff.password && staff.password.length < 6) 
      errors.password = 'Password must be at least 6 characters';
    
    if (!staff.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    else {
      const dob = new Date(staff.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear(); // Changed from const to let
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--; // This reassignment is now valid
      }
      if (isNaN(dob.getTime())) errors.dateOfBirth = 'Invalid date format';
      else if (age < 18) errors.dateOfBirth = 'Staff must be at least 18 years old';
    }
    
    return errors;
  };

  const handleSaveNewStaff = async () => {
    const errors = validateForm(newStaff);
    console.log(newStaff);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }
    
    console.log('New Staff Data:', newStaff); // Debug log
    
    try {
      const createdStaff = await staffService.addStaff({
        ...newStaff,
        phoneNumber: newStaff.phoneNumber.replace(/\D/g, ''),
        dateOfBirth: newStaff.dateOfBirth
      });
      setStaffList([...staffList, {
        ...createdStaff,
        joinAt: new Date().toISOString()
      }]);
      setShowAddForm(false);
      setFormErrors({});
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveEditedStaff = async (id) => {
    const staffToUpdate = staffList.find(staff => staff.id === id);
    const originalStaff = staffList.find(staff => staff.id === id);
    
    // Tạo object với tất cả các trường
    const updateData = {
      ...staffToUpdate,
      phoneNumber: staffToUpdate.phoneNumber.replace(/\D/g, ''),
      // Chuyển đổi định dạng date trước khi gửi
      dateOfBirth: staffToUpdate.dateOfBirth 
        ? formatDateForMySQL(staffToUpdate.dateOfBirth) 
        : originalStaff.dateOfBirth
    };
  
    // Validate form
    const errors = validateForm(updateData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
  
    try {
      const updatedStaff = await staffService.updateStaff(id, updateData);
      setStaffList(staffList.map(staff => 
        staff.id === id ? { ...updatedStaff, joinAt: staff.joinAt } : staff
      ));
      setEditingStaffId(null);
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

  const renderEditableCell = (staff, field, type = 'text') => {
    const isEditing = staff.id === editingStaffId;
    const hasError = field in formErrors;
    
    if (!isEditing) {
      if (field === 'gender') {
        return staff[field];
      } else if (field === 'status') {
        return (
          <span className={`status-badge ${staff[field].toLowerCase()}`}>
            {staff[field]}
          </span>
        );
      } else if (field === 'role') {
        return (
          <span className={`role-badge ${staff[field].toLowerCase().replace('_', '-')}`}>
            {staff[field].replace('_', ' ')}
          </span>
        );
      } else if (field === 'dateOfBirth') {
        return staff[field] ? new Date(staff[field]).toLocaleDateString() : '';
      } else {
        return staff[field];
      }
    }
    
    if (field === 'gender') {
      return (
        <div className="editable-cell">
          <select
            name={field}
            value={staff[field]}
            onChange={(e) => handleInputChange(e, staff.id)}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
          >
            {genderOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {hasError && <span className="error-text">{formErrors[field]}</span>}
        </div>
      );
    } else if (field === 'role') {
      return (
        <div className="editable-cell">
          <select
            name={field}
            value={staff[field]}
            onChange={(e) => handleInputChange(e, staff.id)}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
          >
            {roleOptions.map(option => (
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
            value={staff[field]}
            onChange={(e) => handleInputChange(e, staff.id)}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="ACTIVE">ACTIVE</option>
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
            onChange={(e) => handleInputChange(e, staff.id)}
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
            value={staff[field] ? staff[field].split('T')[0] : ''}
            onChange={(e) => handleInputChange(e, staff.id)}
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
            value={staff[field] || ''}
            onChange={(e) => handleInputChange(e, staff.id)}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
          />
          {hasError && <span className="error-text">{formErrors[field]}</span>}
        </div>
      );
    }
  };

  const renderNewStaffInput = (field, type = 'text') => {
    const hasError = field in formErrors;
    const isRequired = ['fullname', 'emailAddress', 'phoneNumber', 'password', 'dateOfBirth'].includes(field);
    
    if (field === 'gender') {
      return (
        <div className="editable-cell">
          <select
            name={field}
            value={newStaff[field]}
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
    } else if (field === 'role') {
      return (
        <div className="editable-cell">
          <select
            name={field}
            value={newStaff[field]}
            onChange={handleInputChange}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
          >
            {roleOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {hasError && <span className="error-text">{formErrors[field]}</span>}
        </div>
      );
    }else if (field === 'role') {
      return (
        <div className="editable-cell">
          <select
            name={field}
            value={newStaff[field]}
            onChange={handleInputChange}
            className={`edit-input ${hasError ? 'input-error' : ''}`}
          >
            {roleOptions.map(option => (
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
            value={newStaff[field]}
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
            value={newStaff[field] || ''}
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
            value={newStaff[field] || ''}
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
    return <div className="loading">Loading staff members...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="staff-container">
      <h1>Manage Staff</h1>
      
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
          
          <button className="add-btn" onClick={handleAddStaffClick}>
            <i className="fas fa-plus"></i>
            Add New Staff
          </button>
        </div>
      </div>

      <table className="staff-table">
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
            <th onClick={() => handleSort('role')} className="sortable">
              Role
              <i className={`fas ${sortField === 'role' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map(staff => (
              <tr key={staff.id} className={editingStaffId === staff.id ? 'editing-row' : ''}>
                <td className="id-column">
                  <div className="id-cell">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(staff.id)}
                      onChange={() => handleSelectItem(staff.id)}
                      disabled={editingStaffId === staff.id}
                    />
                    <span>{staff.id}</span>
                  </div>
                </td>
                <td className="avatar-column">
                  {staff.avatar ? (
                    <img 
                      src={staff.avatar} 
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
                <td>{renderEditableCell(staff, 'fullname')}</td>
                <td>{renderEditableCell(staff, 'emailAddress', 'email')}</td>
                <td>{renderEditableCell(staff, 'phoneNumber', 'tel')}</td>
                <td>{renderEditableCell(staff, 'gender')}</td>
                <td>{renderEditableCell(staff, 'dateOfBirth', 'date')}</td>
                <td>{renderEditableCell(staff, 'status')}</td>
                <td>
                  {editingStaffId === staff.id ? (
                    'Cannot edit'
                  ) : (
                    new Date(staff.joinAt).toLocaleDateString()
                  )}
                </td>
                <td>{renderEditableCell(staff, 'role')}</td>
                <td>
                  {editingStaffId === staff.id ? (
                    <>
                      <button 
                        className="save-btn" 
                        onClick={() => handleSaveEditedStaff(staff.id)}
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
                        onClick={() => navigate(`/admin/staff/${staff.id}`)}
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditStaff(staff)}
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      {staff.status === 'ACTIVE' ? (
                        <button 
                          className="block-btn" 
                          onClick={() => {
                            setItemToAction(staff);
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
                            setItemToAction(staff);
                            setActionType('unblock');
                            setIsUnblockModalOpen(true);
                          }}
                        >
                          <i className="fa-solid fa-check-circle"></i>
                        </button>
                      )}
                      <button 
                        className="delete-btn" 
                        onClick={() => {
                          setItemToAction(staff);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="no-data">
                No staff members found
              </td>
            </tr>
          )}

          {showAddForm && (
            <tr className="add-staff-row">
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
              <td>{renderNewStaffInput('fullname')}</td>
              <td>{renderNewStaffInput('emailAddress', 'email')}</td>
              <td>{renderNewStaffInput('phoneNumber', 'tel')}</td>
              <td>{renderNewStaffInput('gender')}</td>
              <td>{renderNewStaffInput('dateOfBirth', 'date')}</td>
              <td>{renderNewStaffInput('status')}</td>
              <td>Will be set automatically</td>
              <td>{renderNewStaffInput('role')}</td>
              <td>
                <div className="password-field">
                  {renderNewStaffInput('password', 'password')}
                </div>
                <div className="add-staff-actions">
                  <button 
                    className="save-btn" 
                    onClick={handleSaveNewStaff}
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
            <span>{selectedItems.length} staff members selected</span>
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
RUBBER onClick={() => {
                setItemToAction(null);
                setActionType('unblock');
                setIsUnblockModalOpen(true);
              }}
            >
              <i className="fas fa-check-circle"></i>
              Unblock Selected
            </button>
            <button 
              className="delete-selected-btn"
              onClick={() => {
                setItemToAction(null);
                setIsDeleteModalOpen(true);
              }}
            >
              <i className="fas fa-trash"></i>
              Delete Selected
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
            handleBlockStaff(itemToAction.id);
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
            handleUnblockStaff(itemToAction.id);
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

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToAction(null);
        }}
        onConfirm={() => {
          if (itemToAction) {
            handleDeleteStaff(itemToAction.id);
          } else {
            handleDeleteSelected();
          }
          setIsDeleteModalOpen(false);
          setItemToAction(null);
        }}
        itemToDelete={itemToAction}
        selectedItems={selectedItems}
      />
    </div>
  );
};

export default ManageStaff;