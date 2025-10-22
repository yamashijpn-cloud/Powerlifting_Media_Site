import React from 'react';

const FilterBar = ({ filters, setFilters, options }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className="filter-bar">
      {/* Gender Filter */}
      <select name="gender" value={filters.gender} onChange={handleFilterChange}>
        <option value="All">All Genders</option>
        {options.genders?.map(opt => <option key={opt} value={opt}>{opt === 'M' ? 'Male' : 'Female'}</option>)}
      </select>

      {/* Equipment Filter */}
      <select name="equipment" value={filters.equipment} onChange={handleFilterChange}>
        <option value="All">All Equipment</option>
        {options.equipment?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>

      {/* Weight Class Filter */}
      <select name="weightClass" value={filters.weightClass} onChange={handleFilterChange}>
        <option value="All">All Classes</option>
        {options.weightClasses?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>

      {/* Sort By Filter */}
      <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
        <option value="total">Sort by Total</option>
        <option value="glPoints">Sort by GL Points</option>
      </select>
    </div>
  );
};

export default FilterBar;
