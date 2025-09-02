import React, { useState, useEffect } from 'react';
import rankingsData from '../data/mockRankings.json';
import RankingsTable from '../components/RankingsTable';

const RankingsPage = () => {
  const [lifters, setLifters] = useState([]);

  useEffect(() => {
    // Sort data by total in descending order
    const sortedData = [...rankingsData].sort((a, b) => b.total - a.total);
    
    // Get top 50
    const top50 = sortedData.slice(0, 50);
    
    setLifters(top50);
  }, []);

  return (
    <div>
      <h1>Rankings</h1>
      <RankingsTable lifters={lifters} />
    </div>
  );
};

export default RankingsPage;
