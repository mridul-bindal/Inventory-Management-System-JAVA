import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:9000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Store the JWT token
        localStorage.setItem('token', data.token);
        navigate('/Dashboard');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

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

          <form onSubmit={handleSubmit}>
            <label className="input-label">Email*</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email" 
              className="input-field"
              required 
            />

            <label className="input-label">Password*</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="minimum 8 characters" 
              className="input-field"
              required 
            />

            <div className="remember-forgot">
              <label>
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                /> 
                Remember me
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>

          <p className="register-text">
            Not registered yet?{" "}
            <Link to="/register" className="register-link">
              Create a new account
            </Link>
          </p>
        </div>

        <div className="login-right">
          <img
            src="/loginpage/inventory-management-system.webp"
            alt="Illustration"
            className="login-image"
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
