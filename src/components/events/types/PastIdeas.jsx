import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, CardActionArea, CardActions, Button, Radio, RadioGroup, FormControlLabel, FormControl, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import '../DisplayCards.css';
import ideaImage from '../../../assets/event1.jpg'; // Replace with appropriate idea image
import { updateDoc, doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../Firebase';
import { useAuth } from '../../auth/AuthContext';

const PastIdeas = ({ idea, eventId}) => {
  const navigate = useNavigate();
  const { authUser } = useAuth();

 
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    if (idea && authUser) {


     
    }
  }, [idea]);




  const handleDetails = (e) => {
    e.stopPropagation();
    navigate(`/event/${eventId}/ideas/${idea.id}`)
  };



  return (
    <Card className="card">
      <CardActionArea onClick={handleDetails}>
        <CardMedia
          component="img"
          className="card-media"
          image={idea.images.length > 0 ? idea.images[0] : ideaImage}
          alt={idea.title}
          title={idea.title}
        />
        <CardContent className="card-content">
          <Typography gutterBottom variant="h5" component="div">
            {idea.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(idea.dateTime).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {idea.description}
          </Typography>
        </CardContent>
      </CardActionArea>
      
      {/* {userRole === 'admin' && (
        <CardActions className="card-actions">
          <Button
            size="small"
            color="error"
            onClick={openDialog}
            startIcon={<DeleteIcon />}
          >
            Delete Idea
          </Button>
          <Dialog
            open={openDeleteDialog}
            onClose={closeDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete this idea? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDeleteIdea} color="error" autoFocus>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </CardActions>
      )} */}
      {/* <CardContent className="card-content">
        {isWinner && (
          <FormControl component="fieldset" style={{ marginTop: '1rem' }}>
            <Typography variant="h6">RSVP</Typography>
            <RadioGroup
              aria-label="rsvp"
              name="rsvp"
              value={rsvp}
              onChange={handleRsvpChange}
              row
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" disabled={rsvpLoading} />
              <FormControlLabel value="no" control={<Radio />} label="No" disabled={rsvpLoading} />
            </RadioGroup>
          </FormControl>
        )}
      </CardContent> */}
     
    </Card>
  );
};

export default PastIdeas;