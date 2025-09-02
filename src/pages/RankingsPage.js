import React, { useState, useEffect, useMemo } from 'react';
import rankingsData from '../data/mockRankings.json';
import RankingsTable from '../components/RankingsTable';
import FilterBar from '../components/FilterBar';
import '../components/FilterBar.css';
import './RankingsPage.css'; // Import the new CSS file

const RankingsPage = () => {
  const [lifters, setLifters] = useState([]);
  const [filters, setFilters] = useState({
    gender: 'All',
    equipment: 'All',
    weightClass: 'All',
    sortBy: 'total',
  });

  const options = useMemo(() => {
    const equipment = [...new Set(rankingsData.map(item => item.equipment))];
    const weightClasses = [...new Set(rankingsData.map(item => item.weightClass))].sort((a, b) => {
      const numA = parseFloat(a.replace(/[^0-9.]/g, ''));
      const numB = parseFloat(b.replace(/[^0-9.]/g, ''));
      return numA - numB;
    });
    return { equipment, weightClasses };
  }, []);

  useEffect(() => {
    let filteredData = [...rankingsData];

    // Apply filters
    if (filters.gender !== 'All') {
      filteredData = filteredData.filter(lifter => lifter.gender === filters.gender);
    }
    if (filters.equipment !== 'All') {
      filteredData = filteredData.filter(lifter => lifter.equipment === filters.equipment);
    }
    if (filters.weightClass !== 'All') {
      filteredData = filteredData.filter(lifter => lifter.weightClass === filters.weightClass);
    }

    // Apply sorting
    const sortedData = filteredData.sort((a, b) => b[filters.sortBy] - a[filters.sortBy]);
    
    // Get top 50
    const top50 = sortedData.slice(0, 50);
    
    setLifters(top50);
  }, [filters]);

  return (
    <div className="rankings-page">
      <div className="rankings-container">
        <h1>Rankings</h1>
        <FilterBar filters={filters} setFilters={setFilters} options={options} />
        <RankingsTable lifters={lifters} />
      </div>
    </div>
  );
};

export default RankingsPage;
