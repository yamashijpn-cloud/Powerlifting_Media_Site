import React, { useState, useEffect, useMemo } from 'react';
import rankingsData from '../data/rankings.json';
import RankingsTable from '../components/RankingsTable';
import FilterBar from '../components/FilterBar';
import '../components/FilterBar.css';
import './RankingsPage.css'; // Import the new CSS file

const RankingsPage = () => {
  const [lifters, setLifters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10; // Display 10 items per page
  const [filters, setFilters] = useState({
    gender: 'All',
    equipment: 'All',
    weightClass: 'All',
    sortBy: 'glPoints',
  });

  const options = useMemo(() => {
    const genders = [...new Set(rankingsData.map(item => item.gender))].filter(g => g === 'M' || g === 'F'); // filter(Boolean) removes any null/undefined values
    const equipment = [...new Set(rankingsData.map(item => item.equipment))].filter(Boolean);
    const weightClasses = [...new Set(rankingsData.map(item => item.weightClass))].filter(Boolean).sort((a, b) => {
      const numA = parseFloat(a.replace(/[^0-9.]/g, ''));
      const numB = parseFloat(b.replace(/[^0-9.]/g, ''));
      return numA - numB;
    });
    return { genders, equipment, weightClasses };
  }, []);

  useEffect(() => {
    setIsLoading(true);
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
    setTotalItems(sortedData.length);
    setTotalPages(Math.ceil(sortedData.length / itemsPerPage));
    
    // Apply pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
    
    setLifters(currentItems);
    setIsLoading(false);
  }, [filters, currentPage]); // Removed totalItems from dependencies

  // Calculate indexOfFirstItem and indexOfLastItem here for rendering
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <div className="rankings-page">
      <div className="rankings-container">
        <h1>Rankings</h1>
        <FilterBar filters={filters} setFilters={setFilters} options={options} />
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <RankingsTable lifters={lifters} startRank={indexOfFirstItem} />
            <div className="pagination">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</button>
              {/* Calculate page range for display */}
              {(() => {
                const pageRangeStart = Math.max(1, currentPage - 5);
                const pageRangeEnd = Math.min(totalPages, currentPage + 5);
                const pages = [];
                for (let i = pageRangeStart; i <= pageRangeEnd; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      disabled={currentPage === i}
                      className={currentPage === i ? 'active' : ''}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RankingsPage;
