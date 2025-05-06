import React, { useState } from 'react';
import Navbar from '../Components/Navbar';
import LoginModal from '../Components/LoginModal';
import SignUp from '../Components/Signup';
import '../Styles/Home.css';
import Background from '../Components/Background';
import Back1 from '../assets/background.jpg';
import Back2 from '../assets/background2.jpg';
import Back3 from '../assets/background3.jpg';
import robot from "../assets/robot.webp"
const Home = () => {
    const images=[Back1,Back2]
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="all">
      <div className="two">
      <img  className='robot' src={robot} alt="robot image" />
      <span>This web application leverages the power of Artificial Intelligence to automatically generate accurate medical reports from X-ray images.
      By integrating advanced deep learning models, the system can analyze medical images, detect anomalies, and produce clear, professional diagnostic reports — streamlining the medical workflow and assisting healthcare professionals in decision-making.</span>
      </div>
   
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
