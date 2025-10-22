import React, { useState, useEffect, useMemo } from 'react';
import liftersData from '../data/lifters.json';

import './LiftersPage.css'; // CSS for this page
// FontAwesomeIconsをインポート
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import LifterSection from '../components/LifterSection'; // Add this import

const LiftersPage = () => {
  const [selectedGender, setSelectedGender] = useState(null); // 'male', 'female', or null
  const [displayedLifters, setDisplayedLifters] = useState({ male: {}, female: {} });

  useEffect(() => {
    if (selectedGender === 'male') {
      setDisplayedLifters({ male: liftersData.male, female: {} });
    } else if (selectedGender === 'female') {
      setDisplayedLifters({ male: {}, female: liftersData.female });
    } else {
      // 初期状態または性別が選択されていない場合
      setDisplayedLifters({ male: {}, female: {} });
    }
  }, [selectedGender]);

  const getWeightClassNumber = (wc) => {
    let num = parseFloat(wc.replace(/[^0-9.]/g, ''));
    if (wc.includes('超級')) num += 0.5; // Treat '超級' as slightly higher
    return num;
  };

  return (
    <div className="lifters-page">
      <h1>Lifters by Weight Class</h1>

      {/* 性別選択ボタン */}
      <div className="gender-selection-buttons">
        <button
          className={selectedGender === 'male' ? 'active' : ''}
          onClick={() => setSelectedGender('male')}
        >
          男性
        </button>
        <button
          className={selectedGender === 'female' ? 'active' : ''}
          onClick={() => setSelectedGender('female')}
        >
          女性
        </button>
      </div>

      {/* Male Lifters */}
      {selectedGender === 'male' && (
        <LifterSection
          genderTitle="Male Lifters"
          liftersData={displayedLifters.male}
          getWeightClassNumber={getWeightClassNumber}
        />
      )}

      {/* Female Lifters */}
      {selectedGender === 'female' && (
        <LifterSection
          genderTitle="Female Lifters"
          liftersData={displayedLifters.female}
          getWeightClassNumber={getWeightClassNumber}
        />
      )}
    </div>
  );
};

export default LiftersPage;