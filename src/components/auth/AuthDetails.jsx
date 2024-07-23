// AuthDetails.jsx
import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './AuthDetails.css'; // Ensure the CSS file is imported

const AuthDetails = () => {
  const { authUser, userSignOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      {/* {authUser ? (
        <>
       
      
        </>
      ) : (
        <p>Signed Out</p>
      )} */}
    </div>
  );
};

export default AuthDetails;
