// LoginPage.jsx
import React from "react";
import "../styles/LoginPage.css";

function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="login-logo" />
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">See your growth and get support!</p>

          <button className="google-button">
            Sign in with Google <span className="google-icon"></span>
          </button>

          <label className="input-label">Email*</label>
          <input type="email" placeholder="Enter your email" className="input-field" />

          <label className="input-label">Password*</label>
          <input type="password" placeholder="minimum 8 characters" className="input-field" />

          <div className="remember-forgot">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          <button className="login-button">Login</button>

          <p className="register-text">Not registered yet? <a href="#" className="register-link">Create a new account</a></p>
        </div>

        <div className="login-right">
          <img src="/loginpage/inventory-management-system.webp" alt="Illustration" className="login-image" />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
