// SalesReport.jsx (improved date handling + debug)
import React, { useMemo, useEffect } from "react";
import Nav from "../staticComponents/NavBar";
import Header from "../staticComponents/Header";
import "../styles/SalesReport.css";

const STORAGE_KEY = "ims_orders_v1";

function readOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read orders from localStorage", e);
    return [];
  }
}

// Robust date parser that tries multiple common formats (mm/dd/yyyy, yyyy-mm-dd, ISO)
function parseOrderDate(s) {
  if (!s) return null;

  // If it's already a number timestamp
  if (typeof s === "number") {
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }

  // If it's already an ISO-like string
  if (/\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }

  // If it's mm/dd/yyyy
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const parts = s.split("/");
    const m = Number(parts[0]);
    const d = Number(parts[1]);
    const y = Number(parts[2]);
    const dt = new Date(y, m - 1, d);
    return isNaN(dt) ? null : dt;
  }

  // If it's dd/mm/yyyy (less likely, but try)
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s)) {
    const parts = s.split("/");
    if (parts[2].length === 4) {
      // ambiguous; we already tried mm/dd/yyyy above, so this is fallback
      const d = new Date(parts[2], Number(parts[1]) - 1, Number(parts[0]));
      return isNaN(d) ? null : d;
    }
  }

  // Try Date constructor fallback
  const fallback = new Date(s);
  return isNaN(fallback) ? null : fallback;
}

