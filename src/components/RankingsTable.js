import React from 'react';
import './RankingsTable.css';

const RankingsTable = ({ lifters, startRank }) => {
  return (
    <div className="rankings-table-container">
      <table className="rankings-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Country</th>
            <th>Class</th>
            <th>Weight</th>
            <th>Squat</th>
            <th>Bench</th>
            <th>Deadlift</th>
            <th>Total</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {lifters.map((lifter, index) => (
            <tr key={lifter.id}>
              <td>{startRank + index + 1}</td>
              <td>
                {lifter.lifterName}

              </td>
              <td>{lifter.country}</td>
              <td>{lifter.weightClass || '-'}</td>
              <td>{lifter.bodyweight || '-'}</td>
              <td>{lifter.squat || '-'}</td>
              <td>{lifter.bench || '-'}</td>
              <td>{lifter.deadlift || '-'}</td>
              <td>{lifter.total || '-'}</td>
              <td>{lifter.glPoints || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingsTable;