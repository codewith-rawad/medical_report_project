import React from 'react';
import '../Styles/LoginModal.css';

const LoginModal = ({ onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Login</h2>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button className="modal-btn">Login</button>
        <button className="modal-btn close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default LoginModal;
