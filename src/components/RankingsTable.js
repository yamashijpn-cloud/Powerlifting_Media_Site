import React from 'react';
import './RankingsTable.css'; // Import the CSS file

const RankingsTable = ({ lifters }) => {
  return (
    <div className="rankings-table-container">
      <table className="rankings-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Country</th>
            <th>Class</th>
            <th>Total</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {lifters.map((lifter, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{lifter.lifterName}</td>
              <td>{lifter.country}</td>
              <td>{lifter.weightClass}</td>
              <td>{lifter.total}</td>
              <td>{lifter.glPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingsTable;
