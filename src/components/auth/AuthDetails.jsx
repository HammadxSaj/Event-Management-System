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
      {authUser ? (
        <>
          <p>{`Signed In as ${authUser.displayName || 'User'} (${authUser.email})`}</p>
          {authUser.photoURL ? (
            <img src={authUser.photoURL} referrerPolicy='no-referrer' alt="Profile" className="profile-pic" />
          ) : (
            <p>No profile picture available</p>
          )}
          <button
            onClick={() => {
              userSignOut();
              navigate('/');
            }}
          >
            Sign Out
          </button>
        </>
      ) : (
        <p>Signed Out</p>
      )}
    </div>
  );
};

export default AuthDetails;
