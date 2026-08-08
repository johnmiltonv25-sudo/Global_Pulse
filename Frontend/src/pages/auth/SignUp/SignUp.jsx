import "./SignUp.css";
import { useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import logo from "../../../assets/images/logo.png";
import background from "../../../assets/images/space-background.png";
import { formatErrorMessage } from "../../../utils/formatError.js";
import { API_BASE_URL } from "../../../config/api.js";

function SignUp({ isModal = false, onClose }) {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.returnEventListener ? window.returnEventListener("keydown", handleKeyDown) : () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setErrorMessage("");
        const response = await fetch(
          `${API_BASE_URL}/api/auth/google-login`,
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

          if (data.is_new_user) {
            navigate("/complete-profile", {
              state: {
                email: data.user.email,
                isGoogle: true,
              },
            });
          } else {
            setErrorMessage("Account already exists with this Google email. Redirecting to Login...");
            setTimeout(() => {
              navigate("/login", {
                state: {
                  message: "Account already exists with this Google email. Please log in.",
                },
              });
            }, 1500);
          }
        } else {
          setErrorMessage(data?.detail || "Google Signup Failed");
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Google Signup Failed. Please try again.");
      }
    },
    onError: () => {
      setErrorMessage("Google Signup Failed. Please try again.");
    },
  });

  const handleGoogleClick = () => {
    try {
      if (typeof googleSignup === "function") {
        googleSignup();
      }
    } catch (err) {
      console.error("Google OAuth error:", err);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanedIdentifier = identifier.trim();

    if (!cleanedIdentifier && !password) {
      setErrorMessage("User name and password not given");
      return;
    }

    if (!cleanedIdentifier) {
      setErrorMessage("User name not given");
      return;
    }

    if (!password) {
      setErrorMessage("Password not given");
      return;
    }

    try {
      setLoading(true);

      // Check if identifier is email or mobile or username
      const isEmail = cleanedIdentifier.includes("@");
      const isMobile = /^\+?[0-9]{8,15}$/.test(cleanedIdentifier);

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: isEmail ? cleanedIdentifier.split("@")[0] : cleanedIdentifier,
          email: isEmail ? cleanedIdentifier : undefined,
          mobile_number: isMobile ? cleanedIdentifier : undefined,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user || { username: cleanedIdentifier }));
        navigate("/login-success", { replace: true });
      } else {
        setErrorMessage(formatErrorMessage(data?.detail, "Signup failed. Please try again."));
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to connect to server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const cardContent = (
    <div className="signup-card" onClick={(e) => e.stopPropagation()}>
      <button
        className="close-btn"
        type="button"
        onClick={handleClose}
        aria-label="Close modal"
      >
        &times;
      </button>

      {/* Header Logo */}
      <div className="signup-header">
        <img src={logo} alt="GlobalPulse" className="signup-logo" />
      </div>

      {/* Title */}
      <h1 className="signup-title">Create an Account</h1>

      <p className="signup-subtitle">
        Start your journey to learn global markets and trading.
      </p>

      {/* Mobile Sign Up */}
      <button
        className="mobile-btn"
        type="button"
        onClick={() =>
          navigate("/verify-phone", {
            state: { from: "signup" },
          })
        }
      >
        Continue with <strong>Mobile Number</strong>
      </button>

      {/* Google Sign Up */}
      <button
        className="google-btn"
        type="button"
        onClick={handleGoogleClick}
      >
        <svg className="google-icon" width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
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

      {/* Form submit for direct SignUp */}
      <form className="signup-form" onSubmit={handleSignUpSubmit} autoComplete="off">
        {/* Prevent Browser Autofill */}
        <input type="text" style={{ display: "none" }} aria-hidden="true" tabIndex={-1} />
        <input type="password" style={{ display: "none" }} aria-hidden="true" tabIndex={-1} />

        {/* Username Input */}
        <div className="input-group">
          <label htmlFor="gp_signup_username_input" className="input-label">
            User Name <span className="required-star">*</span>
          </label>
          <input
            id="gp_signup_username_input"
            type="text"
            name="gp_signup_username_input"
            placeholder="Enter your user name or email"
            className="signup-input"
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

        {/* Password Input */}
        <div className="input-group">
          <label htmlFor="gp_signup_password_input" className="input-label">
            Password <span className="required-star">*</span>
          </label>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              id="gp_signup_password_input"
              type={showPassword ? "text" : "password"}
              name="gp_signup_password_input"
              placeholder="Enter your password"
              className="signup-input"
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
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="signup-submit-btn"
          disabled={loading}
          tabIndex={3}
          style={{ marginTop: "14px" }}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {/* Bottom */}
      <div className="login-text">
        Already have an account? <Link to="/login" tabIndex={4}>Log in</Link>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        {cardContent}
      </div>
    );
  }

  return (
    <div
      className="signup-page"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      {cardContent}
    </div>
  );
}

export default SignUp;
