
import React from 'react';

const AdminPage = () => {
  const users = []; 

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Users List:</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
