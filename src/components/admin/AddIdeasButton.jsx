// src/admin/AddIdeasButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaPlus } from 'react-icons/fa';

function AddIdeasButton({ eventId }) {
  const navigate = useNavigate();

  return (
    <button
      className="btn btn-primary d-flex align-items-center"
      onClick={() => navigate(`/event/${eventId}/ideaform`)}
      style={{ marginTop: '10px', marginRight: '10px' }}
    >
      <FaPlus style={{ marginRight: '5px' }} />
      Add Ideas
    </button>
  );
}

export default AddIdeasButton;
