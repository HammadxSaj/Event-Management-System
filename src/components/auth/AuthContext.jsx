// src/components/auth/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../Firebase'; // Make sure this is the correct path to your firebase configuration

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User signed in:', user); // Log user details for debugging
        setAuthUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      } else {
        console.log('No user signed in');
        setAuthUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log('Sign out successful');
        setAuthUser(null); // Ensure authUser is set to null on sign out
      })
      .catch((error) => {
        console.error('Sign out error:', error);
      });
  };

  return (
    <AuthContext.Provider value={{ authUser, userSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};
