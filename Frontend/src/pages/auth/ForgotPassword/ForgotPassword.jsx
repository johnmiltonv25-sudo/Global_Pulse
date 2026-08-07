import "./ForgotPassword.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import background from "../../../assets/images/space-background.png";

function ForgotPassword() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendCode = async () => {
    setErrorMessage("");

    // TC-11: Trim leading & trailing spaces
    const cleanedIdentifier = identifier.trim();

    if (!cleanedIdentifier) {
      setErrorMessage("Please enter your registered Gmail address or mobile number.");
      return;
    }

    // TC-09: Validate email format if contains @
    if (cleanedIdentifier.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanedIdentifier)) {
        setErrorMessage("Please enter a valid email address format (e.g. name@domain.com).");
        return;
      }
    } else {
      // TC-10: Validate mobile number format (numeric & 10 digits)
      const digitsOnly = cleanedIdentifier.replace(/\D/g, "");
      if (digitsOnly.length !== 10) {
        setErrorMessage("Please enter a valid 10-digit mobile number or Gmail address.");
        return;
      }
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: cleanedIdentifier,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // TC-08, TC-31: Unregistered account / Rate limit feedback
        setErrorMessage(data.detail || "No account found registered with this email or mobile number.");
        return;
      }

      // TC-06, TC-07: Navigate to OTP Verification screen
      navigate("/forgot-otp", {
        state: {
          identifier: cleanedIdentifier,
        },
      });

    } catch (error) {
      console.error("Forgot password error:", error);
      setErrorMessage("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // TC-04, TC-05: Enable button only when input is filled
  const isButtonEnabled = identifier.trim().length > 0 && !loading;

  return (
    <div
      className="forgot-page"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <div className="forgot-card">
        {/* TC-12: Back button to login */}
        <button
          type="button"
          className="forgot-back"
          onClick={() => navigate("/login")}
          aria-label="Back to Login"
        >
          ← Back
        </button>

        <div className="forgot-icon" aria-hidden="true">↻</div>

        {/* TC-01: Title */}
        <h1 className="forgot-title">Forgot Password?</h1>

        {/* TC-02: Description text */}
        <p className="forgot-subtitle">
          No worries! Enter your registered Gmail address or mobile number and
          we'll send you a verification code to reset your password.
        </p>

        {errorMessage && (
          <div style={{ color: "#f87171", fontSize: "13px", margin: "10px 0", textAlign: "center", fontWeight: "500" }}>
            {errorMessage}
          </div>
        )}

        {/* TC-03: Input field with placeholder */}
        <input
          id="identifier"
          name="identifier"
          type="text"
          className="forgot-input"
          placeholder="Mobile number or Gmail address"
          value={identifier}
          onChange={(event) => {
            setIdentifier(event.target.value);
            setErrorMessage("");
          }}
          aria-label="Mobile number or Gmail address"
        />

        {/* TC-04, TC-05: Send Verification Code button */}
        <button
          type="button"
          className="forgot-submit"
          onClick={handleSendCode}
          disabled={!isButtonEnabled}
          style={{
            opacity: isButtonEnabled ? 1 : 0.5,
            cursor: isButtonEnabled ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Sending Code..." : "Send Verification Code"}
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
