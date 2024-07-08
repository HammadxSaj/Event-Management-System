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

const DisplayIdeas = ({ idea, votingEnded, winningIdea, votingStarted, eventId }) => {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [upvoteCount, setUpvoteCount] = useState(0);
  const [downvoteCount, setDownvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [rsvp, setRsvp] = useState(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    if (idea && authUser) {
      setUpvoteCount(idea.upvote ? idea.upvote.length : 0);
      setDownvoteCount(idea.downvote ? idea.downvote.length : 0);
      setHasUpvoted(idea.upvote && idea.upvote.includes(authUser.uid));
      setHasDownvoted(idea.downvote && idea.downvote.includes(authUser.uid));
    
      fetchRsvp();
      fetchUserRole();
      console.log('Voting ended',votingEnded);

      if (votingEnded) {
        checkIfWinner();
        console.log('Winner Idea:', );
      }

     
    }
  }, [idea, authUser, votingEnded]);

  const fetchRsvp = async () => {
    try {
      const rsvpDoc = await getDoc(doc(db, 'ideas', idea.id, 'rsvps', authUser.uid));
      if (rsvpDoc.exists()) {
        setRsvp(rsvpDoc.data().response);
      }
    } catch (error) {
      console.error("Error fetching RSVP:", error);
    }
  };

  const checkIfWinner = useCallback(async () => {
    try {
      if (!eventId || !idea.id) {
        console.error("Missing eventId or idea.id");
        return;
      }
      
      const winnerIdeaDoc = await getDoc(doc(db, 'events', eventId, 'details', 'winnerIdea'));
      if (winnerIdeaDoc.exists() && winnerIdeaDoc.data().ideaId === idea.id) {
        setIsWinner(true);
      }
    } catch (error) {
      console.error("Error checking winner idea:", error);
    }
  }, [eventId, idea.id]);

  const fetchUserRole = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', authUser.uid));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    } finally {
      setLoadingRole(false);
    }
  };

  const handleDetails = (e) => {
    e.stopPropagation();
    navigate(`/event/${eventId}/ideas/${idea.id}`)
  };

  const handleUpvote = async () => {
    if (!hasUpvoted && idea && idea.upvote !== undefined && authUser) {
      const newUpvotes = new Set(idea.upvote || []);
      const newDownvotes = new Set(idea.downvote || []);

      newUpvotes.add(authUser.uid);
      newDownvotes.delete(authUser.uid);

      setUpvoteCount(newUpvotes.size);
      setDownvoteCount(newDownvotes.size);
      setHasUpvoted(true);
      setHasDownvoted(false);

      try {
        await updateDoc(doc(db, 'events', eventId, 'ideas', idea.id), {
          upvote: Array.from(newUpvotes),
          downvote: Array.from(newDownvotes),
        });
        console.log("Upvoted");
      } catch (error) {
        console.error("Error updating upvotes:", error);
      }
    }
  };

  const handleDownvote = async () => {
    if (!hasDownvoted && idea && idea.downvote !== undefined && authUser) {
      const newDownvotes = new Set(idea.downvote || []);
      const newUpvotes = new Set(idea.upvote || []);

      newDownvotes.add(authUser.uid);
      newUpvotes.delete(authUser.uid);

      setUpvoteCount(newUpvotes.size);
      setDownvoteCount(newDownvotes.size);
      setHasUpvoted(false);
      setHasDownvoted(true);

      try {
        await updateDoc(doc(db, 'events', eventId, 'ideas', idea.id), {
          upvote: Array.from(newUpvotes),
          downvote: Array.from(newDownvotes),
        });
        console.log("Downvoted");
      } catch (error) {
        console.error("Error updating downvotes:", error);
      }
    }
  };

  const handleRsvpChange = async (e) => {
    setRsvpLoading(true);
    const response = e.target.value;
    setRsvp(response);

    try {
      const rsvpDocRef = doc(db, 'ideas', idea.id, 'rsvps', authUser.uid);
      await setDoc(rsvpDocRef, {
        response: response,
        email: authUser.email
      });
      console.log("RSVP saved in", idea.id);
    } catch (error) {
      console.error("Error saving RSVP:", error);
    }

    setRsvpLoading(false);
  };

  const handleDeleteIdea = async () => {
    try {
      await deleteDoc(doc(db, 'events', eventId, 'ideas', idea.id));
      setOpenDeleteDialog(false);
      window.location.reload(); // Reload the page to update the list of ideas
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  const openDialog = () => {
    setOpenDeleteDialog(true);
  };

  const closeDialog = () => {
    setOpenDeleteDialog(false);
  };

  if (loadingRole) {
    return <div>Loading...</div>; // You can replace this with a spinner or skeleton component
  }

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
      
      {userRole === 'admin' && (
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
      )}
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
      <CardActions className="card-actions">
        <Button
          size="small"
          color="primary"
          onClick={handleUpvote}
          startIcon={<ArrowUpwardIcon />}
          disabled={hasUpvoted || votingEnded || !votingStarted}
        >
          Upvote ({upvoteCount})
        </Button>
        <Button
          size="small"
          color="secondary"
          onClick={handleDownvote}
          startIcon={<ArrowDownwardIcon />}
          disabled={hasDownvoted || votingEnded || !votingStarted}
        >
          Downvote ({downvoteCount})
        </Button>
      </CardActions>
    </Card>
  );
};

export default DisplayIdeas;