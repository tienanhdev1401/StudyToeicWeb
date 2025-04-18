import React, { useState } from 'react';
import '../../styles/ManageLearner.css';

const ManageLearner = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const entriesOptions = [5, 10, 25, 50, 100];

  const handleEntriesChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const [learnerList, setLearnerList] = useState([
    {
      id: 1,
      avatar: '',
      dateOfBirth: '1998-04-12',
      emailAddress: 'john@example.com',
      fullname: 'John Doe',
      gender: 'MALE',
      joinAt: '2023-05-01',
      phoneNumber: '1234567890',
      status: 'ACTIVE',
      role: 'LEARNER',
    },
    {
      id: 2,
      avatar: '',
      dateOfBirth: '2000-09-23',
      emailAddress: 'jane@example.com',
      fullname: 'Jane Smith',
      gender: 'FEMALE',
      joinAt: '2024-01-15',
      phoneNumber: '0987654321',
      status: 'BANNED',
      role: 'LEARNER',
    },
    {
      id: 3,
      avatar: '',
      dateOfBirth: '2000-09-23',
      emailAddress: 'jane@example.com',
      fullname: 'Jane Smith',
      gender: 'FEMALE',
      joinAt: '2024-01-15',
      phoneNumber: '0987654321',
      status: 'BANNED',
      role: 'LEARNER',
    },
    {
      id: 4,
      avatar: '',
      dateOfBirth: '2000-09-23',
      emailAddress: 'jane@example.com',
      fullname: 'Jane Smith',
      gender: 'FEMALE',
      joinAt: '2024-01-15',
      phoneNumber: '0987654321',
      status: 'BANNED',
      role: 'LEARNER',
    },
    {
      id: 5,
      avatar: '',
      dateOfBirth: '2000-09-23',
      emailAddress: 'jane@example.com',
      fullname: 'Jane Smith',
      gender: 'FEMALE',
      joinAt: '2024-01-15',
      phoneNumber: '0987654321',
      status: 'BANNED',
      role: 'LEARNER',
    },
    {
      id: 6,
      avatar: '',
      dateOfBirth: '2000-09-23',
      emailAddress: 'jane@example.com',
      fullname: 'Jane Smith',
      gender: 'FEMALE',
      joinAt: '2024-01-15',
      phoneNumber: '0987654321',
      status: 'BANNED',
      role: 'LEARNER',
    },
    {
      id: 7,
      avatar: '',
      dateOfBirth: '2000-09-23',
      emailAddress: 'jane@example.com',
      fullname: 'Jane Smith',
      gender: 'FEMALE',
      joinAt: '2024-01-15',
      phoneNumber: '0987654321',
      status: 'BANNED',
      role: 'LEARNER',
    },
    {
      id: 8,
      avatar: '',
      dateOfBirth: '2000-09-23',
      emailAddress: 'jane@example.com',
      fullname: 'Jane Smith',
      gender: 'FEMALE',
      joinAt: '2024-01-15',
      phoneNumber: '0987654321',
      status: 'BANNED',
      role: 'LEARNER',
    },{
      id: 9,
      avatar: '',
      dateOfBirth: '2000-09-23',
      emailAddress: 'jane@example.com',
      fullname: 'Jane Smith',
      gender: 'FEMALE',
      joinAt: '2024-01-15',
      phoneNumber: '0987654321',
      status: 'BANNED',
      role: 'LEARNER',
    },
    {
      id: 10,
      avatar: '',
      dateOfBirth: '2000-09-23',
      emailAddress: 'jane@example.com',
      fullname: 'Jane Smith',
      gender: 'FEMALE',
      joinAt: '2024-01-15',
      phoneNumber: '0987654321',
      status: 'BANNED',
      role: 'LEARNER',
    },
    {
      id: 11,
      avatar: '',
      dateOfBirth: '2000-09-23',
      emailAddress: 'jane@example.com',
      fullname: 'Jane Smith',
      gender: 'FEMALE',
      joinAt: '2024-01-15',
      phoneNumber: '0987654321',
      status: 'BANNED',
      role: 'LEARNER',
    },
    {
      id: 12,
      avatar: '',
      dateOfBirth: '2000-09-23',
      emailAddress: 'jane@example.com',
      fullname: 'Jane Smith',
      gender: 'FEMALE',
      joinAt: '2024-01-15',
      phoneNumber: '0987654321',
      status: 'BANNED',
      role: 'LEARNER',
    },
  ]);

  // Xử lý tìm kiếm
  const filteredData = learnerList.filter(item =>
    item.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.emailAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

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

  const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemToDelete, selectedItems }) => {
    if (!isOpen) return null;

    const isMultiDelete = !itemToDelete;
    const message = isMultiDelete
      ? `Are you sure you want to delete ${selectedItems.length} selected items?`
      : `Are you sure you want to delete "${itemToDelete.fullname}"?`;

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

  return (
    <div className="learner-container">
      <h1>Manage Learner</h1>
      <div className="pagination">
        <div className="entries-select">
          <p>Show </p>
          <select value={itemsPerPage} onChange={handleEntriesChange}>
            {entriesOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <p>entries </p>
        </div>

        <div className="action-section">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-btn">
            <i className="fas fa-plus"></i>
            Add New Learner
          </button>
        </div>
      </div>

      <table className="learner-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')} className="sortable">
              <input type="checkbox" onChange={handleSelectAll} onClick={handleCheckboxClick} checked={selectedItems.length === sortedData.length} />
              ID
            </th>
            <th onClick={() => handleSort('fullname')} className="sortable">Full Name</th>
            <th onClick={() => handleSort('emailAddress')} className="sortable">Email</th>
            <th>Phone</th>
            <th>Gender</th>
            <th>Status</th>
            <th>Joined At</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map(item => (
            <tr key={item.id}>
              <td>
                <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} />
                {item.id}
              </td>
              <td>{item.fullname}</td>
              <td>{item.emailAddress}</td>
              <td>{item.phoneNumber}</td>
              <td>{item.gender}</td>
              <td>{item.status}</td>
              <td>{item.joinAt}</td>
              <td>{item.role}</td>
              <td>
                <button className="view-btn"><i className="fa-solid fa-eye"></i></button>
                <button className="edit-btn"><i className="fa-solid fa-pen-to-square"></i></button>
                <button className="delete-btn" onClick={() => { setItemToDelete(item); setIsDeleteModalOpen(true); }}><i className="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <span>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
        </span>
        <div>
          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
          {[...Array(totalPages)].map((_, index) => (
            <button key={index} onClick={() => setCurrentPage(index + 1)} className={currentPage === index + 1 ? 'active' : ''}>{index + 1}</button>
          ))}
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="table-action-bar">
          <div className="action-bar-content">
            <span>{selectedItems.length} items selected</span>
            <button className="delete-selected-btn" onClick={() => { setItemToDelete(null); setIsDeleteModalOpen(true); }}>
              <i className="fas fa-trash"></i>
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
        onConfirm={() => {
          if (itemToDelete) {
            console.log("Deleting single item:", itemToDelete);
          } else {
            console.log("Deleting multiple items:", selectedItems);
          }
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        itemToDelete={itemToDelete}
        selectedItems={selectedItems}
      />
    </div>
  );
};

export default ManageLearner;
