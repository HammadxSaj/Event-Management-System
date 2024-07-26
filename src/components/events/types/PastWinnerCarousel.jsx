import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import PastIdeas from './PastIdeas';
import "../../events/DisplayCards.css"

const PastWinnersCarousel = ({ eventsWithWinners }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1
        }
      }
    ]
  };

  return (
    <div className="past-winners-section">
      <Slider {...settings}>
        {eventsWithWinners.map(event => (
          <div key={event.id}>
            {event.winnerIdeas && event.winnerIdeas.map((idea, index) => (
              <div key={index}>
                {idea && idea.id === event.winnerIdea && (
                  <div>  
                    <PastIdeas idea={idea} eventId={event.id} eventTitle={event.title} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default PastWinnersCarousel;
