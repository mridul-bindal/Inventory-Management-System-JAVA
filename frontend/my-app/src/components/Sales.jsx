import React, { useState, useEffect } from "react";
import Nav from "../staticComponents/NavBar";
import Header from "../staticComponents/Header";
import { getSalesData } from "../api/sales";
import "../styles/SalesReport.css";

export default function SalesReport() {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSalesData();
      setSalesData(data);
    } catch (err) {
      console.error("Failed to load sales data:", err);
      setError(err.message || "Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Nav />
        <div className="main-area">
          <Header />
          <div className="report-page container">
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
              Loading sales data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <Nav />
        <div className="main-area">
          <Header />
          <div className="report-page container">
            <div style={{ padding: '40px', textAlign: 'center', color: '#EF4444' }}>
              <p>Error: {error}</p>
              <button 
                onClick={loadSalesData}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  backgroundColor: '#6366F1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="app-shell">
        <Nav />
        <div className="main-area">
          <Header />
          <div className="report-page container">
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
              No sales data available
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { today, totals, last7Days, topDays, paymentMethods, channels, topProducts, statusBreakdown, monthlyData } = salesData;

  // Calculate max values for chart scaling
  const maxOrders = Math.max(...last7Days.map(d => d.ordersCount), 1);
  const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 1);

  return (
    <div className="app-shell">
      <Nav />
      <div className="main-area">
        <Header />

        <div className="report-page container">
          {/* Today's Metrics Cards */}
          <div className="cards-row">
            <div className="card stat-card">
              <div className="card-value">{formatNumber(today.salesCount)}</div>
              <div className="card-label">Today's Sales</div>
              <div className="card-sub">Orders: {formatNumber(today.ordersCount)}</div>
            </div>

            <div className="card stat-card">
              <div className="card-value">{formatNumber(today.ordersCount)}</div>
              <div className="card-label">Today's Total Orders</div>
              <div className="card-sub">Customers: {formatNumber(today.customers)}</div>
            </div>

            <div className="card stat-card">
              <div className="card-value">{formatCurrency(today.revenue)}</div>
              <div className="card-label">Today's Revenue</div>
              <div className="card-sub">Profit: {formatCurrency(today.profit)}</div>
            </div>

            <div className="card stat-card">
              <div className="card-value">{formatCurrency(today.profit)}</div>
              <div className="card-label">Today's Profit</div>
              <div className="card-sub">Margin: {today.revenue > 0 ? ((today.profit / today.revenue) * 100).toFixed(1) : 0}%</div>
            </div>
          </div>

          {/* Total Metrics Row */}
          <div className="cards-row" style={{ marginTop: '20px' }}>
            <div className="card stat-card" style={{ backgroundColor: '#F3F4F6' }}>
              <div className="card-value">{formatNumber(totals.orders)}</div>
              <div className="card-label">Total Orders</div>
              <div className="card-sub">All Time</div>
            </div>

            <div className="card stat-card" style={{ backgroundColor: '#F3F4F6' }}>
              <div className="card-value">{formatCurrency(totals.revenue)}</div>
              <div className="card-label">Total Revenue</div>
              <div className="card-sub">All Time</div>
            </div>

            <div className="card stat-card" style={{ backgroundColor: '#F3F4F6' }}>
              <div className="card-value">{formatCurrency(totals.profit)}</div>
              <div className="card-label">Total Profit</div>
              <div className="card-sub">All Time</div>
            </div>

            <div className="card stat-card" style={{ backgroundColor: '#F3F4F6' }}>
              <div className="card-value">{formatNumber(totals.customers)}</div>
              <div className="card-label">Total Customers</div>
              <div className="card-sub">Items Sold: {formatNumber(totals.itemsSold)}</div>
            </div>
          </div>

          {/* Charts and Analytics Grid */}
          <div className="report-grid">
            {/* Last 7 Days Chart */}
            <div className="chart-card">
              <div className="card-header">
                <h3>Last 7 Days — Orders vs Revenue</h3>
              </div>
              <div className="chart-area">
                <svg viewBox="0 0 700 260" preserveAspectRatio="none" className="bar-svg">
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => (
                    <line
                      key={idx}
                      x1="0"
                      x2="700"
                      y1={20 + t * 180}
                      y2={20 + t * 180}
                      stroke="#eef2f6"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Bars */}
                  {last7Days.map((d, i) => {
                    const xBase = 30 + i * (600 / 7) + 10;
                    const ordersH = (d.ordersCount / Math.max(maxOrders, 1)) * 140;
                    const revH = (d.revenue / Math.max(maxRevenue, 1)) * 140;
                    return (
                      <g key={d.label}>
                        <rect
                          x={xBase}
                          y={200 - ordersH}
                          width="18"
                          height={ordersH}
                          rx="3"
                          fill="#FCD34D"
                        />
                        <rect
                          x={xBase + 22}
                          y={200 - revH}
                          width="18"
                          height={revH}
                          rx="3"
                          fill="#6366F1"
                        />
                        <text x={xBase} y={220} fontSize="11" fill="#6B7280">
                          {d.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#FCD34D', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>Orders</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#6366F1', borderRadius: '2px' }}></div>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>Revenue</span>
                  </div>
                </div>
                {last7Days.length === 0 && (
                  <div style={{ color: '#6b7280', padding: 12, textAlign: 'center' }}>
                    No data available for the last 7 days
                  </div>
                )}
              </div>
            </div>

            {/* Side Cards */}
            <div className="side-card">
              {/* Payment Methods */}
              <div className="card-header">
                <h3>Payment Methods</h3>
              </div>
              <div className="payment-list">
                {paymentMethods.length === 0 ? (
                  <div className="empty">No data</div>
                ) : (
                  paymentMethods.map(({ method, count, percentage }) => (
                    <div className="payment-row" key={method}>
                      <div className="payment-key">{method}</div>
                      <div className="payment-bar-wrap">
                        <div
                          className="payment-bar"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="payment-count">
                        {count} ({percentage}%)
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Top Revenue Days */}
              <div className="card-header" style={{ marginTop: 18 }}>
                <h3>Top Revenue Days (Last 7 Days)</h3>
              </div>
              <div className="top-days">
                {topDays.length === 0 ? (
                  <div className="empty">No data</div>
                ) : (
                  topDays.map((td) => (
                    <div className="top-day-row" key={td.label}>
                      <div className="td-label">{td.label}</div>
                      <div className="td-rev">{formatCurrency(td.revenue)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Additional Analytics Grid */}
          <div className="report-grid" style={{ marginTop: '20px' }}>
            {/* Sales Channels */}
            <div className="chart-card">
              <div className="card-header">
                <h3>Sales by Channel</h3>
              </div>
              <div style={{ padding: '20px' }}>
                {channels.length === 0 ? (
                  <div className="empty">No data</div>
                ) : (
                  <div>
                    {channels.map(({ channel, count, revenue, profit }) => (
                      <div
                        key={channel}
                        style={{
                          marginBottom: '15px',
                          padding: '12px',
                          backgroundColor: '#F9FAFB',
                          borderRadius: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <strong>{channel}</strong>
                          <span style={{ color: '#6B7280' }}>{count} orders</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span>Revenue: {formatCurrency(revenue)}</span>
                          <span style={{ color: '#10B981' }}>Profit: {formatCurrency(profit)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="chart-card">
              <div className="card-header">
                <h3>Top Selling Products</h3>
              </div>
              <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                {topProducts.length === 0 ? (
                  <div className="empty">No data</div>
                ) : (
                  <div>
                    {topProducts.map((product, idx) => (
                      <div
                        key={product.productId}
                        style={{
                          marginBottom: '15px',
                          padding: '12px',
                          backgroundColor: '#F9FAFB',
                          borderRadius: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <strong>#{idx + 1} {product.productName || product.productId}</strong>
                          <span style={{ color: '#6B7280' }}>{product.orderCount} orders</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span>Qty: {formatNumber(product.totalQty)}</span>
                          <span>Revenue: {formatCurrency(product.totalRevenue)}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#10B981', marginTop: '5px' }}>
                          Profit: {formatCurrency(product.totalProfit)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="report-grid" style={{ marginTop: '20px' }}>
            <div className="chart-card">
              <div className="card-header">
                <h3>Order Status Breakdown</h3>
              </div>
              <div style={{ padding: '20px' }}>
                {statusBreakdown.length === 0 ? (
                  <div className="empty">No data</div>
                ) : (
                  <div>
                    {statusBreakdown.map(({ status, count, percentage }) => (
                      <div
                        key={status}
                        style={{
                          marginBottom: '15px',
                          padding: '12px',
                          backgroundColor: '#F9FAFB',
                          borderRadius: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <strong>{status}</strong>
                          <span>{count} orders</span>
                        </div>
                        <div className="payment-bar-wrap">
                          <div
                            className="payment-bar"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '5px' }}>
                          {percentage}% of total orders
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Overview */}
            <div className="chart-card">
              <div className="card-header">
                <h3>Monthly Overview (Last 6 Months)</h3>
              </div>
              <div style={{ padding: '20px' }}>
                {monthlyData.length === 0 ? (
                  <div className="empty">No data</div>
                ) : (
                  <div>
                    {monthlyData.map((month) => (
                      <div
                        key={month.month}
                        style={{
                          marginBottom: '15px',
                          padding: '12px',
                          backgroundColor: '#F9FAFB',
                          borderRadius: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <strong>{month.month}</strong>
                          <span style={{ color: '#6B7280' }}>{month.orders} orders</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span>Revenue: {formatCurrency(month.revenue)}</span>
                          <span style={{ color: '#10B981' }}>Profit: {formatCurrency(month.profit)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
