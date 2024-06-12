import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Homepagewhite.css'
import './HomepageNav.css'

function HomePageWhite (){
    return (
    <div className="container2">
      <div className="row align-items-center">
        <div className="col-md-6">
          <div className="illustration">
            <img src="src/assets/CreativePotential.jpg" alt="Illustration" className="img-fluid" />
          </div>
        </div>
        <div className="col-md-6">
          <div className="text-center text-md-left" style={{paddingRight: 20, paddingLeft: 20}}>
            <h1>Automate your Event Managment</h1>
            <p>Our app empowers you to unleash your ability to organize and be part of remarkable events. Whether you're planning a solo exhibition, a live performance, or a collaborative workshop, our platform provides the tools and features you need to make your events a resounding success.</p>
            <div className='buttons'>
              <button style={{backgroundColor: '#646cff', color: 'white'}}>Get Started</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePageWhite;