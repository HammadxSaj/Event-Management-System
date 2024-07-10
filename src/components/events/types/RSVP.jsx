import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../../Firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { Container, Card, Button, Typography } from "@mui/material";
import {
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import "./RSVP.css";

const RSVP = () => {
  const navigate = useNavigate();
  const { eventId, ideaId } = useParams();
  const [idea, setIdea] = useState(null);
  const [response, setResponse] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [rsvpQuestions, setRsvpQuestions] = useState([]);
  const [rsvpResponses, setRsvpResponses] = useState({});

  useEffect(() => {
    const fetchCurrentUser = () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user);
      }
    };

    const fetchIdea = async () => {
      try {
        const ideaRef = doc(db, "events", eventId, "ideas", ideaId);
        const ideaDoc = await getDoc(ideaRef);

        if (ideaDoc.exists()) {
          setIdea(ideaDoc.data());
          setRsvpQuestions(ideaDoc.data().rsvpQuestions || []);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching idea:", error);
      }
    };

    fetchCurrentUser();
    fetchIdea();
  }, [eventId, ideaId]);

  const handleRsvpResponseChange = (question, answer) => {
    setRsvpResponses({
      ...rsvpResponses,
      [question]: answer,
    });
  };

  const handleResponse = async (isAvailable) => {
    try {
      if (!currentUser) {
        console.error("User not logged in");
        return;
      }

      const rsvpRef = collection(
        db,
        "events",
        eventId,
        "ideas",
        ideaId,
        "rsvp"
      );
      await addDoc(rsvpRef, {
        userEmail: currentUser.email,
        isAvailable: isAvailable,
        responses: rsvpResponses,
      });
      setResponse(isAvailable ? "Yes" : "No");

      setTimeout(() => {
        navigate(`/event/${eventId}/ideas`);
      }, 2000);
    } catch (error) {
      console.error("Error updating response:", error);
    }
  };

  if (!idea) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <button
        className="back-button"
        onClick={() => navigate(`/event/${eventId}/ideas`)}
      >
        Back
      </button>
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="p-4 shadow-lg form-card">
          <h2 className="text-center mb-4">RSVP</h2>
          <Typography variant="h4" component="div" gutterBottom>
            {idea.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {idea.description}
          </Typography>
          <div className="rsvp-questions-section mt-4">
            {rsvpQuestions.map((question, index) => (
              <FormControl
                component="fieldset"
                key={index}
                className="rsvp-question mb-3"
              >
                <FormLabel component="legend">{question}</FormLabel>
                <RadioGroup
                  row
                  name={`response-${index}`}
                  onChange={(e) =>
                    handleRsvpResponseChange(question, e.target.value)
                  }
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            ))}
          </div>
          <Typography variant="h6" component="div" gutterBottom>
            Will you be available to be part of this event?
          </Typography>
          <div className="d-flex justify-content-around">
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleResponse(true)}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleResponse(false)}
            >
              No
            </Button>
          </div>
          {response && (
            <Typography variant="body1" paragraph className="text-center mt-4">
              You have responded: {response}
            </Typography>
          )}
        </Card>
      </Container>
    </>
  );
};

export default RSVP;
