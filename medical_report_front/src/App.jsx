import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Home from '../src/Pages/Home';
import UserProfile from '../src/Pages/UserProfile';
import AdminPage from '../src/Pages/Admin';
import LoginModal from '../src/Components/LoginModal';
import Navbar from '../src/Components/Navbar';
import SignUp from './Components/Signup';
import About from './Pages/ِAbout';
import Contact from "./Pages/Contact";
import Gallery from './Pages/Gallery';
import GenerateKeywords from './Pages/generate_report';
import AddPatient from './Pages/Patient';
import PatientsList from './Pages/patientsList';
import PatientDetail from './Pages/patientDetails';
import MedicalConditions from './Pages/MedicalConditions';
import "../src/App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [tokenExpiration, setTokenExpiration] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUserRole('');
          setTokenExpiration(null);
          alert("Please log in again because your session has ended.");
        } else {
          setIsAuthenticated(true);
          setUserRole(decodedToken.role);
          setTokenExpiration(decodedToken.exp);
        }
      } catch (err) {
        // إذا التوكن غير صالح أو تالف
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserRole('');
        setTokenExpiration(null);
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

  const onSignupClick = () => {
    setShowSignup(true);
  };

  return (
    <Router>
      <Navbar 
        isAuthenticated={isAuthenticated} 
        onLogout={onLogout}
        onLoginClick={() => setShowLogin(true)}
        onSignupClick={onSignupClick}
        userRole={userRole}
      />

      {showLogin && (
        <LoginModal 
          onLoginSuccess={onLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showSignup && (
        <SignUp
          onClose={() => setShowSignup(false)}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/About" element={<About />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/Gallery" element={<Gallery />} />

        {/* مسارات محمية - عرض فقط للمستخدمين المسجلين */}
        <Route 
          path="/generate-keywords" 
          element={
            isAuthenticated ? (
              <GenerateKeywords />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
             <Route 
          path="/patient/:patientId"
          element={
            isAuthenticated ? (
              <PatientDetail />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
   

            <Route 
          path="/patients" 
          element={
            isAuthenticated ? (
              <PatientsList/>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
  

        <Route 
        path="/patient-cases/:patientId" 
          element={
            isAuthenticated ? (
              <MedicalConditions/>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/add-patient" 
          element={
            isAuthenticated ? (
              <AddPatient />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        {/* صفحة الملف الشخصي - فقط للدكتور */}
        <Route 
          path="/user-profile" 
          element={
            isAuthenticated && userRole === 'doctor' ? (
              <UserProfile />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* صفحة الأدمن */}
        <Route 
          path="/admin" 
          element={
            isAuthenticated && userRole === 'admin' ? (
              <AdminPage />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* إعادة توجيه لكل مسار غير معروف */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
