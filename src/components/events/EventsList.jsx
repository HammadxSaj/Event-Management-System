import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import DisplayCards from './DisplayCards';
import NavBar from '../Home/NavBar';
import { db, auth } from '../../Firebase'; // Import your Firebase configuration
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import './EventsList.css'; // Import the CSS file
import AddEventButton from '../admin/AddEventButton';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [userRole, setUserRole] = useState(null); 
  const [timeRemaining, setTimeRemaining] = useState('');

  const votingEndDate = new Date('2024-07-01T00:00:00'); // Dummy end date for voting

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);
        
        const fetchedEvents = [];
        for (const docRef of eventsSnapshot.docs) {
          const eventDoc = await getDoc(docRef.ref);
          if (eventDoc.exists()) {
            const event = {
              id: docRef.id,
              title: eventDoc.data().title,
              date: eventDoc.data().dateTime,
              description: eventDoc.data().description,
              images: [],
              upvote: eventDoc.data().upvote || [],
              downvote: eventDoc.data().downvote || []
            };

            const imagesCollection = collection(docRef.ref, 'images');
            const imagesSnapshot = await getDocs(imagesCollection);
            imagesSnapshot.forEach((imageDoc) => {
              const imageUrl = imageDoc.data().imageUrls;
              if (imageUrl) {
                event.images.push(imageUrl[0]);
              }
            });

            fetchedEvents.push(event);
          }
        }

        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const fetchUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchEvents();
    fetchUserRole();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const distance = votingEndDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);

      if (distance < 0) {
        clearInterval(interval);
        setTimeRemaining('Voting ended');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [votingEndDate]);

  return (
    <>
      <NavBar />
      {userRole === 'admin' && (
        <div style={{ float: 'right' }}>
          <AddEventButton />
        </div>
      )}
      <div className="events-list-container">
        <div className="header-section">
          <h1 className="header-title">Explore the best event ideas to choose from!</h1>
          <p className="countdown">Voting ends in: {timeRemaining}</p>
        </div>
        <Grid container spacing={4} justifyContent="center">
          {events.map((event) => (
            <Grid item key={event.id}>
              <DisplayCards event={event} />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default EventsList;
