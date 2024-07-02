import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../Firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  Container,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import AddIdeasButton from "../../admin/AddIdeasButton";
import NavBar from "../../Home/NavBar";
import '../DisplayCards.css'

const IdeasPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const ideasCollection = collection(db, "events", eventId, "ideas");
        const ideasSnapshot = await getDocs(ideasCollection);
        const fetchedIdeas = ideasSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          location: doc.data().location,
          dateTime: doc.data().dateTime,
          details: doc.data().details,
          embedCode: doc.data().embedCode,
          upvote: doc.data().upvote,
          downvote: doc.data().downvote,
          creator: doc.data().creator,
          date: doc.data().date,
        }));
        setIdeas(fetchedIdeas);
      } catch (error) {
        console.error("Error fetching ideas:", error);
      }
    };

    fetchIdeas();
  }, [eventId]);

  return (
    <>
      <NavBar />
      <Container maxWidth="sm" className="container">
        <AddIdeasButton eventId={eventId}/>
        <button className="back-button" onClick={() => navigate("/event")}>
          Back
        </button>
        <Box mt={4}>
          <Typography variant="h5" component="div" gutterBottom>
            Ideas
          </Typography>
          {ideas.map((idea) => (
            <Paper key={idea.id} className="idea-paper">
              <Typography variant="h6">{idea.title}</Typography>
              <Typography>{idea.description}</Typography>
              <Typography variant="subtitle2">Location: {idea.location}</Typography>
              <Typography variant="subtitle2">Date Time: {idea.dateTime}</Typography>
              <Typography variant="subtitle2">Details: {idea.details}</Typography>
              <Typography variant="subtitle2">Embed Code: {idea.embedCode}</Typography>

              <Typography variant="subtitle2">By: {idea.creator}</Typography>
              <Typography variant="subtitle2">Date: {idea.date}</Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </>
  );
};

export default IdeasPage;
