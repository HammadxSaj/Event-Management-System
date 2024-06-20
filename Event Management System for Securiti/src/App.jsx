import { useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SignIn from './components/auth/SignIn'
import SignUp from './components/auth/SignUp'
import Home from './components/Home/Home'
import Admin from './components/auth/Admin';
import EventsPage from './components/events/EventsPage';
import AddEventButton from './components/admin/AddEventButton';
import EventForm from './components/admin/EventForm';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Route, Routes } from "react-router-dom"
import EventDescription from './components/events/EventDescription';


function App() {
  const [count, setCount] = useState(0);

  return (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
  <BrowserRouter>

    <CssBaseline />
    

    <Routes>
      {/* set the initial route to Home */}
      <Route path="/" element={<AddEventButton />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/admin" element = {<Admin/>}/>
      <Route path = "/event" element = {<EventsPage/>}/>
      <Route path="/event/:eventId" element={<EventDescription />} /> 
    
      <Route path="/eventform" element={<EventForm />} />
    </Routes>

  </BrowserRouter>
  </LocalizationProvider>
  )
}

export default App;
