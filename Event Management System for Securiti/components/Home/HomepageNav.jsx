import React from 'react';
import './HomepageNav.css'
import Button from 'react-bootstrap/Button';

function HomepageNav(){
    return (
        <div className="home-page">
            <h1>One Spot</h1>
            <h2>Event Planner</h2>
            <p>Curate Unforgettable Events</p>
            <div className="buttons">
                <Button className="get-started" style={{backgroundColor: '#646cff', color: 'white'}}>Get Started</Button>
                <Button className="login" style={{backgroundColor: '#646cff', color: 'black'}}>Login</Button>
            </div>
        </div>
    );
}

export default HomepageNav;