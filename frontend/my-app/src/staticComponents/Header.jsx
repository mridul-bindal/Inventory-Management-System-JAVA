// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserEmail, isOwner } from "../utils/auth";
import "../styles/Header.css";

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("User");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user email from localStorage
    const email = getCurrentUserEmail();
    setUserEmail(email || "User");
    // Set role based on email
    setUserRole(isOwner() ? "Owner" : "User");
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    
    // Redirect to login page
    navigate("/login");
  };

  const handleViewProfile = () => {
    setShowDropdown(false);
    // You can navigate to a profile page or show a modal
    alert(`Profile Information:\n\nEmail: ${userEmail}\n\nProfile page coming soon!`);
  };

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
        
        <div className="avatar-dropdown-container" ref={dropdownRef}>
          <img 
            src="https://i.pravatar.cc/40" 
            alt="avatar" 
            className="avatar" 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ cursor: "pointer" }}
          />
          
          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  <img src="https://i.pravatar.cc/40" alt="avatar" />
                </div>
                <div className="dropdown-user-info">
                  <div className="dropdown-email">{userEmail}</div>
                  <div className="dropdown-role">{userRole}</div>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <div className="dropdown-menu">
                <button 
                  className="dropdown-item" 
                  onClick={handleViewProfile}
                >
                  <span className="dropdown-icon">👤</span>
                  View Profile
                </button>
                <button 
                  className="dropdown-item dropdown-item-danger" 
                  onClick={handleLogout}
                >
                  <span className="dropdown-icon">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
