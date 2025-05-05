import React, { useState } from 'react';
import '../Styles/signup.css';

const SignUp = ({ onClose }) => {
    
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    console.log('Registered:', formData);
    alert("Sign up successful!");
    onClose();
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <input 
          type="text" 
          name="username" 
          placeholder="Username" 
          value={formData.username}
          onChange={handleChange}
          required 
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email}
          onChange={handleChange}
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={formData.password}
          onChange={handleChange}
          required 
        />
        <input 
          type="password" 
          name="confirmPassword" 
          placeholder="Confirm Password" 
          value={formData.confirmPassword}
          onChange={handleChange}
          required 
        />
        <button type="submit" className='modal-btn'>Sign Up</button>
        <button type="button" onClick={onClose} className="close-btn modal-btn">Cancel</button>
      </form>
 
    </div>
  );
};

export default SignUp;
