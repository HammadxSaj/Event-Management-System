import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../Firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

const DisplayIdeas = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const ideasCollection = collection(db, "events", eventId, "ideas");
        const ideasSnapshot = await getDocs(ideasCollection);
        const fetchedIdeas = ideasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          upvote: doc.data().upvote || [], // Ensure these are initialized as arrays
          downvote: doc.data().downvote || [], // Ensure these are initialized as arrays
        }));
        setIdeas(fetchedIdeas);
      } catch (error) {
        console.error("Error fetching ideas:", error);
      }
    };

    if (eventId) {
      fetchIdeas();
    } else {
      console.error("eventId is undefined");
    }
  }, [eventId]);

  useEffect(() => {
    if (ideas.length > 0) {
      const highestVotedIdea = ideas.reduce((max, idea) =>
        (idea.upvote.length - idea.downvote.length) >
        (max.upvote.length - max.downvote.length)
          ? idea
          : max
      );
      setWinner(highestVotedIdea);
    }
  }, [ideas]);

  const handleVote = async (ideaId, type) => {
    const idea = ideas.find((idea) => idea.id === ideaId);

    if (!idea) {
      console.error(`Idea with id ${ideaId} not found.`);
      return;
    }

    const ideaRef = doc(db, "events", eventId, "ideas", ideaId);

    if (type === "upvote") {
      if (!idea.upvote.includes("userId")) { // Replace 'userId' with actual user ID
        idea.upvote.push("userId");
        idea.downvote = idea.downvote.filter((id) => id !== "userId");
      }
    } else {
      if (!idea.downvote.includes("userId")) {
        idea.downvote.push("userId");
        idea.upvote = idea.upvote.filter((id) => id !== "userId");
      }
    }

    try {
      await updateDoc(ideaRef, {
        upvote: idea.upvote,
        downvote: idea.downvote,
      });
      setIdeas([...ideas]); // Update state to trigger re-render
    } catch (error) {
      console.error("Error updating vote: ", error);
    }
  };

  return (
    <Container maxWidth="md" className="container">
      <Button onClick={() => navigate(`/event/${eventId}`)}>Back</Button>
      <Typography variant="h4" component="div" gutterBottom>
        Ideas
      </Typography>
      {winner && (
        <Paper className="winner-paper" sx={{ padding: 2, margin: 2, backgroundColor: "#f0f8ff" }}>
          <Typography variant="h5" color="primary">Winning Idea</Typography>
          <Typography variant="h6">{winner.title}</Typography>
          <Typography>{winner.description}</Typography>
          <Typography variant="subtitle2">By: {winner.creator}</Typography>
          <Typography variant="subtitle2">
            Date: {new Date(winner.dateTime).toLocaleString()}
          </Typography>
          {winner.imageUrls && (
            <Box mt={2}>
              {winner.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`idea image ${index}`}
                  style={{ maxWidth: "100%", marginBottom: "10px" }}
                />
              ))}
            </Box>
          )}
          <div
            className="map-preview mt-3"
            dangerouslySetInnerHTML={{ __html: winner.embedCode }}
          ></div>
        </Paper>
      )}
      {ideas.map((idea) => (
        <Paper key={idea.id} className="idea-paper" sx={{ padding: 2, margin: 2 }}>
          <Typography variant="h6">{idea.title}</Typography>
          <Typography>{idea.description}</Typography>
          <Typography variant="subtitle2">By: {idea.creator}</Typography>
          <Typography variant="subtitle2">
            Date: {new Date(idea.dateTime).toLocaleString()}
          </Typography>
          {idea.imageUrls && (
            <Box mt={2}>
              {idea.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`idea image ${index}`}
                  style={{ maxWidth: "100%", marginBottom: "10px" }}
                />
              ))}
            </Box>
          )}
          <div
            className="map-preview mt-3"
            dangerouslySetInnerHTML={{ __html: idea.embedCode }}
          ></div>
          <Box mt={2} display="flex" alignItems="center">
            <IconButton
              color="primary"
              onClick={() => handleVote(idea.id, "upvote")}
            >
              <ThumbUpIcon />
            </IconButton>
            <Typography>{idea.upvote.length}</Typography>
            <IconButton
              color="secondary"
              onClick={() => handleVote(idea.id, "downvote")}
            >
              <ThumbDownIcon />
            </IconButton>
            <Typography>{idea.downvote.length}</Typography>
          </Box>
        </Paper>
      ))}
    </Container>
  );
};

export default DisplayIdeas;
