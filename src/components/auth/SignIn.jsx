import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Icon } from 'react-icons-kit';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { eye } from 'react-icons-kit/feather/eye';
import { auth, db } from '../../Firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import './SignIn.css'; 
import logo from '../../assets/Logo.png';
import AuthDetails from './AuthDetails';
import ErrorMessage from './ErrorMessage';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('password');
  const [icon, setIcon] = useState(eyeOff);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleToggle = () => {
    setType(type === 'password' ? 'text' : 'password');
    setIcon(type === 'password' ? eye : eyeOff);
  };

  const signin = (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password fields.');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        console.log("User logged in:", userCredential.user);
        setErrorMessage(null);

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
            setErrorMessage("Login failed. Please try again.");
            break;
        }
      });
  };

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/user');
          }
        } else {
          await setDoc(userDocRef, { email: user.email, role: 'user' });
          navigate('/user');
        }
      })
      .catch((error) => {
        console.log("Google sign in error:", error);
        setErrorMessage("Google sign in failed. Please try again.");
      });
  };

  const handleBack = () => {
    console.log("Back button clicked");
    navigate('/');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <>
      <div className='auth-container'>
        <div className='auth-bg'></div>
        <div className='auth-form'>
          <button className='back-button' onClick={handleBack}>Back</button>
          <img src={logo} alt="Logo" className='logo' />
          <h1>Log In</h1>
          {errorMessage && <ErrorMessage message={errorMessage} />}
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            sx={{ marginTop: 2 }}
          >
            Sign in with Google
          </Button>
          <button className='sign-up-button' onClick={handleSignUp}>Sign Up</button>
        </div>
      </div>
      <AuthDetails />
    </>
  );
};

export default SignIn;
