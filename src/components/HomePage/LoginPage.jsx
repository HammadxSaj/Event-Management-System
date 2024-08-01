import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../../Firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import './LoginPage.css'; 
import logo from '../../assets/Logo.png';
import securiti from '../../assets/securiti.png';
import AuthDetails from '../auth/AuthDetails';
import { useNavigate } from 'react-router-dom';
import { Circles } from 'react-loader-spinner';
import ErrorMessage from '../auth/ErrorMessage';

const LogIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const handleFocus = () => {
      // Reset the state when the window regains focus
      setLoading(false);
      setErrorMessage(null);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const isEmailAllowed = (email) => {
    const allowedDomains = ['foundri.net', 'securiti.ai'];
    const emailDomain = email.split('@')[1];
    return allowedDomains.includes(emailDomain);
  };

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);  
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const email = user.email;

        if (!isEmailAllowed(email)) {
          alert("Only emails from @foundri.net and @securiti.ai are allowed.");
          setLoading(false);
          return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (!userData.role) return; // If role is empty, navigate nowhere
          navigate('/events', { replace: true });
          // if (userData.role === 'admin') {
          //   navigate('/admin');
          // } else {
          //   navigate('/user');
          // }
        } else {
          await setDoc(userDocRef, { email: user.email, role: 'user' });
          navigate('/events', { replace: true });
        }
      })
      .catch((error) => {
        console.log("Google sign in error:", error);
        setErrorMessage("Google sign in failed. Please try again.");
        setLoading(false);
      });
  };

  return (
    <>
      <div className='auth-container'>
        <div className='auth-form'>
          <img src={logo} alt="Logo" className='logo' />
          <h1>Invest in your Happiness with us</h1>
          <img src={securiti} alt="Securiti" className='securiti' />

          {loading ? (
            <div className="loader">
              <Circles
                height="100"
                width="100"
                color="#1CA8DD"
                ariaLabel="loading"
              />
            </div>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              sx={{ marginTop: 2 }}
            >
              Sign in with Google
            </Button>
          )}

          {errorMessage && <ErrorMessage message={errorMessage} />}
        </div>
      </div>
      <AuthDetails />
    </>
  );
};

export default LogIn;
