import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { Icon } from 'react-icons-kit';
import { eyeOff } from 'react-icons-kit/feather/eyeOff';
import { eye } from 'react-icons-kit/feather/eye';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import './SignUp.css';
import logo from '../../assets/Logo.png';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from './ErrorMessage';

const auth = getAuth();
const db = getFirestore();

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(eyeOff);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleToggle = () => {
    setType(type === 'password' ? 'text' : 'password');
    setIcon(type === 'password' ? eye : eyeOff);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordRegex.test(password);
  };

  const signup = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

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

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { email: user.email, role: 'user' });

      navigate('/user');
    } catch (error) {
      console.error("Registration failed:", error.message);
      setErrorMessage(error.message);
    }
  };

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          navigate('/user');
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

  return (
    <div className='auth-container'>
      <div className='auth-bg'></div>
      <div className='auth-form'>
        <img src={logo} alt="Logo" className='logo' />
        <h1>Sign Up</h1>
        {errorMessage && <ErrorMessage message={errorMessage} />}
        <form onSubmit={signup}>
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
          <button type='submit'>Sign Up</button>
        </form>
        <Button
          variant="contained"
          color="primary"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          sx={{ marginTop: 2 }}
        >
          Sign up with Google
        </Button>
      </div>
    </div>
  );
};

export default SignUp;
