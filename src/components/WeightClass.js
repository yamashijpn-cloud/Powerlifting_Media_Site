import React from 'react';
import LifterCard from './LifterCard';

const WeightClass = ({ weightClass, lifters }) => {
  return (
    <div className="weight-class">
      <h2>{weightClass}</h2>
      <div className="lifters-grid">
        {lifters && lifters.map(lifter => (
          <LifterCard key={lifter.name} lifter={lifter} />
        ))}
      </div>
    </div>
  );
};

export default WeightClass;