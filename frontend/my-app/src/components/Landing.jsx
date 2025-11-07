import React from "react";
import { Link } from "react-router-dom";
import "../styles/Landing.css";

export default function Landing() {
  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>IMS</h2>
            <span>Inventory Management System</span>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-button">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Manage Your Inventory with <span className="highlight">Ease</span>
            </h1>
            <p className="hero-description">
              A comprehensive inventory management system designed to help you track, 
              manage, and optimize your inventory operations. Keep track of products, 
              orders, sales, and profits all in one place.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="cta-primary">
                Get Started Free
              </Link>
              <Link to="/login" className="cta-secondary">
                Sign In
              </Link>
            </div>
            <p className="hero-note">
              * Login required to access all features
            </p>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-icon">📦</div>
              <h3>Inventory Tracking</h3>
            </div>
            <div className="hero-card">
              <div className="card-icon">📊</div>
              <h3>Sales Analytics</h3>
            </div>
            <div className="hero-card">
              <div className="card-icon">💰</div>
              <h3>Profit Management</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-subtitle">
            Everything you need to manage your inventory efficiently
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Product Management</h3>
              <p>
                Add, edit, and track your products with ease. Monitor stock levels, 
                set buying costs, and manage product information all in one place.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛒</div>
              <h3>Order Processing</h3>
              <p>
                Create and manage orders seamlessly. Track order status, customer 
                information, and automatically update inventory levels.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Sales Analytics</h3>
              <p>
                Get comprehensive insights into your sales performance. View revenue, 
                profit trends, and top-selling products with detailed analytics.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Profit Tracking</h3>
              <p>
                Automatically calculate profit margins for each order. Track total 
                profit and revenue to make informed business decisions.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Employee Management</h3>
              <p>
                Manage your team with employee records and salary tracking. Calculate 
                owner income after deducting staff expenses.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Dashboard Overview</h3>
              <p>
                Get a real-time overview of your business with key metrics, low stock 
                alerts, and recent activity all on one dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Sign up for free and create your account to get started</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Add Products</h3>
              <p>Add your products with details, quantities, and buying costs</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Manage Orders</h3>
              <p>Create orders and watch inventory update automatically</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Track & Analyze</h3>
              <p>Monitor sales, profits, and get insights from your dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>
              Join thousands of businesses managing their inventory efficiently. 
              Start tracking your products, orders, and profits today.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="cta-primary-large">
                Create Free Account
              </Link>
              <Link to="/login" className="cta-secondary-large">
                Already have an account? Sign In
              </Link>
            </div>
            <p className="cta-note">
              * All major features require login. Create an account to access the full system.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>IMS</h3>
              <p>Inventory Management System</p>
            </div>
            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li>Product Management</li>
                <li>Order Processing</li>
                <li>Sales Analytics</li>
                <li>Profit Tracking</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Account</h4>
              <ul>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Inventory Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

