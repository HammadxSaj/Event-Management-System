import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, CardActionArea, CardActions, Button, Radio, RadioGroup, FormControlLabel, FormControl, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import '../DisplayCards.css'
import ideaImage from '../../../assets/event1.jpg'; // Replace with appropriate idea image
import { updateDoc, doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../Firebase';
import { useAuth } from '../../auth/AuthContext';

const PastIdeas = ({ idea, eventId, eventTitle}) => {
  const navigate = useNavigate();
  const { authUser } = useAuth();

 
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    if (idea && authUser) {
    }
  }, [idea]);




  const handleDetails = (e) => {
    e.stopPropagation();
    navigate(`/event/${eventId}/ideas/winningIdea/${idea.id}`)
  };



  return (
    <Card className="display-user-card">
      <CardActionArea onClick={handleDetails}>
        <CardMedia
          component="img"
          className="display-card-media"
          image={idea.images.length > 0 ? idea.images[0] : ideaImage}
          alt={idea.title}
          title={idea.title}
        />
        <CardContent className="display-card-content">
          <Typography gutterBottom variant="h5" component="div">
            <h3 className='past-event-title'>{eventTitle}</h3>
            {idea.title}
          </Typography>

  
        </CardContent>
      </CardActionArea>
      

    </Card>
  );
};

export default PastIdeas;