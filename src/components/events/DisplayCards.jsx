import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, CardActionArea, CardActions, Button, Radio, RadioGroup, FormControlLabel, FormControl, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box } from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import './DisplayCards.css';
import eventi from '../../assets/event1.jpg';
import { updateDoc, doc, getDoc, deleteDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { db, storage } from '../../Firebase';
import { useAuth } from '../auth/AuthContext';

const DisplayCards = ({ event, votingEnded, winningEventprop, votingStarted, onDeleteEvent }) => {

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
  const [loadingDelete, setLoadingDelete] = useState(true); 
  
  useEffect(() => {
    if (event && authUser) {
      setUpvoteCount(event.upvote ? event.upvote.length : 0);
      setDownvoteCount(event.downvote ? event.downvote.length : 0);
      setHasUpvoted(event.upvote && event.upvote.includes(authUser.uid));
      setHasDownvoted(event.downvote && event.downvote.includes(authUser.uid));
    

      fetchRsvp();
      checkIfWinner();
      fetchUserRole();
    }
  }, [event, authUser]);

  const fetchRsvp = async () => {
    try {
      const rsvpDoc = await getDoc(doc(db, 'events', event.id, 'rsvps', authUser.uid));
      if (rsvpDoc.exists()) {
        setRsvp(rsvpDoc.data().response);
      }
    } catch (error) {
      console.error("Error fetching RSVP:", error);
    }
  };

  const checkIfWinner = async () => {
    try {
      const winnerEventDoc = await getDoc(doc(db, 'settings', 'winnerEvent'));
      if (winnerEventDoc.exists() && winnerEventDoc.data().eventId === event.id) {
        setIsWinner(true);
      }
    } catch (error) {
      console.error("Error checking winner event:", error);
    }
  };

  const fetchUserRole = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', authUser.uid));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const handleDetails = (e) => {
    e.stopPropagation();
    navigate(`/event/${event.id}/ideas`);
    // commenting to visit ideas page instead
    //navigate(`/event/${event.id}`);
  };

  const handleUpvote = async () => {
    if (!hasUpvoted && event && event.upvote !== undefined && authUser) {
      const newUpvotes = new Set(event.upvote || []);
      const newDownvotes = new Set(event.downvote || []);

      newUpvotes.add(authUser.uid);
      newDownvotes.delete(authUser.uid);

      setUpvoteCount(newUpvotes.size);
      setDownvoteCount(newDownvotes.size);
      setHasUpvoted(true);
      setHasDownvoted(false);

      try {
        await updateDoc(doc(db, 'events', event.id), {
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
    if (!hasDownvoted && event && event.downvote !== undefined && authUser) {
      const newDownvotes = new Set(event.downvote || []);
      const newUpvotes = new Set(event.upvote || []);

      newDownvotes.add(authUser.uid);
      newUpvotes.delete(authUser.uid);

      setUpvoteCount(newUpvotes.size);
      setDownvoteCount(newDownvotes.size);
      setHasUpvoted(false);
      setHasDownvoted(true);

      try {
        await updateDoc(doc(db, 'events', event.id), {
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
      const rsvpDocRef = doc(db, 'events', event.id, 'rsvps', authUser.uid);
      await setDoc(rsvpDocRef, {
        response: response,
        email: authUser.email
      });
      console.log("RSVP saved");
    } catch (error) {
      console.error("Error saving RSVP:", error);
    }

    setRsvpLoading(false);
  };

  const handleDeleteEvent = async () => {
  
  try {
    // Step 1: Retrieve the list of image URLs for the event
    const imagesSnapshot = await getDocs(collection(db, 'events', event.id, 'images'));

    // Step 2: Delete each image from Firebase Storage
    const deleteImagePromises = imagesSnapshot.docs.map(async (imageDoc) => {
      const imageUrls = imageDoc.data().imageUrls;
      const deleteStoragePromises = imageUrls.map((url) => {
        const storageRef = ref(storage, url);
        return deleteObject(storageRef);
      });
      await Promise.all(deleteStoragePromises);

      // Step 3: Delete the Firestore document related to the image
      await deleteDoc(imageDoc.ref);
    });
    await Promise.all(deleteImagePromises);

    // Step 4: Delete the event document itself
    await deleteDoc(doc(db, 'events', event.id));

    setOpenDeleteDialog(false);
    onDeleteEvent(event.id); // Notify the parent component about the deletion
  } catch (error) {
    console.error('Error deleting event:', error);
  }
  
};

  const openDialog = () => {
    setOpenDeleteDialog(true);
  };

  const closeDialog = () => {
    setOpenDeleteDialog(false);
  };

  return (
    <Card className={userRole === 'admin' ? 'display-card' : 'display-user-card'}>
      <CardActionArea onClick={handleDetails}>
        <CardMedia
          component="img"
          className="display-card-media"
          image={event.images.length > 0 ? event.images[0] : eventi}
          alt={event.title}
          title={event.title}
        />
        <CardContent className="display-card-content">
          <Typography gutterBottom variant="h5" component="div">
            {event.title}
          </Typography>
        </CardContent>
      </CardActionArea>
      {userRole === 'admin' && (
        <CardActions className="display-card-actions">
          <Button
            size="small"
            color="error"
            onClick={openDialog}
            startIcon={<DeleteIcon />}
          >
            Delete Event
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
                Are you sure you want to delete this event? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDeleteEvent} color="error" autoFocus>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </CardActions>
      )}
      <CardContent className="display-card-content">
        {isWinner && winningEventprop && (
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
      </CardContent>

    </Card>
  );
};
export default DisplayCards;
