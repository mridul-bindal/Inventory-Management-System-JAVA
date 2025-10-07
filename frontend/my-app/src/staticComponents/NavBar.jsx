// src/components/Nav.jsx
import React from "react";
import "../styles/Nav.css";

export default function Nav() {
  return (
    <aside className="sidebar">
      <button className="hamburger">☰</button>
      <nav>
        <ul>
          <li className="active">Home</li>
          <li>In Stock</li>
          <li>Products</li>
          <li>Sales</li>
          <li>Orders</li>
          <li>Users</li>
        </ul>
      </nav>
    </aside>
  );
}
