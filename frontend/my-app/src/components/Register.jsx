import React from "react";
import { Link } from "react-router-dom";
import "../styles/RegisterPage.css";

function RegisterPage() {
  return (
    <div className="reg-container">
      <div className="reg-wrapper">
        {/* Left side image */}
        <div className="reg-left">
          <img
            src="/registerpage/RegisterPage.jpg"
            alt="Register Illustration"
            className="reg-image"
          />
        </div>

        {/* Right side form */}
        <div className="reg-right">
          <div className="reg-logo" />
          <h1 className="reg-title">Register</h1>

          <div className="reg-subtitle">
            <h2>Manage all your inventory efficiently</h2>
            <p>
              Let's get you all set up so you can verify your personal account and
              begin setting up your work profile.
            </p>
          </div>

          <form className="reg-form" onSubmit={(e) => e.preventDefault()}>
            <div className="reg-row">
              <div className="reg-field">
                <label>First name</label>
                <input type="text" placeholder="Enter your name" />
              </div>
              <div className="reg-field">
                <label>Last name</label>
                <input type="text" placeholder="minimum 8 characters" />
              </div>
            </div>

            <div className="reg-row">
              <div className="reg-field">
                <label>Email</label>
                <input type="email" placeholder="Enter your email" />
              </div>
              <div className="reg-field">
                <label>Phone no.</label>
                <input type="tel" placeholder="minimum 8 characters" />
              </div>
            </div>

            <div className="reg-row single">
              <div className="reg-field">
                <label>Password</label>
                <input type="password" placeholder="Enter your password" />
              </div>
            </div>

            <label className="reg-check">
              <input type="checkbox" /> I agree to all terms,{" "}
              <a href="#">privacy policies</a>, and fees
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
