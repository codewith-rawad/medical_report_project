
import React from 'react';
import '../Styles/Dashboard.css';

const UserProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="page-container">
      <h1 className="page-header">Welcome, {user.name}</h1>
      <div className="user-list">
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <img className="profile-pic" src={user.profilePic} alt="Profile" />
      </div>
    </div>
  );
};

export default UserProfile;
