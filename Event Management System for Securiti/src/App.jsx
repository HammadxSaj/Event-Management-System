import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import SignIn from './components/auth/SignIn'
import SignUp from './components/auth/SignUp'
import HomePageNav from '../components/Home/HomepageNav'
import NavBar from '../components/Home/NavBar'
import HomePageWhite from '../components/Home/Homepagewhite'


function App() {
  const [count, setCount] = useState(0);

  return (
    <>
        <NavBar/>
        {/* <HomePageNav/>
        <HomePageWhite/> */}
        {/* <SignIn/> */}
        <SignUp/>      
    </>
  );
}

export default App;

