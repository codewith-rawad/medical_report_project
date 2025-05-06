// UserProfile.js
import React from 'react';

const UserProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}'); // استرجاع بيانات المستخدم من الـ localStorage

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <img src={user.profilePic} alt="Profile" />
    </div>
  );
};

export default UserProfile;
