import React, { useEffect, useState } from 'react';
import '../Styles/Dashboard.css';

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    age: '',
    profile_pic: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [images, setImages] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(localUser);

    setFormData({
      phone: localUser.phone || '',
      address: localUser.address || '',
      age: localUser.age || '',
      profile_pic: localUser.profile_pic || ''
    });

    fetch(`/api/images/user/${localUser._id}`)
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.error(err));

    fetch(`/api/reports/user/${localUser._id}`)
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => console.error(err));
  }, []);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    try {
      const cleanData = {
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        age: formData.age.trim() || undefined,
        profile_pic: formData.profile_pic.trim() || undefined
      };

      const res = await fetch('http://127.0.0.1:5000/api/update_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cleanData, _id: user._id })
      });

      const result = await res.json();
      if (res.ok) {
        alert('Profile updated successfully!');
        const updatedUser = { ...user, ...cleanData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditMode(false);
      } else {
        alert(result.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating profile');
    }
  };

  return (
    <div className="page-container">
      <div className="profile-card">
        <img
          className="profile-pic"
          src={formData.profile_pic || 'https://via.placeholder.com/150'}
          alt="Profile"
        />
        <h1 className="username">Welcome, {user.name}</h1>
        <div className="info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>

          {editMode ? (
            <>
              <label>Phone:</label>
              <input name="phone" value={formData.phone} onChange={handleChange} />
              <label>Address:</label>
              <input name="address" value={formData.address} onChange={handleChange} />
              <label>Age:</label>
              <input name="age" type="number" value={formData.age} onChange={handleChange} />
              <label>Profile Picture URL:</label>
              <input name="profile_pic" value={formData.profile_pic} onChange={handleChange} />
              <button className="edit-btn" onClick={handleSave}>Save Profile</button>
            </>
          ) : (
            <>
              <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
              <p><strong>Address:</strong> {user.address || 'N/A'}</p>
              <p><strong>Age:</strong> {user.age || 'N/A'}</p>
              <button className="edit-btn" onClick={handleEdit}>Edit Profile</button>
            </>
          )}
        </div>
      </div>

      <div className="gallery-section">
        <h2>Your Medical Images</h2>
        {images.length === 0 ? (
          <p>No images uploaded yet.</p>
        ) : (
          <div className="image-grid">
            {images.map((img, idx) => (
              <div key={idx} className="image-card">
                <img src={img.url} alt={`medical-${idx}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="reports-section">
        <h2>Your Medical Reports</h2>
        {reports.length === 0 ? (
          <p>No reports available.</p>
        ) : (
          <div className="report-list">
            {reports.map((report, idx) => (
              <div key={idx} className="report-card">
                <h3>Report #{idx + 1}</h3>
                <p><strong>Date:</strong> {new Date(report.created_at).toLocaleDateString()}</p>
                <p>{report.content}</p>
                {report.image_url && (
                  <img className="report-img" src={report.image_url} alt="Associated" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
