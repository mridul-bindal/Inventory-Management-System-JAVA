import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    agreeToTerms: false
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
      const response = await fetch('http://localhost:9000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Store the token if your backend returns one
        // localStorage.setItem('token', data.token);
        navigate('/'); // Redirect to login page
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="reg-container">
      <div className="reg-wrapper">
        {/* Left side remains the same */}
        <div className="reg-left">
          <img
            src="/registerpage/RegisterPage.jpg"
            alt="Register Illustration"
            className="reg-image"
          />
        </div>

        <div className="reg-right">
          <div className="reg-logo" />
          <h1 className="reg-title">Register</h1>

          <div className="reg-subtitle">
            <h2>Manage all your inventory efficiently</h2>
            <p>Let's get you all set up so you can verify your personal account and begin setting up your work profile.</p>
          </div>

          <form className="reg-form" onSubmit={handleSubmit}>
            <div className="reg-row">
              <div className="reg-field">
                <label>First name</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name" 
                  required
                />
              </div>
              <div className="reg-field">
                <label>Last name</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name" 
                  required
                />
              </div>
            </div>

            <div className="reg-row">
              <div className="reg-field">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email" 
                  required
                />
              </div>
              <div className="reg-field">
                <label>Phone no.</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number" 
                  required
                />
              </div>
            </div>

            <div className="reg-row single">
              <div className="reg-field">
                <label>Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password" 
                  required
                />
              </div>
            </div>

            <label className="reg-check">
              <input 
                type="checkbox" 
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                required
              /> 
              I agree to all terms, <a href="#">privacy policies</a>, and fees
            </label>

            <button className="reg-button" type="submit">
              Sign up
            </button>

            <p className="reg-login">
              Already have an account? <Link to="/">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
