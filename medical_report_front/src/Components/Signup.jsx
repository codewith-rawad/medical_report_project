import React, { useState } from 'react';
import '../Styles/signup.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // استايل جاهز

const SignUp = ({ onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!', {
        position: 'top-center',
        theme: 'colored',
      });
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.message === "Doctor account created successfully") {
        toast.success('Sign up successful! 🎉', {
          position: 'top-center',
          theme: 'colored',
        });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast.error(`Error: ${data.message}`, {
          position: 'top-center',
          theme: 'colored',
        });
      }
    } catch (error) {
      toast.error('Something went wrong! 😓', {
        position: 'top-center',
        theme: 'colored',
      });
      console.error('Error:', error);
    }
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
        <button type="submit" className="modal-btn">Sign Up</button>
        <button type="button" onClick={onClose} className="close-btn modal-btn">Cancel</button>
      </form>

      {/* Toast container */}
      <ToastContainer />
    </div>
  );
};

export default SignUp;
