// src/components/Header.jsx
import React from "react";
import "../styles/Header.css";

export default function Header() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="hamburger-mobile">☰</button>
      </div>

      <div className="topbar-right">
        <div className="search-wrapper">
          <input className="search-input" placeholder="Search..." />
          <button className="search-btn" aria-label="search">🔍</button>
        </div>

        <button className="icon-btn" aria-label="notifications">🔔</button>
        <img src="https://i.pravatar.cc/40" alt="avatar" className="avatar" />
      </div>
    </header>
  );
}
