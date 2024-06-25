// src/components/auth/AuthDetails.js
import React from 'react';
import { useAuth } from './AuthContext';

const AuthDetails = () => {
  const { authUser, userSignOut } = useAuth();

  return (
    <div>
      {authUser ? (
        <>
          <p>{`Signed In as ${authUser.email}`}</p>
          {/* <button onClick={userSignOut}>Sign Out</button> */}
        </>
      ) :
      
      (
        <p>Signed Out</p>
      )
      
      
      }
    </div>
  );
};

export default AuthDetails;
