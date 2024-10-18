import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Booking Platforms</h1>
      <Link to="/booking">
        <button>Book Now</button>
      </Link>
    </div>
  );
};

export default Home;
