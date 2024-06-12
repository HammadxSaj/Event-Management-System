import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import SignIn from './components/auth/SignIn'
import SignUp from './components/auth/SignIn'
import HomePageNav from '../components/Home/HomepageNav'
import NavBar from '../components/Home/NavBar'
import HomePageWhite from '../components/Home/Homepagewhite'
import HomepageCards from '../components/Home/HomepageCards';
import Footer from '../components/Home/Footer';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';


function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <NavBar />
      <HomePageNav />
      <HomePageWhite />
      <CssBaseline />
      <HomepageCards />
      <Footer />
      {/* <SignIn/>
        <SignUp/>       */}
    </>
  );
}

export default App;
