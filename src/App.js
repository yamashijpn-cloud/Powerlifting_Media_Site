import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AthletesPage from './pages/AthletesPage';
import RankingsPage from './pages/RankingsPage';
import EventsPage from './pages/EventsPage'; // Import the new page

function App() {
  return (
    <Router basename="/-powerlifting-info">
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/athletes/:gender" element={<AthletesPage />} />
            <Route path="/athletes" element={<AthletesPage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/events" element={<EventsPage />} /> {/* Add the new route */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
