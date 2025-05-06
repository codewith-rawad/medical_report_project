import React from 'react';
import { Link } from 'react-router-dom'; 
import '../Styles/Navbar.css';
import logo from "../assets/logo.png";

const Navbar = ({ onLoginClick, onSignupClick, isAuthenticated, onLogout, userRole }) => {
  return (
    <nav className="navbar">
      <div className="logo">
        <img className="logo" src={logo} alt="Medical Logo" />
      </div>
      <ul className="nav-links">
        <li> <Link to= "/">
                Home
              </Link></li>
        <li><a href="#about">About</a></li>
        <li><a href="#gallery">Gallery</a></li>
        <li><a href="#contact">Contact</a></li>
        {isAuthenticated ? (
          <>
           
            <li>
              <Link to={userRole === 'admin' ? "/admin" : "/user-profile"}>
                Profile
              </Link>
            </li>
            <li><button onClick={onLogout}>Logout</button></li>
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
