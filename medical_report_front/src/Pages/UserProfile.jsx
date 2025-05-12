import React, { useState, useEffect } from 'react';
import '../Styles/userProfile.css';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import Background from '../Components/Background';
import contact1 from '../assets/background2.jpg';
import contact2 from '../assets/contact2.jpg';

const UserProfile = () => {
  const arry = [contact1, contact2];
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    age: '',
    profile_pic: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(localUser);

    setFormData({
      phone: localUser.phone || '',
      address: localUser.address || '',
      age: localUser.age || '',
      profile_pic: localUser.profile_pic || ''
    });



 
  }, []);

  const handleEdit = () => {
    setShowPopup(true);
  };

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, profile_pic: reader.result }));
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const cleanData = {
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        age: formData.age.trim() || undefined,
        profile_pic: formData.profile_pic || undefined
      };

      const res = await fetch('http://127.0.0.1:5000/api/update_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cleanData, _id: user._id })
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Response text:", errorText);
        toast.error('Failed to update profile.', {
          position: 'top-center',
          theme: 'colored',
        });
        return;
      }

      if (contentType && contentType.includes("application/json")) {
        const result = await res.json();

        toast.success('Profile updated successfully! 🎉', {
          position: 'top-center',
          theme: 'colored',
        });

        const updatedUser = { ...user, ...cleanData };
        localStorage.setItem('user', JSON.stringify(updatedUser)); 
        setUser(updatedUser); 
        setShowPopup(false);
      } else {
        const text = await res.text();
        console.error("Expected JSON but received:", text);
        toast.error('Unexpected response format.', {
          position: 'top-center',
          theme: 'colored',
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating profile', {
        position: 'top-center',
        theme: 'colored',
      });
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="page-container">
      <h1 className="username">Welcome, {user.name}</h1>
      <div className="profile-card">
        <img
          className="profile-pic"
          src={formData.profile_pic || 'https://via.placeholder.com/150'}
          alt="Profile"
        />
        <div className="info">
          {!editMode ? (
            <>
              <div className="first">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
              </div>
              <div className="second">
                <p><strong>Age:</strong> {user.age || 'N/A'}</p>
                <p><strong>Address:</strong> {user.address || 'N/A'}</p>
              </div>

              <button className="edit-btn" onClick={handleEdit}>Edit Profile</button>
              <div className="two_button">
                <button className="my-report-btn">My Reports</button>
                <button className="my-xrays">My Images</button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content animate-popup">
            <h2>Edit Profile</h2>
            <label>Phone:</label>
            <input name="phone" value={formData.phone} onChange={handleChange} />
            <label>Address:</label>
            <input name="address" value={formData.address} onChange={handleChange} />
            <label>Age:</label>
            <input name="age" type="number" value={formData.age} onChange={handleChange} />
            <label>Profile Picture:</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <button className="save-btn" onClick={handleSave}>Save</button>
            <button className="cancel-btn" onClick={handleClosePopup}>Cancel</button>
          </div>
        </div>
      )}

      <Background images={arry} />
    </div>
  );
};

export default UserProfile;
