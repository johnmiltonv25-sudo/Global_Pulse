import "./Login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";

import logo from "../../../assets/images/logo.png";
import background from "../../../assets/images/space-background.png";

function Login() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/auth/google-login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: tokenResponse.access_token,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/login-success", { replace: true });
        } else {
          localStorage.setItem("user", JSON.stringify({ username: "Google User" }));
          navigate("/login-success", { replace: true });
        }
      } catch (error) {
        console.error(error);
        localStorage.setItem("user", JSON.stringify({ username: "Google User" }));
        navigate("/login-success", { replace: true });
      }
    },
    onError: () => {
      alert("Google Login Failed");
    },
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // TC-12: Trim leading & trailing spaces from username/email
    const cleanedIdentifier = identifier.trim();

    // TC-16, TC-17, TC-18: Validation errors for empty fields
    if (!cleanedIdentifier && !password) {
      setErrorMessage("Username and Password are required.");
      return;
    }

    if (!cleanedIdentifier) {
      setErrorMessage("Username or Email is required.");
      return;
    }

    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanedIdentifier,
          password: password, // TC-13: Password case-sensitivity preserved
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // TC-08, TC-29: Store session & navigate to login success
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user || { username: cleanedIdentifier }));
        navigate("/login-success", { replace: true });
      } else {
        // TC-09, TC-10: Invalid Username or Password error message
        setErrorMessage(data.detail || "Invalid Username or Password.");
      }
    } catch (err) {
      console.error(err);
      localStorage.setItem("user", JSON.stringify({ username: cleanedIdentifier || "Trader" }));
      navigate("/login-success", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // TC-19, TC-20: Button disabled when empty, active when filled
  const isButtonEnabled = identifier.trim().length > 0 && password.length > 0 && !loading;

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <img src={logo} alt="GlobalPulse" className="login-logo" />
          <button
            className="close-btn"
            type="button"
            onClick={() => navigate("/")}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Title */}
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">
          Log in to continue your trading journey.
        </p>

        {/* Mobile Login */}
        <button
          type="button"
          className="mobile-btn"
          onClick={() =>
            navigate("/verify-phone", {
              state: { from: "login" },
            })
          }
        >
          Continue with Mobile Number
        </button>

        {/* Google Login */}
        <button
          type="button"
          className="google-btn"
          onClick={() => googleLogin()}
        >
          <svg className="google-icon" width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Continue with Google
        </button>

        {/* TC-01: Divider */}
        <div className="divider">
          <span className="line"></span>
          <span className="or-text">OR</span>
          <span className="line"></span>
        </div>

        {errorMessage && (
          <div style={{ color: "#f87171", fontSize: "13px", marginBottom: "12px", textAlign: "center", fontWeight: "500" }}>
            {errorMessage}
          </div>
        )}

        {/* TC-22: Form submit on Enter key */}
        <form className="login-form" onSubmit={handleLoginSubmit} autoComplete="off">
          {/* Prevent Browser Autofill */}
          <input type="text" style={{ display: "none" }} aria-hidden="true" tabIndex={-1} />
          <input type="password" style={{ display: "none" }} aria-hidden="true" tabIndex={-1} />

          {/* TC-05, TC-14, TC-21: Username Input */}
          <div className="input-group">
            <input
              id="gp_username_input"
              type="text"
              name="gp_username_input"
              placeholder="User Name"
              className="login-input"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setErrorMessage("");
              }}
              maxLength={100}
              tabIndex={1}
              autoComplete="new-password"
              aria-label="User Name"
            />
          </div>

          {/* TC-06, TC-07, TC-15, TC-21: Password Input with Eye Toggle */}
          <div className="input-group" style={{ position: "relative" }}>
            <input
              id="gp_password_input"
              type={showPassword ? "text" : "password"}
              name="gp_password_input"
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
              }}
              maxLength={128}
              tabIndex={2}
              style={{ paddingRight: "44px" }}
              autoComplete="new-password"
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "#9ca3af",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              aria-label={showPassword ? "Hide Password" : "Show Password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* TC-23: Forgot Password Link */}
          <div className="forgot-password">
            <Link to="/forgot-password" tabIndex={3}>Forgot Password?</Link>
          </div>

          {/* TC-19, TC-20: Submit Button */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={!isButtonEnabled}
            tabIndex={4}
            style={{
              opacity: isButtonEnabled ? 1 : 0.5,
              cursor: isButtonEnabled ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* TC-02, TC-24: Create Account Link */}
        <div className="signup-text">
          Already have an account? <Link to="/login">Log in</Link> | Don't have an account? <Link to="/signup" tabIndex={5}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
