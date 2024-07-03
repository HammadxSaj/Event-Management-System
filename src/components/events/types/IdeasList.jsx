import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import DisplayCards from '../DisplayCards'; // Adjusted path as per typical file structure
import NavBar from '../../Home/NavBar';
import { db } from '../../../Firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useParams, useNavigate } from "react-router-dom";
import AddIdeasButton from '../../admin/AddIdeasButton';

import '../DisplayCards.css';

const IdeasList = () => {
  const [ideas, setIdeas] = useState([]);
  const navigate = useNavigate();
  const { eventId } = useParams();

  useEffect(() => {
    console.log('Event ID:', eventId); // Check if eventId is being retrieved correctly

    const fetchIdeas = async () => {
      try {
        const ideasSnapshot = await getDocs(collection(db, 'ideas'));
        const ideasData = ideasSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          location: doc.data().location,
          dateTime: new Date(doc.data().dateTime),
          description: doc.data().description,
          details: doc.data().details,
          images: doc.data().images || [],
          upvote: doc.data().upvote || [],
          downvote: doc.data().downvote || [],
          creator: doc.data().creator,
        }));
        setIdeas(ideasData);
      } catch (error) {
        console.error('Error fetching ideas:', error);
      }
    };

    fetchIdeas();
  }, [eventId]); // Adding eventId as a dependency to the useEffect

  const handleBack = () => {
    navigate('/');
  };

  

  return (
    <>
      <NavBar />
      
      <div className="ideas-list-container">
        <div className="header-section">
          <h1 className="header-title">Explore the best ideas!</h1>
        </div>

        <h2>The Ideas</h2>

        <AddIdeasButton eventId={eventId}/>
        <Grid container spacing={4} justifyContent="center">
          {ideas.map((idea) => (
        
            <Grid item key={idea.id}>
              <DisplayCards idea={idea} />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default IdeasList;
