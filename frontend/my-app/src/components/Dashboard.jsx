// src/pages/Dashboard.jsx  (or wherever your Dashboard lives)
import React from "react";
import "../styles/Dashboard.css"; // keep general layout + cards + charts + tables

import Nav from "../staticComponents/NavBar";
import Header from "../staticComponents/Header";

export default function Dashboard() {
  return (
    <div className="app-root">
      <Nav />

      <main className="main-area">
        <Header />

        <section className="metrics-row">
          {["Revenue", "Sales Return", "Purchase", "Income"].map((title, idx) => (
            <div key={idx} className="metric-card">
              <div className="metric-title">{title}</div>
              <div className="metric-value">
                + <span>30,000</span>
              </div>
            </div>
          ))}
        </section>

        <section className="content-row">
          <div className="big-card chart-card">
            <div className="card-inner">
              <h4 className="card-title">Monthly overview</h4>

              <div className="bar-chart" role="img" aria-label="bar chart">
                <div className="bars">
                  <div className="bar-group">
                    <div className="bar yellow" style={{ height: "140px" }} />
                    <div className="bar blue" style={{ height: "120px" }} />
                  </div>

                  <div className="bar-group">
                    <div className="bar yellow" style={{ height: "100px" }} />
                    <div className="bar blue" style={{ height: "160px" }} />
                  </div>

                  <div className="bar-group">
                    <div className="bar yellow" style={{ height: "110px" }} />
                    <div className="bar blue" style={{ height: "155px" }} />
                  </div>

                  <div className="bar-group">
                    <div className="bar yellow" style={{ height: "105px" }} />
                    <div className="bar blue" style={{ height: "165px" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="small-card pie-card">
            <h4 className="card-title">Top selling Products</h4>
            <div className="pie-placeholder" aria-hidden />
          </div>
        </section>

        <section className="tables-row">
          <div className="table-card">
            <h4 className="card-title">Stock Alert</h4>
            <table>
              <thead>
                <tr>
                  <th>order ID</th>
                  <th>Date</th>
                  <th>Quantity</th>
                  <th>Alert amt.</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td>order ID</td>
                    <td>Date</td>
                    <td>Quantity</td>
                    <td>Alert amt.</td>
                    <td>Status</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-card small-right">
            <h4 className="card-title">Top selling Products</h4>
            <table>
              <thead>
                <tr>
                  <th>order ID</th>
                  <th>Quantity</th>
                  <th>Alert amt.</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td>order ID</td>
                    <td>Quantity</td>
                    <td>Alert amt.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
