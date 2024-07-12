import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // Add setDoc and doc
import { auth, db } from '../../Firebase'; // Make sure this is the correct path to your firebase configuration

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('User signed in:', user);
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        setAuthUser(userData);

        // Store user data in Firestore
        try {
          await setDoc(doc(db, 'user_data', user.uid), userData);
          console.log('User data stored in Firestore');
        } catch (error) {
          console.error('Error storing user data in Firestore:', error);
        }
      } else {
        console.log('No user signed in');
        setAuthUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log('Sign out successful');
        setAuthUser(null);
      })
      .catch((error) => {
        console.error('Sign out error:', error);
      });
  };

  return (
    <AuthContext.Provider value={{ authUser, userSignOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
