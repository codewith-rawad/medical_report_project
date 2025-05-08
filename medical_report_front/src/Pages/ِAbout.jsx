import React, { useState } from 'react';
import Navbar from '../Components/Navbar';
import LoginModal from '../Components/LoginModal';
import SignUp from '../Components/Signup';
import '../Styles/Home.css';
import Background from '../Components/Background';
import Back1 from '../assets/about1.avif';
import Back2 from '../assets/about2.jpg';
import Back3 from '../assets/background3.jpg';
import robot from "../assets/robot1.jpg"
const About = () => {
    const images=[Back1,Back2]
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="all">
      <div className="two">
      <img  className='robot' src={robot} alt="robot image" />
      <span>TOur web application harnesses the power of cutting-edge AI technologies — YOLO for object detection and LLMs for natural language generation — to transform chest X-ray images into meaningful medical reports. Designed for speed, accuracy, and accessibility, our platform empowers healthcare professionals with instant insights, helping streamline diagnoses and enhance patient care. With every image analyzed, we move one step closer to smarter, AI-driven healthcare.</span>
      </div>
   
          {/* <Navbar 
        onLoginClick={() => setShowLogin(true)} 
        onSignupClick={() => setShowSignUp(true)} 
      />
    
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showSignUp && <SignUp onClose={() => setShowSignUp(false)} />} */}
        <div className="home-container">
        <h1>Revolutionizing Medical Reports with AI</h1>

      </div>


 <Background images={images}/>


    </div>
    
    
    
  );
};

export default About;
