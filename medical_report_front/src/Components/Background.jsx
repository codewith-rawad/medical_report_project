import React, { useState, useEffect } from 'react';
import '../Styles/Background.css';

const Background = ({images}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);

    return () => clearInterval(interval); 
  }, []);

  return (
    <div className="Background">
      <div className="black"></div>
      <img className='move' src={images[currentImageIndex]} alt="" />
    </div>
  );
};

export default Background;
