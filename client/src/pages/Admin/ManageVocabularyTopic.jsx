import React, {useState} from 'react';
import  '../../styles/ManageVocabularyTopic.module.css';



const ManageVocabularyTopic = () => {
    const [employees, setEmployees] = useState([
        {
          name: 'Lindsey Curtis',
          email: 'demoemail@gmail.com',
          position: 'Sales Assistant',
          salary: 89500,
          office: 'Edinburgh',
          status: 'Hired'
        },
        {
          name: 'Kaiya George',
          email: 'demoemail@gmail.com',
          position: 'Chief Executive Officer',
          salary: 105000,
          office: 'London',
          status: 'In Progress'
        },
        {
          name: 'Zain Geidt',
          email: 'demoemail@gmail.com',
          position: 'Junior Technical Author',
          salary: 120000,
          office: 'San Francisco',
          status: 'In Progress'
        },
        {
          name: 'Abram Schleifer',
          email: 'demoemail@gmail.com',
          position: 'Software Engineer',
          salary: 95000,
          office: 'New York',
          status: 'Hired'
        },
        {
          name: 'Carla George',
          email: 'demoemail@gmail.com',
          position: 'Integration Specialist',
          salary: 80000,
          office: 'Chicago',
          status: 'Pending'
        }
      ]);

      const getStatusClass = (status) => {
        switch(status) {
          case 'Hired': return 'status-hired';
          case 'In Progress': return 'status-in-progress';
          case 'Pending': return 'status-pending';
          default: return '';
        }
      };

    return (
        <div className="employee-table-container">
        <div className="table-header">
            <div className="entries-selector">
                <span>Show</span>
                <select>
                <option>5</option>
                <option>10</option>
                <option>20</option>
                </select>
                <span>entries</span>
            </div>
            <div className="searchContainer">
                <i className="fas fa-search"></i>
                <input 
                    type="text" 
                    placeholder="Search or type command..." 
                    className="searchInput"
                />
            </div>
        </div>
        
        <table className="employee-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" />
                User
              </th>
              <th>Position</th>
              <th>Salary</th>
              <th>Office</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr key={index}>
                <td>
                  <input type="checkbox" />
                  <div className="user-info">
                    <span className="user-name">{employee.name}</span>
                    <span className="user-email">{employee.email}</span>
                  </div>
                </td>
                <td>{employee.position}</td>
                <td>${employee.salary.toLocaleString()}</td>
                <td>{employee.office}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(employee.status)}`}>
                    {employee.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="delete-btn">🗑️</button>
                    <button className="edit-btn">✏️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="table-footer">
          <span>Showing 1 to 5 of 10 entries</span>
          <div className="pagination">
            <button>Previous</button>
            <button className="active">1</button>
            <button>2</button>
            <button>Next</button>
          </div>
        </div>
      </div>
    );  
};   





export default ManageVocabularyTopic;