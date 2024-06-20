import React from 'react';
import EventsList from './EventsList';
import logo from '../../assets/Logo.png';
import eventi from '../../assets/event1.jpg'
import event2 from '../../assets/event2.jpg'
import event3 from '../../assets/event3.jpg'

const EventsPage = () => {
  const events = [
    {
      id: '1',
      title: 'Event 1',
      date: '2024-07-01',
      description: 'This is a short description of Event 1.',
      image: eventi,
    },
    {
      id: '2',
      title: 'Event 2',
      date: '2024-07-15',
      description: 'This is a short description of Event 2.',
      image: event2,
    },
    {
      id: '3',
      title: 'Event 3',
      date: '2024-08-01',
      description: 'This is a short description of Event 3.',
      image: event3,
    },
    // Add more events as needed
  ];

  return <EventsList events={events} />;
};

export default EventsPage;
