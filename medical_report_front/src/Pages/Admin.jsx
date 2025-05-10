import React, { useEffect, useState } from 'react';
import '../Styles/Admin.css';
import Background from '../Components/Background';
import Back1 from '../assets/background.jpg';
import Back2 from '../assets/background2.jpg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminPage = () => {
  const arry = [Back1, Back2];
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const perPage = 3;

  const fetchUsers = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users?page=${page}&per_page=${perPage}&search=${search}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Failed to fetch users.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users/${selectedUser._id}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (res.ok) {
        toast.success('User deleted successfully.');
        fetchUsers();
        setSelectedUser(null);
      } else {
        toast.error(result.message || 'Failed to delete user.');
      }
    } catch (err) {
      toast.error('Error deleting user.');
    }
  };

  return (
    <div className="admin-container">


      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-btn">Search</button>
      </div>

      <div className="users-list">
        {users.length === 0 ? (
          <p style={{ position: "relative", top: "50px" }}>No users found.</p>
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
              <button className="delete-btn" onClick={() => handleDeleteClick(user)}>Delete</button>
            </div>
          ))
        )}
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
        <span style={{ position: "relative", left: "50px" }}>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)}>Next</button>
      </div>

      {/* ✅ Popup for delete confirmation */}
      {selectedUser && (
        <div className="popup-backdrop">
          <div className="popup-box">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <strong>{selectedUser.name}</strong>?</p>
            <div className="popup-actions">
              <button className="confirm-btn" onClick={confirmDelete}>Yes, Delete</button>
              <button className="cancel-btn" onClick={() => setSelectedUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
      <Background images={arry} />
    </div>
  );
};

export default AdminPage;
