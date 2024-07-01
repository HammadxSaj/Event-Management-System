import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Icon } from 'react-icons-kit';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { eye } from 'react-icons-kit/feather/eye';
import { auth, db } from '../../Firebase';
import { doc, getDoc } from 'firebase/firestore';
import './SignIn.css'; // Make sure SignIn.css exists and contains necessary styles
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
      .then(async (userCredential) => {
        console.log("User logged in:", userCredential.user);
        setErrorMessage(null); // Clear any previous error messages

        // Fetch the user role from Firestore
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/user');
          }
        } else {
          setErrorMessage('User role information not found.');
        }
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

  const handleSignUp = () => {
    navigate('/signup'); // Redirect to Sign Up page
  }
  return (
    <>
      <div className='auth-container'>
        <div className='auth-bg'>
          {/* You can add any background image or content here */}
        </div>
        <div className='auth-form'>
          <button className='back-button' onClick={handleBack}>Back</button>
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
          <button className='sign-up-button' onClick={handleSignUp}>Sign Up</button>
        </div>
      </div>
      <AuthDetails />
    </>
  );
};

export default SignIn;
