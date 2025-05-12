import React, { useState } from 'react';
import '../Styles/LoginModal.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginModal = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.token) {
     
        const userData = {
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          _id: data.user._id,
          phone: data.user.phone || '',
          address: data.user.address || '',
          age: data.user.age || '',
          profile_pic: data.user.profile_pic || ''
        };

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));

        toast.success('Login successful! 🎉', {
          position: 'top-center',
          theme: 'colored',
        });

        setTimeout(() => {
          onLoginSuccess(data.token);
          onClose();
        }, 2000);
      } else {
        toast.error('Invalid credentials ❌', {
          position: 'top-center',
          theme: 'colored',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong! 😢', {
        position: 'top-center',
        theme: 'colored',
      });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="modal-btn" type="submit">Login</button>
        </form>
        <button className="modal-btn close" onClick={onClose}>Close</button>
        <ToastContainer />
      </div>
    </div>
  );
};

export default LoginModal;
