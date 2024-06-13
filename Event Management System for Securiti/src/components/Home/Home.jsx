import React from 'react';
import HomePageNav from './HomepageNav'
import NavBar from './NavBar'
import HomePageWhite from './Homepagewhite'
import HomepageCards from './HomepageCards';
import Footer from './Footer';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

function Home() {
    return (
        <div>
            <NavBar />
            <HomePageNav />
            <HomePageWhite />
            <HomepageCards />
            <Footer />
        </div> 
    );
}

export default Home;