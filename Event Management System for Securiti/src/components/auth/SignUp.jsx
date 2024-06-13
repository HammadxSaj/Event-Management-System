import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getAuth } from 'firebase/auth';
import { Icon } from 'react-icons-kit';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { eye } from 'react-icons-kit/feather/eye';
import './SignUp.css'; // Make sure SignUp.css exists and contains necessary styles
import logo from '/Users/areesha.amir/Documents/GitHub/Event-Management-System/Event Management System for Securiti/components/Assets/Logo.png';

const auth = getAuth(); // Initialize Firebase Auth instance

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("password"); // State to toggle input type between 'password' and 'text'
  const [icon, setIcon] = useState(eyeOff); // State to manage the eye icon
  const [errorMessage, setErrorMessage] = useState(null); // State for error message


  const handleToggle = () => {
    setType(type === 'password' ? 'text' : 'password'); // Toggle input type between 'password' and 'text'
    setIcon(type === 'password' ? eye : eyeOff); // Toggle eye icon between 'eye' and 'eyeOff'
  };

  const handleBack = () => {
    // Implement logic to navigate back to previous page or handle as needed
    console.log("Back button clicked");
  };


  const signup = (e) => {
    e.preventDefault(); // Prevent form submission
    setErrorMessage(null); // Clear previous error message
    
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User registered:", userCredential.user);
        
        // Optionally redirect or show a success message
      })
      .catch((error) => {
        console.error("Registration failed:", error.message);
        // Handle error: Display error message to the user
      });
  };
  return (
    <div className='auth-container'>
      {/* Back Button */}
      <button className='back-button' onClick={handleBack}>Back</button>
  
      <div className='auth-form'>
        <img src={logo} alt="Logo" className='logo'/>
        <h1>Create Your Account</h1>
        <form onSubmit={signup}>
          <p>Email</p>
          <input type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <p>Password</p>
          <div className="password-input">
            <input
              type={type}
              placeholder="Please pick a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="long-password-input" // Ensure to add this class for custom styles
              style={{width:'100%'}}
            />
            <button
              type="button"
              className="view-password"
              onClick={handleToggle}
            >
              <Icon icon={icon} size={20} />
            </button>
          </div>
          <button type='submit'>Sign Up</button> {/* Submit button inside the form */}
        </form>
      </div>
      {/* Optional auth-background section with a button */}
      <div className='auth-background'>
        <button className='sign-up-button'>Sign Up</button>
      </div>
    </div>
  );
  
};

export default SignUp;
