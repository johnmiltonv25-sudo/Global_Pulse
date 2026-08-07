import "./SignUp.css";
import { useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import logo from "../../../assets/images/logo.png";
import background from "../../../assets/images/space-background.png";

function SignUp({ isModal = false, onClose }) {
  const navigate = useNavigate();

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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/auth/google-login",
          {
            access_token: tokenResponse.access_token,
          }
        );

        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        if (response.data.is_new_user) {
          navigate("/complete-profile", {
            state: {
              email: response.data.user.email,
              isGoogle: true,
            },
          });
        } else {
          navigate("/login-success");
        }
      } catch (error) {
        console.error("AXIOS ERROR:", error);
        localStorage.setItem("user", JSON.stringify({ username: "Google User" }));
        navigate("/login-success");
      }
    },
    onError: () => {
      alert("Google Login Failed");
    },
  });

  const cardContent = (
    <div className="signup-card" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="signup-header">
        <img src={logo} alt="GlobalPulse" className="signup-logo" />
        <button
          className="close-btn"
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>

      {/* Title */}
      <h1 className="signup-title">Create an Account</h1>

      <p className="signup-subtitle">
        Start your journey to learn global markets and trading.
      </p>

      {/* Continue with Mobile */}
      <button
        className="mobile-btn"
        type="button"
        onClick={() =>
          navigate("/verify-phone", {
            state: { from: "signup" },
          })
        }
      >
        Continue with Mobile Number
      </button>

      {/* Continue with Google */}
      <button
        className="google-btn"
        type="button"
        onClick={() => googleSignup()}
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

      {/* Bottom */}
      <div className="login-text">
        Already have an account? <Link to="/login">Log In</Link>
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
