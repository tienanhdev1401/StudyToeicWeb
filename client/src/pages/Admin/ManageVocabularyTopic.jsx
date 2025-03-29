import React, {useState} from 'react';
import  '../../styles/ManageVocabularyTopic.css';



const ManageVocabularyTopic = () => {
    
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [itemsPerPage, setItemsPerPage] = useState(5); // Change from const to state
    
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    
    const [selectedItems, setSelectedItems] = useState([]);
    
    // Thêm state để quản lý modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null); // Thêm state này

// Add entries options
  const entriesOptions = [5, 10, 25, 50, 100];

  const handleEntriesChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };
  
    // Dữ liệu mẫu
    const [vocabularyList, setVocabularyList] = useState([
      { id: 1, word: 'Computer', type: '100', definition: '100', status: 'Approved', date: '2025-03-28' },
      { id: 2, word: 'Develop', type: '100', definition: '100', status: 'Pending', date: '2025-03-28' },
      { id: 3, word: 'Efficient', type: '100', definition: '100', status: 'In Review', date: '2025-03-28' },
      { id: 4, word: 'Strategy', type: '100', definition: '100', status: 'Approved', date: '2025-03-28' },
      { id: 5, word: 'Implement', type: '100', definition: '100', status: 'Rejected', date: '2025-03-28' },
      { id: 6, word: 'Innovative', type: '100', definition: '100', status: 'Pending', date: '2025-03-28' },
      { id: 7, word: 'Computer', type: '100', definition: '100', status: 'Approved', date: '2025-03-28' },
      { id: 8, word: 'Develop', type: '100', definition: '100', status: 'Pending', date: '2025-03-28' },
      { id: 9, word: 'Efficient', type: '100', definition: '100', status: 'In Review', date: '2025-03-28' },
      { id: 10, word: 'Strategy', type: '100', definition: '100', status: 'Approved', date: '2025-03-28' },
      { id: 11, word: 'Implement', type: '100', definition: '100', status: 'Rejected', date: '2025-03-28' },
      { id: 12, word: 'Innovative', type: '100', definition: '100', status: 'Pending', date: '2025-03-28' },
    ]);
  
    // Xử lý tìm kiếm
    const filteredData = vocabularyList.filter(item =>
      item.word.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    // Tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
    // Add this sorting function
    const handleSort = (field) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    };
  
    // Add this function to sort the data
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
        : `Are you sure you want to delete "${itemToDelete.word}"?`;

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
                
          <button className="add-btn">
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
              <th onClick={() => handleSort('id')} className="sortable id-column">
                <div className="id-header">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    onClick={handleCheckboxClick}
                    checked={selectedItems.length === sortedData.length}
                  />
                  <span>STT</span>
                  <span className="sort-icons">
                    <i className={`fas ${sortField === 'id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                  </span>
                </div>
              </th>
              <th onClick={() => handleSort('word')} className="sortable">
                Topic name
                <span className="sort-icons">
                  <i className={`fas ${sortField === 'word' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                </span>
              </th>
              <th onClick={() => handleSort('type')} className="sortable">
                Number of words
                <span className="sort-icons">
                  <i className={`fas ${sortField === 'type' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                </span>
              </th>
              <th onClick={() => handleSort('definition')} className="sortable">
                Number of questions
                <span className="sort-icons">
                  <i className={`fas ${sortField === 'definition' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                </span>
              </th>
              <th onClick={() => handleSort('date')} className="sortable">
                Date created
                <span className="sort-icons">
                  <i className={`fas ${sortField === 'date' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : 'fa-sort'}`} />
                </span>
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
                <td>{item.word}</td>
                <td>{item.type}</td>
                <td>{item.definition}</td>
                <td>
                  <span className={item.date}>
                    {item.date}
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
          <div>
            <button 
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={currentPage === index + 1 ? 'active' : ''}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
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
      </div>
    );  
};   





export default ManageVocabularyTopic;