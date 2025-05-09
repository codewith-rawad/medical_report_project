import React from 'react';
import '../Styles/Contact.css';
import { FaFacebook, FaInstagram, FaEnvelope,FaTelegram } from 'react-icons/fa';
import Background from '../Components/Background';
import contact1 from "../assets/background2.jpg";
import contact2 from "../assets/contact2.jpg";

const Contact = () => {
  const arry = [contact2,contact1];

  return (
    <div className="contact-page">
      <h1 className="contact-title">Let's Connect — Stay in Touch!</h1>

      <div className="cards-container">
        <div className="book-card">
          <div className="book-cover facebook">
            <FaFacebook size={40} />
            <p>Facebook</p>
          </div>
          <div className="book-page">
            <a href="https://www.facebook.com/rawad.a.rabie.2025" target="_blank" rel="noopener noreferrer">
              Visit my Facebook
            </a>
          </div>
        </div>

        <div className="book-card">
          <div className="book-cover instagram">
            <FaInstagram size={40} />
            <p>Instagram</p>
          </div>
          <div className="book-page">
            <a href="https://www.instagram.com/codewith_rawad/" target="_blank" rel="noopener noreferrer">
              Visit my Instagram
            </a>
          </div>
        </div>
        <div className="book-card">
          <div className="book-cover telegram">
            <FaTelegram size={40} />
            <p>Telegram</p>
          </div>
          <div className="book-page">
            <a href="https://t.me/code_with_rawad" target="_blank" rel="noopener noreferrer">
              Visit my Instagram
            </a>
          </div>
        </div>


        <div className="book-card">
          <div className="book-cover gmail">
            <FaEnvelope size={40} />
            <p>Gmail</p>
          </div>
          <div className="book-page">
            <a href="mailto:rawad.rabie123@gmail.com">
              Send me an Email
            </a>
          </div>
        </div>
      </div>

      <Background images={arry} />
    </div>
  );
};

export default Contact;
