import "./ResetPassword.css";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import background from "../../../assets/images/space-background.png";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const identifier = location.state?.identifier || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // TC-19: Password complexity check (>= 6 chars, contains letters and numbers)
  const isComplexityMet = (pwd) => {
    if (pwd.length < 6) return false;
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    return hasLetter && hasNumber;
  };

  // TC-17, TC-21: Button disabled when empty or passwords don't match
  const isFormValid =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    !loading;

  const handleResetPassword = async () => {
    setErrorMessage("");

    // TC-23: Space trimming
    const pwd1 = newPassword.trim();
    const pwd2 = confirmPassword.trim();

    if (!pwd1 || !pwd2) {
      setErrorMessage("Please enter both password fields.");
      return;
    }

    // TC-18: Password mismatch validation
    if (pwd1 !== pwd2) {
      setErrorMessage("New Password and Confirm Password do not match.");
      return;
    }

    // TC-19: Password complexity validation
    if (!isComplexityMet(pwd1)) {
      setErrorMessage("Password must be at least 6 characters and contain both letters and numbers.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier,
            new_password: pwd1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // TC-20: New password same as old password error feedback
        setErrorMessage(data.detail || "Unable to reset password.");
        return;
      }

      // TC-22: Successful reset routes to confirmation screen
      navigate("/password-reset-success", { replace: true });

    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="reset-page"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <div className="reset-card">
        <div className="reset-icon" aria-hidden="true">🔒</div>

        {/* TC-13: Title */}
        <h1 className="reset-title">Set New Password</h1>

        <p className="reset-subtitle">
          Create a strong password for your account.
        </p>

        {errorMessage && (
          <div style={{ color: "#f87171", fontSize: "13px", margin: "10px 0", textAlign: "center", fontWeight: "500" }}>
            {errorMessage}
          </div>
        )}

        {/* TC-14, TC-16: New Password Field */}
        <div style={{ position: "relative", width: "100%", marginBottom: "14px" }}>
          <input
            id="newPassword"
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            placeholder="New Password"
            className="reset-input"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setErrorMessage("");
            }}
            aria-label="New Password"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
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
            aria-label={showNewPassword ? "Hide password" : "Show password"}
          >
            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* TC-15, TC-16: Confirm New Password Field */}
        <div style={{ position: "relative", width: "100%", marginBottom: "18px" }}>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            className="reset-input"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrorMessage("");
            }}
            aria-label="Confirm New Password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* TC-17, TC-21: Reset Password button */}
        <button
          type="button"
          className="reset-button"
          onClick={handleResetPassword}
          disabled={!isFormValid}
          style={{
            opacity: isFormValid ? 1 : 0.5,
            cursor: isFormValid ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
