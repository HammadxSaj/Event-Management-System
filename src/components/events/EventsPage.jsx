import React, { useEffect, useState } from 'react';
import EventsList from './EventsList';
import { db } from '../../Firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const EventsPage = () => {
  const [events, setEvents] = useState([]);

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
              images: ''
            };

            // Fetch images for the event
            const imagesCollection = collection(docRef.ref, 'images');
            const imagesSnapshot = await getDocs(imagesCollection);
            console.log(event);
            imagesSnapshot.forEach((imageDoc) => {
              const imageUrl = imageDoc.data().imageUrls;
              if (imageUrl) {
                event.images = imageUrl[0];
                // event.images.push(imageUrl);
             
                console.log('Testing event image in EventsPage');
                console.log(`Image Link ${event.id}:`, event.images);
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

    fetchEvents();
  }, []);

  return <EventsList events={events} />;
};

export default EventsPage;
