
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, CardActionArea, CardActions, Button } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import './DisplayCards.css';
import eventi from '../../assets/event1.jpg';
import { db } from '../../Firebase';
import { doc, updateDoc } from 'firebase/firestore';

const DisplayCards = ({ event, uid }) => {
  const navigate = useNavigate();

  const [upvoteCount, setUpvoteCount] = useState(0);
  const [downvoteCount, setDownvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);

  useEffect(() => {
    // Fetch and update upvote/downvote counts, etc. based on event and uid
    if (event) {
      console.log("User Id Here:",uid)
     
      const storedUpvotes = localStorage.getItem(`upvotes-${event.id}`);
      const storedDownvotes = localStorage.getItem(`downvotes-${event.id}`);

      if (storedUpvotes) {
        setUpvoteCount(parseInt(storedUpvotes));
      }

      if (storedDownvotes) {
        setDownvoteCount(parseInt(storedDownvotes));
      }

      const userUpvoted = localStorage.getItem(`user-upvoted-${event.id}`);
      const userDownvoted = localStorage.getItem(`user-downvoted-${event.id}`);

      if (userUpvoted === 'true') {
        setHasUpvoted(true);
      }

      if (userDownvoted === 'true') {
        setHasDownvoted(true);
      }
    }
  }, [event]);

  const handleDetails = (e) => {
    e.stopPropagation();
    navigate(`/event/${event.id}`);
  };

  const handleUpvote = async () => {
    if (!hasUpvoted && event && event.upvote !== undefined) {
      const newUpvotes = [...(event.upvote || []), uid];
      console.log("User IDDD: ",uid);
      setUpvoteCount(newUpvotes.length);
      setHasUpvoted(true);
      localStorage.setItem(`upvotes-${event.id}`, JSON.stringify(newUpvotes));
      localStorage.setItem(`user-upvoted-${event.id}`, 'true');

      let newDownvotes = [];
      if (event.downvote !== undefined) {
        newDownvotes = event.downvote.filter(userId => userId !== uid);
        setDownvoteCount(newDownvotes.length);
        setHasDownvoted(false);
        localStorage.setItem(`downvotes-${event.id}`, JSON.stringify(newDownvotes));
        localStorage.removeItem(`user-downvoted-${event.id}`);
      }

      try {
        await updateDoc(doc(db, 'events', event.id), {
          upvote: newUpvotes,
          downvote: newDownvotes,
        });
        console.log("Upvotes updated:", newUpvotes);
      } catch (error) {
        console.error("Error updating upvotes:", error);
      }
    }
  };

  const handleDownvote = async () => {
    if (!hasDownvoted && event && event.downvote !== undefined) {
      const newDownvotes = [...(event.downvote || []), uid];
      setDownvoteCount(newDownvotes.length);
      setHasDownvoted(true);
      localStorage.setItem(`downvotes-${event.id}`, JSON.stringify(newDownvotes));
      localStorage.setItem(`user-downvoted-${event.id}`, 'true');

      let newUpvotes = [];
      if (event.upvote !== undefined) {
        newUpvotes = event.upvote.filter(userId => userId !== uid);
        setUpvoteCount(newUpvotes.length);
        setHasUpvoted(false);
        localStorage.setItem(`upvotes-${event.id}`, JSON.stringify(newUpvotes));
        localStorage.removeItem(`user-upvoted-${event.id}`);
      }

      try {
        await updateDoc(doc(db, 'events', event.id), {
          upvote: newUpvotes,
          downvote: newDownvotes,
        });
        console.log("Downvotes updated:", newDownvotes);
      } catch (error) {
        console.error("Error updating downvotes:", error);
      }
    }
  };

  if (!event) {
    return null; // Render nothing or placeholder if event is not defined
  }

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
            {new Date(event.dateTime).toLocaleString()}
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
          disabled={hasUpvoted}
        >
          Upvote ({upvoteCount})
        </Button>
        <Button
          size="small"
          color="secondary"
          onClick={handleDownvote}
          startIcon={<ArrowDownwardIcon />}
          disabled={hasDownvoted}
        >
          Downvote ({downvoteCount})
        </Button>
      </CardActions>
    </Card>
  );
};

export default DisplayCards;
