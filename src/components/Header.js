import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const handleMouseEnter = () => {
    setDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    setDropdownVisible(false);
  };

  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/">ボノロンのパワーリフティング情報</Link>
      </div>
      <nav className="main-nav">
        <ul>
          <li><Link to="/">ホーム</Link></li>
          <li><Link to="/rankings">ランキング</Link></li>
          <li
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="dropdown-container"
          >
            <Link to="/athletes/male">選手</Link>
            {isDropdownVisible && (
              <ul className="dropdown-menu">
                <li><Link to="/athletes/male">男子</Link></li>
                <li><Link to="/athletes/female">女子</Link></li>
              </ul>
            )}
          </li>
          <li><Link to="/events">大会情報</Link></li>
          <li><Link to="/about">概要</Link></li>
        </ul>
      </nav>
      <div className="header-right">
        <div className="search-bar">
          <input type="text" placeholder="検索..." />
          <button>検索</button>
        </div>
      </div>
    </header>
  );
};

export default Header;