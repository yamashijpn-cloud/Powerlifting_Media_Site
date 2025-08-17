
import React from 'react';

const LifterCard = ({ lifter }) => {
  return (
    <div className="lifter-card">
      <img src={lifter.image} alt={lifter.name} />
      <p>{lifter.name}</p>
    </div>
  );
};

export default LifterCard;
