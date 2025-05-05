import React, { useState } from 'react';
import Navbar from '../Components/Navbar';
import LoginModal from '../Components/LoginModal';
import SignUp from '../Components/Signup';
import '../Styles/Home.css';
import Background from '../Components/Background';
import Back1 from '../assets/background.jpg';
import Back2 from '../assets/background2.jpg';
import Back3 from '../assets/background3.jpg';
const Home = () => {
    const images=[Back1,Back2,Back3]
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="all">
          <Navbar 
        onLoginClick={() => setShowLogin(true)} 
        onSignupClick={() => setShowSignUp(true)} 
      />
      <div className="home-container">
        <h1>Welcome to Medical Report System</h1>
        <p>Everything you need is here, no need for the doctor</p>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showSignUp && <SignUp onClose={() => setShowSignUp(false)} />}

 <Background images={images}/>
    </div>
    
    
    
  );
};

export default Home;
