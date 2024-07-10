// src/components/auth/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../Firebase';// Make sure this is the correct path to your firebase configuration

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      
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
