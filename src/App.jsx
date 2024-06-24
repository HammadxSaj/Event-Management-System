// src/App.js
import { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Home from './components/Home/Home';
import Admin from './components/auth/Admin';
import EventsPage from './components/events/EventsPage';
import AddEventButton from './components/admin/AddEventButton';
import EventForm from './components/admin/EventForm';
import { CssBaseline } from '@mui/material';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import EventDetails from './components/events/EventDetails';
import User from './components/auth/User';
import { AuthProvider } from './components/auth/AuthContext';
import AuthDetails from './components/auth/AuthDetails'; // Import AuthDetails component

function App() {
  const [count, setCount] = useState(0);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <BrowserRouter>
        <CssBaseline />
        <AuthProvider>
          <AuthDetails /> {/* Add AuthDetails component here */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/user" element={<User />} />
            <Route path="/event" element={<EventsPage />} />
            <Route path="/event/:eventId" element={<EventDetails />} />
            <Route path="/eventform" element={<EventForm />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </LocalizationProvider>
  );
}

export default App;
