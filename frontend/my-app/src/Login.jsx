import React from "react";

function LoginPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8fafc",
      padding: "24px"
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        maxWidth: "1100px",
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        {/* Left Side */}
        <div style={{ padding: "40px" }}>
          {/* Logo */}
          <div style={{ height: "20px", width: "20px", background: "#67e8f9", borderRadius: "4px" }} />

          <h1 style={{ marginTop: "24px", fontSize: "24px", fontWeight: "600" }}>Login</h1>
          <p style={{ marginTop: "8px", fontSize: "14px", color: "#64748b" }}>See your growth and get support!</p>

          {/* Google Button */}
          <button style={{
            marginTop: "24px",
            width: "100%",
            borderRadius: "9999px",
            border: "1px solid #ccc",
            padding: "12px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}>
            Sign in with Google
            <span style={{ height: "20px", width: "20px", borderRadius: "50%", background: "orange" }}></span>
          </button>

          {/* Email */}
          <label style={{ marginTop: "32px", display: "block", fontSize: "14px", fontWeight: "500" }}>Email*</label>
          <input type="email" placeholder="Enter your email" style={{
            marginTop: "8px",
            width: "100%",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px"
          }}/>

          {/* Password */}
          <label style={{ marginTop: "16px", display: "block", fontSize: "14px", fontWeight: "500" }}>Password*</label>
          <input type="password" placeholder="minimum 8 characters" style={{
            marginTop: "8px",
            width: "100%",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px"
          }}/>

          {/* Remember + Forgot */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", fontSize: "13px" }}>
            <label>
              <input type="checkbox"/> Remember me
            </label>
            <a href="#" style={{ color: "#1d4ed8" }}>Forgot password?</a>
          </div>

          {/* Login button */}
          <button style={{
            marginTop: "20px",
            width: "100%",
            borderRadius: "9999px",
            padding: "12px",
            background: "#0f172a",
            color: "#fff",
            fontWeight: "600"
          }}>Login</button>

          <p style={{ marginTop: "16px", fontSize: "14px" }}>Not registered yet? <a href="#" style={{ color: "#1d4ed8" }}>Create a new account</a></p>
        </div>

        {/* Right Side - Placeholder image */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <img src="/placeholder-image.png" alt="Illustration" style={{ maxWidth: "100%", height: "auto" }}/>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
