import React, { useEffect, useState } from 'react';
import '../Styles/Admin.css';
import Background from '../Components/Background';
import Back1 from '../assets/background.jpg';
import Back2 from '../assets/background2.jpg';

const AdminPage = () => {
  const arry=[Back1,Back2];
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 3;

  const fetchUsers = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users?page=${page}&per_page=${perPage}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      alert('Error fetching users.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users/${userId}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (res.ok) {
        alert('User deleted successfully!');
        fetchUsers(); // Refresh list
      } else {
        alert(result.message || 'Failed to delete user.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting user.');
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard – Users</h1>
      <div className="users-list">
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((user) => (
            <div key={user._id} className="user-card">
              <img
                src={user.profile_pic || 'https://via.placeholder.com/100'}
                alt="Profile"
                className="user-image"
              />
              <div className="user-details">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {user.address || 'N/A'}</p>
                <p><strong>Age:</strong> {user.age || 'N/A'}</p>
              </div>
              <button className="delete-btn" onClick={() => deleteUser(user._id)}>Delete</button>
            </div>
          ))
        )}
      </div>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
        <span style={{position:"relative",left:"50px"}}>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
      <Background images={arry}/>
    </div>
  );
};

export default AdminPage;
