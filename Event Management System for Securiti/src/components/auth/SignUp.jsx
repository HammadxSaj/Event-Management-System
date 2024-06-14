import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getAuth } from 'firebase/auth';
import { Icon } from 'react-icons-kit';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { eye } from 'react-icons-kit/feather/eye';
import './SignUp.css'; // Make sure SignUp.css exists and contains necessary styles
import logo from '../../assets/Logo.png';
import { useNavigate } from 'react-router-dom';

const auth = getAuth(); // Initialize Firebase Auth instance

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

  const signup = (e) => {
    e.preventDefault(); // Prevent form submission
    setErrorMessage(null); // Clear previous error message

    if (email.length === 0) {
      setErrorMessage("Email is required.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password should be at least 6 characters long.");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User registered:", userCredential.user);
        // Optionally redirect or show a success message
        navigate('/'); // Redirect to home page or any other page
      })
      .catch((error) => {
        console.error("Registration failed:", error.message);
        setErrorMessage(error.message); // Display error message to the user
      });
  };

  return (
    <div className='auth-container'>
      {/* Back Button */}
      <button className='back-button' onClick={() => navigate('/')}>Back</button>
      <div className='auth-form'>
        <img src={logo} alt="Logo" className='logo' />
        <h1>Create Your Account</h1>
        {errorMessage && <p className="error-message" style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error message */}
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
            onClick={() => navigate('/login')}
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
