import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import SignIn from './components/auth/SignIn'
import SignUp from './components/auth/SignUp'
import Home from './components/Home/Home'
import Admin from './components/auth/Admin';
import EventsPage from './components/events/EventsPage';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter, Route, Routes } from "react-router-dom"
import EventDescription from './components/events/EventDescription';


function App() {
  const [count, setCount] = useState(0);

  return (<BrowserRouter>

    <CssBaseline />
    

    <Routes>
      {/* set the initial route to Home */}
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/admin" element = {<Admin/>}/>
      <Route path = "/event" element = {<EventsPage/>}/>
      <Route path="/event/:eventId" element={<EventDescription />} /> 
    
    </Routes>

  </BrowserRouter>
  )
}

export default App;

