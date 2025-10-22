import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import lifters from '../data/lifters.json';
import WeightClass from '../components/WeightClass';
import '../App.css';

const AthletesPage = () => {
  const { gender } = useParams();
  const navigate = useNavigate();

  // Default to 'male' if gender is not provided or invalid
  const currentGender = ['male', 'female'].includes(gender) ? gender : 'male';

  const [selectedWeightClass, setSelectedWeightClass] = useState(Object.keys(lifters[currentGender])[0]);

  useEffect(() => {
    // If the gender in the URL is invalid, navigate to the default
    if (!['male', 'female'].includes(gender)) {
      navigate('/athletes/male', { replace: true });
    } else {
      // When gender changes, reset the weight class
      setSelectedWeightClass(Object.keys(lifters[gender])[0]);
    }
  }, [gender, navigate]);

  const weightClasses = Object.keys(lifters[currentGender]);

  return (
    <div>
      <nav className="menu">
        {weightClasses.map(wc => (
          <button
            key={wc}
            className={`menu-tab ${selectedWeightClass === wc ? 'active' : ''}`}
            onClick={() => setSelectedWeightClass(wc)}
          >
            {wc}
          </button>
        ))}
      </nav>
      {selectedWeightClass && (
        <WeightClass
          key={selectedWeightClass}
          weightClass={selectedWeightClass}
          lifters={lifters[currentGender][selectedWeightClass]}
        />
      )}
    </div>
  );
};

export default AthletesPage;