// helper to compare date-by-date (year,month,day) ignoring timezones
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function fmtMMDD(date) {
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${m}/${d}`;
}

export default function SalesReport() {
  const rawOrders = useMemo(() => readOrders(), []);
  useEffect(() => {
    console.debug("[SalesReport] loaded orders:", rawOrders.length, rawOrders);
  }, [rawOrders]);

  // Normalize orders: attach parsed date and total
  const normalized = useMemo(() => {
    return rawOrders.map((o, idx) => {
      const dateObj = parseOrderDate(o.date) || new Date(); // fallback to now if missing
      const costPer = Number(o.costPer ?? o.cost ?? 0) || 0;
      const items = Number(o.items ?? 0) || 0;
      const total = items * costPer;
      return { __idx: idx, ...o, _dateObj: dateObj, costPer, items, total };
    });
  }, [rawOrders]);

  // Debug: if normalized is empty, print a suggestion
  useEffect(() => {
    if (!normalized.length) {
      console.info("[SalesReport] No orders found in localStorage under key:", STORAGE_KEY);
      console.info("Use the sample injection snippet (shown in console) to add test orders.");
    }
  }, [normalized]);

  const now = new Date();

  // Today's metrics: compare by date parts (not string)
  const todays = normalized.filter(o => sameDay(o._dateObj, now));
  const todaysSalesCount = todays.reduce((s, o) => s + (Number(o.items) || 0), 0);
  const todaysOrdersCount = todays.length;
  const todaysRevenue = todays.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const todaysCustomers = new Set(todays.map(o => (o.customer || "").trim())).size;

  // last 7 days
  const dayRange = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    d.setHours(0,0,0,0);
    dayRange.push(d);
  }

  const dayAgg = dayRange.map(d => {
    const label = fmtMMDD(d);
    const dayOrders = normalized.filter(o => sameDay(o._dateObj, d));
    const ordersCount = dayOrders.length;
    const revenue = dayOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    return { date: d, label, ordersCount, revenue };
  });

  const maxOrders = Math.max(...dayAgg.map(d => d.ordersCount), 1);
  const maxRevenue = Math.max(...dayAgg.map(d => d.revenue), 1);

  // payment breakdown
  const paymentMap = normalized.reduce((acc, o) => {
    const k = (o.payment || "Unknown").toString();
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const paymentEntries = Object.entries(paymentMap).sort((a,b) => b[1]-a[1]);

  // top days by revenue (last 7 only)
  const topDays = [...dayAgg].sort((a,b) => b.revenue - a.revenue).slice(0,5);

  // totals
  const totalOrdersAll = normalized.length;
  const totalRevenueAll = normalized.reduce((s,o)=> s + (Number(o.total)||0), 0);

  return (
    <div className="app-shell">
      <Nav />
      <div className="main-area">
        <Header />

        <div className="report-page container">
          <div className="cards-row">
            <div className="card stat-card">
              <div className="card-value">{todaysSalesCount.toLocaleString()}</div>
              <div className="card-label">Today's sales</div>
              <div className="card-sub">Orders: {todaysOrdersCount}</div>
            </div>

            <div className="card stat-card">
              <div className="card-value">{todaysOrdersCount.toLocaleString()}</div>
              <div className="card-label">Today's total orders</div>
              <div className="card-sub">Customers: {todaysCustomers}</div>
            </div>

            <div className="card stat-card">
              <div className="card-value">₹ {todaysRevenue.toFixed(2)}</div>
              <div className="card-label">Today's revenue</div>
              <div className="card-sub">All-time revenue: ₹ {totalRevenueAll.toFixed(2)}</div>
            </div>

            <div className="card stat-card">
              <div className="card-value">{new Set(normalized.map(o=> (o.customer||"").trim())).size}</div>
              <div className="card-label">Total customers</div>
              <div className="card-sub">Total orders: {totalOrdersAll}</div>
            </div>
          </div>

          <div className="report-grid">
            <div className="chart-card">
              <div className="card-header"><h3>Last 7 days — Orders vs Revenue</h3></div>
              <div className="chart-area">
                <svg viewBox="0 0 700 260" preserveAspectRatio="none" className="bar-svg">
                  {[0,0.25,0.5,0.75,1].map((t, idx) => (
                    <line key={idx} x1="0" x2="700" y1={20 + t*180} y2={20 + t*180} stroke="#eef2f6" strokeWidth="1" />
                  ))}

                  {dayAgg.map((d, i) => {
                    const xBase = 30 + i * (600/7) + 10;
                    const ordersH = (d.ordersCount / Math.max(maxOrders,1)) * 140;
                    const revH = (d.revenue / Math.max(maxRevenue,1)) * 140;
                    return (
                      <g key={d.label}>
                        <rect x={xBase} y={200 - ordersH} width="18" height={ordersH} rx="3" fill="#FCD34D" />
                        <rect x={xBase + 22} y={200 - revH} width="18" height={revH} rx="3" fill="#6366F1" />
                        <text x={xBase} y={220} fontSize="11" fill="#6B7280">{d.label}</text>
                      </g>
                    );
                  })}
                </svg>
                {normalized.length === 0 && <div style={{color:'#6b7280', padding: 12}}>No orders found — add orders first or load sample data (see console).</div>}
              </div>
            </div>

            <div className="side-card">
              <div className="card-header"><h3>Top payment methods</h3></div>
              <div className="payment-list">
                {paymentEntries.length === 0 ? <div className="empty">No data</div> :
                  paymentEntries.map(([key, count]) => {
                    const pct = Math.round((count / Math.max(1, normalized.length)) * 100);
                    return (
                      <div className="payment-row" key={key}>
                        <div className="payment-key">{key}</div>
                        <div className="payment-bar-wrap">
                          <div className="payment-bar" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="payment-count">{count} ({pct}%)</div>
                      </div>
                    );
                  })
                }
              </div>

              <div className="card-header" style={{ marginTop: 18 }}><h3>Top revenue days</h3></div>
              <div className="top-days">
                {topDays.map(td => (
                  <div className="top-day-row" key={td.label}>
                    <div className="td-label">{td.label}</div>
                    <div className="td-rev">₹ {td.revenue.toFixed(2)}</div>
                  </div>
                ))}
                {topDays.length === 0 && <div className="empty">No data</div>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
