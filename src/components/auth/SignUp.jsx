import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getAuth } from 'firebase/auth';
import { Icon } from 'react-icons-kit';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { eye } from 'react-icons-kit/feather/eye';
import {getFirestore, doc, setDoc } from 'firebase/firestore';

import './SignUp.css'; // Make sure SignUp.css exists and contains necessary styles
import logo from '../../assets/Logo.png';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from './ErrorMessage';

const auth = getAuth(); // Initialize Firebase Auth instance
const db = getFirestore(); // Initialize Firestore

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("password"); // State to toggle input type between 'password' and 'text'
  const [icon, setIcon] = useState(eyeOff); // State to manage the eye icon
  const [errorMessage, setErrorMessage] = useState(null); // State for error message

  const handleToggle = () => {
    setType(type === 'password' ? 'text' : 'password'); // Toggle input type between 'password' and 'text'
    setIcon(type === 'password' ? eye : eyeOff); // Toggle eye icon between 'eye' and 'eyeOff'
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; // At least 6 characters, 1 letter, and 1 number
    return passwordRegex.test(password);
  };

  const signup = async (e) => {
    e.preventDefault(); // Prevent form submission
    setErrorMessage(null); // Clear previous error message

    if (email.trim().length === 0 || password.trim().length === 0) {
      setErrorMessage("Please fill in both email and password fields.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!isValidPassword(password)) {
      setErrorMessage("Password should be at least 6 characters long and include at least one letter and one number.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User registered:", user);

      // Set user role in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { email: user.email, role: 'user' }); // Change role to 'admin' if needed
      
      navigate('/user')
      // Optionally redirect or show a success message
    } catch (error) {
      console.error("Registration failed:", error.message);
      setErrorMessage(error.message); // Display error message to the user
    }
  };

  return (
    <div className='auth-container'>
      {/* Back Button */}
      <button className='back-button' onClick={() => navigate('/')}>Back</button>
      <div className='auth-form'>
        <img src={logo} alt="Logo" className='logo' />
        <h1>Create Your Account</h1>
        {errorMessage && <ErrorMessage message={errorMessage} />} {/* Display error message */}
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
              style={{ width: '100%' }}
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
          <button
            className='login-button'
            onClick={() => navigate('/signin')}
          >
            Already Registered? Log in
          </button>
        </form>
      </div>
      <div className='auth-background'>
        {/* <button className='sign-up-button'>Sign Up</button> */}
      </div>
    </div>
  );
};

export default SignUp;
