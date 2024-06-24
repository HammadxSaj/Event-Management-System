/*create a button using bootstrap having a plus sign and text Add Event written on */

import React from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

function AddEventButton() {
    const navigate = useNavigate();

    return (
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/eventform')}>
            Add Event
        </Button>
    );
}

export default AddEventButton;