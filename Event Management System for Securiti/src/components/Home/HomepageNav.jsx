import React from 'react';
import './HomepageNav.css'
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

function HomepageNav(){

    const navigate = useNavigate()
    return (
        <div className="home-page">
            <img src="src/assets/LogoBGremoved.png" alt="Logo" style={{width: 400, height:400, paddingTop:0}}/>
            <h1>One Spot</h1>
            <h2>Event Planner</h2>
            <p>Curate Unforgettable Events</p>
            <div className="buttons">
                <Button className="get-started" style={{backgroundColor: '#646cff', color: 'white'}} onClick={() => navigate('/signup')}>Get Started</Button>
                <Button className="login" style={{backgroundColor: '#646cff', color: 'black'}} onClick={() => navigate('/signin')}>Login</Button>
            </div>
        </div>
    );
}

export default HomepageNav;