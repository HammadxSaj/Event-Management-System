import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, CardActionArea, CardActions, Button } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import './DisplayCards.css'; 
import eventi from '../../assets/event1.jpg'; 
import { updateDoc, doc } from 'firebase/firestore'; 
import { db } from '../../Firebase'; 
import { useAuth } from '../auth/AuthContext'; 

const DisplayCards = ({ event, votingEnded}) => {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [upvoteCount, setUpvoteCount] = useState(0);
  const [downvoteCount, setDownvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);

  useEffect(() => {
    if (event && authUser) {
      setUpvoteCount(event.upvote ? event.upvote.length : 0);
      setDownvoteCount(event.downvote ? event.downvote.length : 0);
      setHasUpvoted(event.upvote && event.upvote.includes(authUser.uid));
      setHasDownvoted(event.downvote && event.downvote.includes(authUser.uid));
    }
  }, [event, authUser]);

  const handleDetails = (e) => {
    e.stopPropagation();
    navigate(`/event/${event.id}`);
  };

  const handleUpvote = async () => {
    if (!hasUpvoted && event && event.upvote !== undefined && authUser) {
      let newUpvotes = [...(event.upvote || []), authUser.uid];
      let newDownvotes = event.downvote?.filter(uid => uid !== authUser.uid) || [];

      setUpvoteCount(newUpvotes.length);
      setDownvoteCount(newDownvotes.length);
      setHasUpvoted(true);
      setHasDownvoted(false);

      try {
        await updateDoc(doc(db, 'events', event.id), {
          upvote: newUpvotes,
          downvote: newDownvotes,
        });
        console.log("Upvoted");
      } catch (error) {
        console.error("Error updating upvotes:", error);
      }
    }
  };

  const handleDownvote = async () => {
    if (!hasDownvoted && event && event.downvote !== undefined && authUser) {
      let newDownvotes = [...(event.downvote || []), authUser.uid];
      let newUpvotes = event.upvote?.filter(uid => uid !== authUser.uid) || [];

      setUpvoteCount(newUpvotes.length);
      setDownvoteCount(newDownvotes.length);
      setHasUpvoted(false);
      setHasDownvoted(true);

      try {
        await updateDoc(doc(db, 'events', event.id), {
          upvote: newUpvotes,
          downvote: newDownvotes,
        });
        console.log("Downvoted");
      } catch (error) {
        console.error("Error updating downvotes:", error);
      }
    }
  };

  return (
    <Card className="card">
      <CardActionArea onClick={handleDetails}>
        <CardMedia
          component="img"
          className="card-media"
          image={event.images.length > 0 ? event.images[0] : eventi}
          alt={event.title}
          title={event.title}
        />
        <CardContent className="card-content">
          <Typography gutterBottom variant="h5" component="div">
            {event.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(event.date).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {event.description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions className="card-actions">
        <Button
          size="small"
          color="primary"
          onClick={handleUpvote}
          startIcon={<ArrowUpwardIcon />}
          disabled={hasUpvoted || votingEnded}
        >
          Upvote ({upvoteCount})
        </Button>
        <Button
          size="small"
          color="secondary"
          onClick={handleDownvote}
          startIcon={<ArrowDownwardIcon />}
          disabled={hasDownvoted || votingEnded} 
        >
          Downvote ({downvoteCount})
        </Button>
      </CardActions>
    </Card>
  );
};

export default DisplayCards;
