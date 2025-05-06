import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Home from '../src/Pages/Home';
import UserProfile from '../src/Pages/UserProfile';
import AdminPage from '../src/Pages/Admin';
import LoginModal from '../src/Components/LoginModal';
import Navbar from '../src/Components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');  
  const [tokenExpiration, setTokenExpiration] = useState(null);  
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserRole('');
        setTokenExpiration(null);
        alert('Session expired');
      } else {
        setIsAuthenticated(true);
        setUserRole(decodedToken.role);
        setTokenExpiration(decodedToken.exp);  
      }
    }
  }, []);

  const onLoginSuccess = (token) => {
    localStorage.setItem('token', token);  
    const decodedToken = jwtDecode(token);
    setIsAuthenticated(true);
    setUserRole(decodedToken.role);
    setTokenExpiration(decodedToken.exp);
    setShowLogin(false);
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole('');
    setTokenExpiration(null);
  };

  return (
    <Router>
      <Navbar 
        isAuthenticated={isAuthenticated} 
        onLogout={onLogout}
        onLoginClick={() => setShowLogin(true)}
      />
      
      {showLogin && (
        <LoginModal 
          onLoginSuccess={onLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/user-profile"
          element={
            isAuthenticated && userRole === 'user' ? (
              <UserProfile />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin"
          element={
            isAuthenticated && userRole === 'admin' ? (
              <AdminPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        {/* أي مسار غير معروف */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
