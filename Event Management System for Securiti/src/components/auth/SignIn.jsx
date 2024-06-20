import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Icon } from 'react-icons-kit';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { eye } from 'react-icons-kit/feather/eye';
import { auth } from '../../Firebase';
import './SignUp.css'; // Make sure SignIn.css exists and contains necessary styles
import logo from '../../assets/Logo.png';
import AuthDetails from './AuthDetails';
import ErrorMessage from './ErrorMessage'; // Import ErrorMessage component if available
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('password'); // State to toggle input type between 'password' and 'text'
  const [icon, setIcon] = useState(eyeOff); // State to manage the eye icon
  const [errorMessage, setErrorMessage] = useState(null); // State for error message

  const handleToggle = () => {
    setType(type === 'password' ? 'text' : 'password'); // Toggle input type between 'password' and 'text'
    setIcon(type === 'password' ? eye : eyeOff); // Toggle eye icon between 'eye' and 'eyeOff'
  };

  const signin = (e) => {
    e.preventDefault();
    setErrorMessage(null); // Clear previous error message

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password fields.');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User logged in:", userCredential.user);
        setErrorMessage(null); // Clear any previous error messages
        navigate('/admin');
      })
      .catch((error) => {
        console.log("Sign in error:", error);
        switch (error.code) {
          case 'auth/invalid-email':
            setErrorMessage("The email address is badly formatted.");
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            setErrorMessage("Incorrect email or password.");
            break;
          default:
            setErrorMessage("Login failed. Please try again."); // Set generic error message for other errors
            break;
        }
      });
  };

  const handleBack = () => {
    console.log("Back button clicked");
    navigate('/'); // Redirect to home or previous page
  };

  return (
    <>
      <div className='sign-in-container'>
        <button className='back-button' onClick={handleBack}>Back</button>
        <div className='auth-form'>
          <img src={logo} alt="Logo" className='logo' />
          <h1>Log In</h1>
          {errorMessage && <ErrorMessage message={errorMessage} />} {/* Display error message if present */}
          <form onSubmit={signin}>
            <p>Email</p>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p>Password</p>
            <div className="password-input">
              <input
                type={type}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="view-password"
                onClick={handleToggle}
              >
                <Icon icon={icon} size={20} />
              </button>
            </div>
            <button type='submit'>Log In</button>
          </form>
        </div>
        <div className='auth-background'>
          <button className='sign-up-button'>Sign Up</button>
        </div>
      </div>
      <AuthDetails />
    </>
  );
};

export default SignIn;