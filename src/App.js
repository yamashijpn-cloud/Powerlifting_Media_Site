import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AthletesPage from './pages/AthletesPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/athletes/:gender" element={<AthletesPage />} />
            <Route path="/athletes" element={<AthletesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
