import React, { useState } from "react";
import axios from "axios";
// import logo from "../assets/logo.png";
import "bootstrap-icons/font/bootstrap-icons.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" }); // Improved state for messaging

  const handleLogin = async (e) => {
    // Prevent default form submission if wrapped in a <form>
    e.preventDefault();

    if (!username || !password) {
      setStatus({ type: "danger", message: "Please enter username and password" });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    
    try {
      const response = await axios.post("https://localhost:7263/api/User/login", {
        username,
        password,
      });

      setStatus({ type: "success", message: "Login Successful ✔ Redirecting..." });
      
      // Store token (example)
      // localStorage.setItem("token", response.data.token);
      
      // TODO: Use useNavigate() from react-router-dom to redirect
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid username or password ❌";
      setStatus({ type: "danger", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="col-md-5 col-lg-4 col-xl-3">
        {/* LOGO SECTION */}
        <div className="text-center mb-4">
          {/* <img src={logo} alt="logo" width="100" /> */}
          <div className="bg-danger d-inline-block p-3 rounded-circle shadow-sm mb-2">
             <i className="bi bi-mortarboard-fill text-white fs-1"></i>
          </div>
          <h2 className="fw-bold text-secondary">e-Training</h2>
        </div>

        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-4 p-sm-5">
            <h4 className="text-center mb-4 fw-bold">Sign In</h4>
            
            <form onSubmit={handleLogin}>
              {/* USERNAME */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Username</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-person text-danger"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-lock text-danger"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control border-start-0 border-end-0 ps-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="input-group-text bg-white border-start-0"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi bi-eye${showPassword ? "-slash" : ""} text-muted`}></i>
                  </span>
                </div>
              </div>

              <div className="d-flex justify-content-end mb-4">
                <a href="#" className="small text-decoration-none text-danger fw-medium">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="btn btn-danger w-100 py-2 fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : null}
                {loading ? "Verifying..." : "Login"}
              </button>
            </form>

            {/* DYNAMIC ALERT MESSAGE */}
            {status.message && (
              <div className={`alert alert-${status.type} py-2 mt-4 mb-0 text-center small`} role="alert">
                {status.message}
              </div>
            )}
          </div>
        </div>
        
        <p className="text-center text-muted small mt-4">
          &copy; 2026 e-Training Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;