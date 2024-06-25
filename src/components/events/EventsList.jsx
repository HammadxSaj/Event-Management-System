import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import DisplayCards from './DisplayCards';
import NavBar from '../Home/NavBar';
import { db, auth } from '../../Firebase'; // Import your Firebase configuration
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import './EventsList.css'; // Import the CSS file
import AddEventButton from '../admin/AddEventButton';
import CountdownTimer from './CountdownTimer'; // Import the CountdownTimer component


const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [votingEnded, setVotingEnded] = useState(false); // Track if voting has ended

  const votingEndDate = new Date('2024-06-25T11:13:00'); // Dummy end date for voting

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
              downvote: eventDoc.data().downvote || [],
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
        setTimeRemaining(`0d 0h 0m 0s`);
        setVotingEnded(true); // Set votingEnded to true when voting period is over
       
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
          <h2> Countdown Timer</h2>
          <CountdownTimer timeRemaining={timeRemaining} votingEnded={votingEnded} /> {/* Add CountdownTimer */}
        </div>
        <Grid container spacing={4} justifyContent="center">
          {events.map((event) => (
            <Grid item key={event.id}>
              <DisplayCards event={event} votingEnded={votingEnded} /> {/* Pass votingEnded as prop */}
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default EventsList;

