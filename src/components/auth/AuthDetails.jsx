// src/components/auth/AuthDetails.js
import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthDetails = () => {
  const { authUser, userSignOut } = useAuth();
  const navigate = useNavigate(); 


  return (
    <div>
      {authUser ? (
        <>
          {/* <p>{`Signed In as ${authUser.email}`}</p>
          <button
          onClick={() => {
            userSignOut();
            navigate('/');
          }}
          >
            Sign Out
          </button> */}

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
