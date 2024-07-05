// src/admin/AddIdeasButton.js
// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { FaPlus } from 'react-icons/fa';

// function AddIdeasButton({ eventId }) {
//   const navigate = useNavigate();

//   return (
//     <button
//       className="btn btn-primary d-flex align-items-center"
//       onClick={() => navigate(`/event/${eventId}/ideaform`)}
//       style={{ marginTop: '10px', marginRight: '10px' }}
//     >
//       <FaPlus style={{ marginRight: '5px' }} />
//       Add Ideas
//     </button>
//   );
// }


/*create a button using bootstrap having a plus sign and text Add Event written on */

import React from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

const AddIdeasButton = ({ eventId }) => {
    const navigate = useNavigate();

    return (
        <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/event/${eventId}/ideaform`)}
            style={{ marginTop: 10, marginRight: 10 }}
        >
            Add Ideas
        </Button>
    );
};

export default AddIdeasButton;
