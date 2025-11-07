// src/components/Nav.jsx
import React from "react";
import "../styles/Nav.css";
import { Link } from "react-router-dom";
import { isOwner } from "../utils/auth";

export default function Nav() {
  return (
    <aside className="sidebar">
      <button className="hamburger">☰</button>
      <nav>
        <ul>
          <li>
            <Link to="/Dashboard" className="Login-redirection">
              Home
            </Link>
          </li>
          <li>
            <Link to="/Products" className="Login-redirection">
              Products
            </Link>
          </li>
          <li>
            <Link to="/Sales" className="Login-redirection">
              Sales
            </Link>
          </li>
          <li>
            <Link to="/Orders" className="Login-redirection">
              Orders
            </Link>
          </li>
          {isOwner() && (
            <li>
              <Link to="/Owners" className="Login-redirection">
                Owners
              </Link>
            </li>
          )}
          
        </ul>
      </nav>
    </aside>
  );
}
