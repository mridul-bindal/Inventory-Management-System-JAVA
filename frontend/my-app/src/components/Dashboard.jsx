// src/pages/Dashboard.jsx  (or wherever your Dashboard lives)
import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css"; // keep general layout + cards + charts + tables

import Nav from "../staticComponents/NavBar";
import Header from "../staticComponents/Header";
import { getDashboardStats } from "../api/dashboard";

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format number
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="app-root">
        <Nav />
        <main className="main-area">
          <Header />
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-root">
        <Nav />
        <main className="main-area">
          <Header />
          <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
            Error loading dashboard: {error}
          </div>
        </main>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="app-root">
        <Nav />
        <main className="main-area">
          <Header />
          <div style={{ padding: '2rem', textAlign: 'center' }}>No data available</div>
        </main>
      </div>
    );
  }

  const { metrics, lowStockProducts, recentOrders, topSellingProducts, monthlyData } = stats;

  // Calculate max value for chart scaling
  const maxChartValue = Math.max(
    ...monthlyData.map(m => Math.max(m.revenue, m.profit)),
    100 // minimum height
  );

  return (
    <div className="app-root">
      <Nav />

      <main className="main-area">
        <Header />

        <section className="metrics-row">
          <div className="metric-card">
            <div className="metric-title">Total Revenue</div>
            <div className="metric-value">
              + <span>{formatCurrency(metrics.totalRevenue)}</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-title">Total Profit</div>
            <div className="metric-value">
              + <span>{formatCurrency(metrics.totalProfit)}</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-title">Total Orders</div>
            <div className="metric-value">
              <span>{formatNumber(metrics.totalOrders)}</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-title">Total Products</div>
            <div className="metric-value">
              <span>{formatNumber(metrics.totalProducts)}</span>
            </div>
          </div>
        </section>

        <section className="content-row">
          <div className="big-card chart-card">
            <div className="card-inner">
              <h4 className="card-title">Monthly overview</h4>

              <div className="bar-chart" role="img" aria-label="bar chart">
                <div className="bars">
                  {monthlyData.map((month, idx) => {
                    const revenueHeight = maxChartValue > 0 ? (month.revenue / maxChartValue) * 200 : 0;
                    const profitHeight = maxChartValue > 0 ? (month.profit / maxChartValue) * 200 : 0;
                    return (
                      <div key={idx} className="bar-group" title={`${month.month}: Revenue ${formatCurrency(month.revenue)}, Profit ${formatCurrency(month.profit)}`}>
                        <div className="bar yellow" style={{ height: `${Math.max(revenueHeight, 10)}px` }} />
                        <div className="bar blue" style={{ height: `${Math.max(profitHeight, 10)}px` }} />
                        <div style={{ fontSize: '10px', marginTop: '4px', textAlign: 'center' }}>
                          {month.month.split(' ')[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#fbbf24', borderRadius: '2px' }}></div>
                    <span>Revenue</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                    <span>Profit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="small-card pie-card">
            <h4 className="card-title">Top selling Products</h4>
            <div style={{ padding: '1rem' }}>
              {topSellingProducts.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {topSellingProducts.map((product, idx) => (
                    <li key={idx} style={{ padding: '8px 0', borderBottom: idx < topSellingProducts.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{product.productName || product.productId}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Qty: {formatNumber(product.totalQty)} | Revenue: {formatCurrency(product.totalRevenue)}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No sales data available</div>
              )}
            </div>
          </div>
        </section>

        <section className="tables-row">
          <div className="table-card">
            <h4 className="card-title">Stock Alert</h4>
            <table>
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Current Qty</th>
                  <th>Alert Threshold</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.slice(0, 5).map((product, i) => (
                    <tr key={i}>
                      <td>{product.productId || 'N/A'}</td>
                      <td>{product.name || 'Unnamed Product'}</td>
                      <td>{formatNumber(product.qty || 0)}</td>
                      <td>10</td>
                      <td>
                        <span style={{ 
                          color: product.qty === 0 ? '#ef4444' : '#f59e0b',
                          fontWeight: 'bold'
                        }}>
                          {product.qty === 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                      No low stock products
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-card small-right">
            <h4 className="card-title">Recent Orders</h4>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order, i) => (
                    <tr key={i}>
                      <td>{order.id}</td>
                      <td>{order.customer || 'N/A'}</td>
                      <td>{formatCurrency(order.costPer && order.items
                        ? Number(order.costPer) * Number(order.items)
                        : (typeof order.totalAmount === 'object'
                          ? parseFloat(order.totalAmount?.$numberDecimal || order.totalAmount?.toString() || '0')
                          : Number(order.totalAmount || 0)))}</td>
                      <td>
                        <span style={{ 
                          color: order.status === 'Completed' ? '#10b981' : '#f59e0b',
                          fontWeight: 'bold'
                        }}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
