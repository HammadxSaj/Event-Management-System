import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import './CountdownTimer.css'; // Import the CSS file

const CountdownTimer = ({ timeRemaining, votingEnded, votingStarted }) => {
  const getTimeComponents = (time) => {
    const [days, hours, minutes, seconds] = time.split(/d|h|m|s/).map(Number);
    return { days, hours, minutes, seconds };
  };

  const { days, hours, minutes, seconds } = getTimeComponents(timeRemaining);

  useEffect(() => {
    if (votingEnded) {
      console.log('Voting has ended, displaying confetti.');
    }
  }, [votingEnded]);

  return (
    <div className="countdown-timer">
      {votingEnded && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={500}
          gravity={0.3}
          wind={0}
          run={votingEnded}
          recycle={false}
          initialVelocityY={30}
        />
      )}
      <div className="timer-component">
        <div className="timer-value">{days}</div>
        <div className="timer-label">Days</div>
      </div>
      <div className="timer-component">
        <div className="timer-value">{hours}</div>
        <div className="timer-label">Hours</div>
      </div>
      <div className="timer-component">
        <div className="timer-value">{minutes}</div>
        <div className="timer-label">Minutes</div>
      </div>
      <div className="timer-component">
        <div className="timer-value">{seconds}</div>
        <div className="timer-label">Seconds</div>
      </div>
      {votingEnded && <div className="voting-ended">Time's Up!</div>}
    </div>
  );
};

export default CountdownTimer;
