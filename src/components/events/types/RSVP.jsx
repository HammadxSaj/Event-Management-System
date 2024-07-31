import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for making HTTP requests
import { db, auth } from "../../../Firebase";
import { doc, getDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { Container, Card, Button, Typography } from "@mui/material";
import EmailIcon from '@mui/icons-material/Email';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaSleigh } from 'react-icons/fa';
import {
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import "./RSVP.css";
import NavBar from "../../Home/NavBar";
import DisplayWinner from "./DisplayWinners";
import { useAuth } from "../../auth/AuthContext";
import PersonIcon from '@mui/icons-material/Person';
const RSVP = () => {
  const navigate = useNavigate();
  const { eventId, ideaId } = useParams();
  console.log("EventId",eventId);
  const [idea, setIdea] = useState(null);
  const [response, setResponse] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [rsvpQuestions, setRsvpQuestions] = useState([]);
  const [rsvpResponses, setRsvpResponses] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const { authUser, loading } = useAuth();

  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authUser && authUser.uid) {
        console.log('Fetching user profile for UID:', authUser.uid);
        const userDoc = await getDoc(doc(db, 'user_data', authUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
          console.log('User profile data:', userData);
          console.log('Profile photo URL:', userData.photoURL);
        } else {
          console.log('No such document!');
        }
      }
    };

    fetchUserProfile();


  }, [authUser]);

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
          const ideaData = ideaDoc.data();

          // Fetch the images associated with the idea
          const imagesCollection = collection(ideaRef, "images");
          const imagesSnapshot = await getDocs(imagesCollection);
          const imageUrls = imagesSnapshot.docs.map(
            (imageDoc) => imageDoc.data().imageUrls[0]
          );

          const ideaWithImages = {
            ...ideaData,
            images: imageUrls,
          };

          setIdea(ideaWithImages);




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

      // console.log("the current user is:", currentUser.email);

      // Prepare the responses HTML
      const responsesHtml = Object.entries(rsvpResponses)
        .map(
          ([question, answer]) =>
            `<p><strong>${question}:</strong> ${answer}</p>`
        )
        .join("");

      // Send email notification
      await axios.post("https://eventiti-backend.vercel.app/send-email", {
        to: currentUser.email,
        subject: "RSVP Confirmation",
        html: `<strong>You have responded with ${
          isAvailable ? "Yes" : "No"
        } to the RSVP form for the event ${idea.title}</strong>
             ${responsesHtml}`,
      });

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
    <Container className="rsvp-container rsvp-page">
    <NavBar eventId={eventId}/>
    <div className="header-container">
      <h1 className="header-title">Register</h1>
      <h3 className='header-slogan'>Don't Miss Out - Register Now for an Unforgettable Experience!</h3>
    </div>
    

        <div className="image-container">
          {idea.images.length > 0 && (
            <img src={idea.images[0]} alt="Winner Idea" className="winner-image" />
          )}
        
        </div>
        <div className="deets-container">
          <h2 className="deets-title">{idea.title}</h2> 
          <h2 className="rsvp-detail">{idea.description}</h2>
        </div>
        
    


      <Container className="rsvp-container">
        <Card className="p-4 shadow-lg rsvp-form-card">
        

     
          {userProfile && userProfile.photoURL && (
     
                      
            <div className="profile-picture-container text-center mb-4">
              <img
                src={userProfile.photoURL}
                alt="User Profile"
                className="user-profile-picture"
              />

              <div className="rsvp-user-info"> 
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Typography variant="h6" component="div">
                  <h1 className="rsvp-username">{userProfile.displayName}</h1>
                </Typography>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <PersonIcon style={{ fontSize: 20, marginRight: '8px', color: "#4C4E54" }}/>
                  <Typography variant="body2" color="text.secondary">
                    {userProfile.uid}
                  </Typography>
                </div>
          

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <EmailIcon style={{ fontSize: 18, marginRight: '8px', color: "#4C4E54" }}  />
                <Typography variant="body2" color="textSecondary">
                  {userProfile.email}
                </Typography>
                </div>
            
              </div>


          
            <div className="rsvp-idea-deets"> 
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <FaCalendarAlt style={{ marginRight: '8px', color: "#D96758" }} />
                <Typography variant="body2" color="text.secondary">
                 <h2 className="rsvp-idea">{new Date(idea.dateTime).toLocaleDateString()}</h2>
                </Typography>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <FaClock style={{ marginRight: '8px', color: "#D96758" }} />
                <Typography variant="body2" color="text.secondary">
                  <h2 className="rsvp-idea">{new Date(idea.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h2>
                </Typography>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <FaMapMarkerAlt style={{ marginRight: '8px', color: "#D96758" }} />
                <Typography variant="body2" color="text.secondary">
                  <h2  className="rsvp-idea">{idea.location}</h2>
                </Typography>
              </div>
            </div>






            </div>
            
          )}

          <hr></hr>
          <h3 className="rsvp-title">RSVP Form</h3>

          <div className="rsvp-questions-section mt-4">
            {rsvpQuestions.map((question, index) => (
              <div key={index} className="rsvp-question mb-3">
                <FormControl component="fieldset">
                  <FormLabel component="legend">{index + 1}. {question}</FormLabel>
                  <RadioGroup
                    row
                    name={`response-${index}`}
                    onChange={(e) =>
                      handleRsvpResponseChange(question, e.target.value)
                    }
                    className="d-flex justify-content-start"
                  >
                    <FormControlLabel
                      value="yes"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </div>
            ))}
          </div>


          <hr></hr>
          <div className="rsvp-question">

          <Typography variant="h6" component="div" gutterBottom>
            <h3 className="rsvp-mandatory-question">Will you be available to be part of this event?</h3>
          </Typography>
          <div className="d-flex justify-content-around">
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleResponse(true)}
              className="rsvp-no-button"
            >
              Yes
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleResponse(false)}
              className="rsvp-no-button"
            >
              No
            </Button>
          </div>
          {response && (
            <Typography variant="body1" paragraph className="text-center mt-4">
              You have responded: {response}
            </Typography>
          )}
          </div>
        </Card>
    
      </Container>
      </Container>
    </>
  );
};

export default RSVP;
