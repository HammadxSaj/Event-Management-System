import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import EventsList from './EventsList';
import { db } from '../../Firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ThreeDots} from 'react-loader-spinner';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventsCollection = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);

        const fetchedEvents = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }

      finally {
        setLoading(false);
      }

    };

    fetchEvents();
  }, []);

  return (
    <div>
    {loading ? (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ThreeDots height="80" width="80" color="#1CA8DD" ariaLabel="loading" />
      </div>
    ) : (
      <EventsList events={events} />
    )}
    </div>
  )
  ;
};

export default EventsPage;
