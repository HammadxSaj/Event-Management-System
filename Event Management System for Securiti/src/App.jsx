import { useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SignIn from './components/auth/SignIn'
import SignUp from './components/auth/SignUp'
import Home from './components/Home/Home'
import AddEventButton from './components/admin/AddEventButton';
import EventForm from './components/admin/EventForm';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Route, Routes } from "react-router-dom"


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
      <Route path="/eventform" element={<EventForm />} />
    </Routes>

  </BrowserRouter>
  </LocalizationProvider>
  )
}

export default App;
