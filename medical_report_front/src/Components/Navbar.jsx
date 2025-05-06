import React from 'react';
import { Link } from 'react-router-dom'; // استخدام Link للتوجيه
import '../Styles/Navbar.css';
import logo from "../assets/logo.png";

const Navbar = ({ onLoginClick, onSignupClick, isAuthenticated, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="logo">
        <img className="logo" src={logo} alt="Medical Logo" />
      </div>
      <ul className="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#gallery">Gallery</a></li>
        <li><a href="#contact">Contact</a></li>
        {isAuthenticated ? (
          <>
            <li><button onClick={onLogout}>Logout</button></li>
            <li><Link to="/user-profile">Profile</Link></li>
          </>
        ) : (
          <>
            <li><button onClick={onLoginClick}>Login</button></li>
            <li><button onClick={onSignupClick}>Sign Up</button></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
