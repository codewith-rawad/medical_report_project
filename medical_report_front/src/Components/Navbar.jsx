import React from 'react';
import { NavLink } from 'react-router-dom'; 
import '../Styles/Navbar.css';
import logo from "../assets/logo.png";

const Navbar = ({ onLoginClick, onSignupClick, isAuthenticated, onLogout, userRole }) => {
  return (
    <nav className="navbar">
      <div className="logo">
        <img className="logo" src={logo} alt="Medical Logo" />
      </div>
      <ul className="nav-links">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/About"
            className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}
          >
            About
          </NavLink>
        </li>
        <li>
          <NavLink
            to="Gallery"
            className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}
          >
            Gallery
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/Contact"
            className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}
          >
            Contact
          </NavLink>
        </li>

        {isAuthenticated ? (
          <>
            <li>
              <NavLink
                to={userRole === 'admin' ? "/admin" : "/user-profile"}
                className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}
              >
                Profile
              </NavLink>
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
