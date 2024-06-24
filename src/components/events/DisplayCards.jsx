// src/components/DisplayCards.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, CardActionArea, CardActions, Button } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import './DisplayCards.css';
import eventi from '../../assets/event1.jpg';

const DisplayCards = ({ event }) => {
  const navigate = useNavigate();
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [downvoteCount, setDownvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);

  useEffect(() => {
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

    if (event.images.length > 0) {
      console.log("First image URL in DisplayCards:", event.images[0]);
    }
  }, [event.id, event.images]);

  const handleDetails = (e) => {
    e.stopPropagation();
    navigate(`/event/${event.id}`);
  };

  const handleUpvote = () => {
    if (!hasUpvoted) {
      setUpvoteCount(upvoteCount + 1);
      setHasUpvoted(true);
      localStorage.setItem(`upvotes-${event.id}`, upvoteCount + 1);
      localStorage.setItem(`user-upvoted-${event.id}`, 'true');

      if (hasDownvoted) {
        setDownvoteCount(downvoteCount - 1);
        setHasDownvoted(false);
        localStorage.setItem(`downvotes-${event.id}`, downvoteCount - 1);
        localStorage.removeItem(`user-downvoted-${event.id}`);
      }
    }
  };

  const handleDownvote = () => {
    if (!hasDownvoted) {
      setDownvoteCount(downvoteCount + 1);
      setHasDownvoted(true);
      localStorage.setItem(`downvotes-${event.id}`, downvoteCount + 1);
      localStorage.setItem(`user-downvoted-${event.id}`, 'true');

      if (hasUpvoted) {
        setUpvoteCount(upvoteCount - 1);
        setHasUpvoted(false);
        localStorage.setItem(`upvotes-${event.id}`, upvoteCount - 1);
        localStorage.removeItem(`user-upvoted-${event.id}`);
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
