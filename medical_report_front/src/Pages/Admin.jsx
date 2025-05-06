import React from 'react';
import '../Styles/Dashboard.css';

const AdminPage = () => {
  const users = []; 

  return (
    <div className="page-container">
      <h1 className="page-header">Admin Dashboard</h1>
      <div className="user-list">
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="user-item">
              {user.name} - {user.email}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPage;