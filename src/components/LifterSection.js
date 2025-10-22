import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';

const LifterSection = ({ genderTitle, liftersData, getWeightClassNumber }) => {
  return (
    <div className="gender-section">
      <h2>{genderTitle}</h2>
      {Object.entries(liftersData)
        .sort(([wcA], [wcB]) => {
          return getWeightClassNumber(wcB) - getWeightClassNumber(wcA); // 重い順（降順）にソート
        })
        .map(([weightClass, lifters]) => (
          <div key={weightClass} className="weight-class-section">
            <h3>{weightClass}</h3>
            <div className="lifter-list">
              {lifters.map(lifter => (
                <div key={lifter.name} className="lifter-card">
                  {lifter.instagramId ? (
                    <a href={`https://instagram.com/${lifter.instagramId}`} target="_blank" rel="noopener noreferrer">
                      <FontAwesomeIcon icon={faInstagram} size="6x" className="lifter-instagram-icon" /> 
                    </a>
                  ) : (
                    <img src={lifter.image} alt={lifter.name} className="lifter-image" />
                  )}
                  <h4>{lifter.name}</h4>
                  <p>Squat: {lifter.squat || '-'}</p>
                  <p>Bench: {lifter.bench || '-'}</p>
                  <p>Deadlift: {lifter.deadlift || '-'}</p>
                  <p>Total: {lifter.total || '-'}</p>
                  <div className="lifter-sns-links">
                    {lifter.instagramId && (
                      <a href={`https://instagram.com/${lifter.instagramId}`} target="_blank" rel="noopener noreferrer" className="sns-link">
                        <FontAwesomeIcon icon={faInstagram} /> @{lifter.instagramId}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default LifterSection;