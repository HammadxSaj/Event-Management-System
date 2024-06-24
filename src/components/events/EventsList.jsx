import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import DisplayCards from './DisplayCards';
import NavBar from '../Home/NavBar';
import { db, auth } from '../../Firebase'; // Import your Firebase configuration
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import './EventsList.css'; // Import the CSS file
import '../admin/AddEventButton';
import AddEventButton from '../admin/AddEventButton';
import { right } from '@popperjs/core';

const EventsList = ({ authUser }) => { // Assuming authUser is passed from a parent component or context
  const [events, setEvents] = useState([]);
  const [userRole, setUserRole] = useState(null); // State to store the user's role

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
              date: eventDoc.data().dateTime, // Assuming dateTime is stored as ISO string
              description: eventDoc.data().description,
              images: [],
              upvote: eventDoc.data().upvote || [],
              downvote: eventDoc.data().downvote || []
            };

            // Fetch images for the event
            const imagesCollection = collection(docRef.ref, 'images');
            const imagesSnapshot = await getDocs(imagesCollection);
            imagesSnapshot.forEach((imageDoc) => {
              const imageUrl = imageDoc.data().imageUrls;
              if (imageUrl) {
                event.images.push(imageUrl[0]); // Assuming you want the first URL
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
    fetchUserRole(); // Fetch user role when component mounts
  }, []);

  return (
    <>
      <NavBar />
      {userRole === 'admin' && (
        <div style={{ float: right }}>
          <AddEventButton />
        </div>
      )}
      <div className="events-list-container">
        <div className="header-section">
          <h1 className="header-title">Explore the best event ideas to choose from!</h1>
        </div>
        <Grid container spacing={4} justifyContent="center">
          {events.map((event) => (
            <Grid item key={event.id}>
              <DisplayCards event={event} authUser={authUser} />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default EventsList;
