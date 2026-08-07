import "./VerifyPhone.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import background from "../../../assets/images/space-background.png";
import { sendFirebasePhoneOTP } from "../../../config/firebase.js";

const COUNTRY_CONFIGS = {
  "+91": {
    name: "India (+91)",
    code: "+91",
    maxLength: 10,
    placeholder: "9876543210",
    regex: /^[6-9]\d{9}$/,
    errorMsg: "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
  },
  "+1": {
    name: "USA / Canada (+1)",
    code: "+1",
    maxLength: 10,
    placeholder: "2025550143",
    regex: /^[2-9]\d{2}[2-9]\d{6}$/,
    errorMsg: "Please enter a valid 10-digit US/Canada mobile number.",
  },
  "+44": {
    name: "UK (+44)",
    code: "+44",
    maxLength: 10,
    placeholder: "7911123456",
    regex: /^7\d{9}$/,
    errorMsg: "Please enter a valid 10-digit UK mobile number starting with 7.",
  },
  "+61": {
    name: "Australia (+61)",
    code: "+61",
    maxLength: 9,
    placeholder: "412345678",
    regex: /^4\d{8}$/,
    errorMsg: "Please enter a valid 9-digit Australian mobile number starting with 4.",
  },
  "+971": {
    name: "UAE (+971)",
    code: "+971",
    maxLength: 9,
    placeholder: "501234567",
    regex: /^5\d{8}$/,
    errorMsg: "Please enter a valid 9-digit UAE mobile number starting with 5.",
  },
};

function VerifyPhone() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "signup";

  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentCountry = COUNTRY_CONFIGS[countryCode] || COUNTRY_CONFIGS["+91"];

  const handleCountryChange = (e) => {
    const selectedCode = e.target.value;
    setCountryCode(selectedCode);
    setErrorMessage("");
    const newConfig = COUNTRY_CONFIGS[selectedCode] || COUNTRY_CONFIGS["+91"];
    if (mobileNumber.length > newConfig.maxLength) {
      setMobileNumber(mobileNumber.slice(0, newConfig.maxLength));
    }
  };

  const handlePhoneInput = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("0")) {
      val = val.replace(/^0+/, "");
    }
    const trimmedVal = val.slice(0, currentCountry.maxLength);
    setMobileNumber(trimmedVal);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedNumber = mobileNumber.trim();

    if (!currentCountry.regex.test(cleanedNumber)) {
      setErrorMessage(currentCountry.errorMsg);
      return;
    }

    const fullFormattedNumber = `${countryCode}${cleanedNumber}`;

    try {
      setLoading(true);
      setErrorMessage("");

      const apiUrl =
        from === "signup"
          ? "http://127.0.0.1:8000/api/auth/send-signup-otp"
          : "http://127.0.0.1:8000/api/auth/send-login-otp";

      let backendSuccess = false;
      try {
        const backendResp = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile_number: fullFormattedNumber,
          }),
        });
        if (backendResp.ok) {
          const resData = await backendResp.json().catch(() => ({}));
          if (resData.sms_sent) {
            backendSuccess = true;
          } else {
            console.warn("Backend Fast2SMS reported sms_sent = false:", resData);
          }
        } else {
          const errData = await backendResp.json().catch(() => ({}));
          if (errData.detail) {
            setErrorMessage(errData.detail);
            setLoading(false);
            return;
          }
          console.warn("Backend OTP response error:", errData);
        }
      } catch (backendErr) {
        console.warn("Backend API offline, trying Firebase Phone Auth:", backendErr);
      }

      // Dispatch Firebase Real SMS as fallback if backend was not used
      let firebaseSent = false;
      if (!backendSuccess) {
        try {
          await sendFirebasePhoneOTP(fullFormattedNumber, "recaptcha-container");
          firebaseSent = true;
        } catch (fbErr) {
          console.error("Firebase Real SMS Error:", fbErr);
          let userFacingErr = fbErr.message || "Failed to send SMS code.";
          if (fbErr.code === "auth/invalid-phone-number") {
            userFacingErr = "Invalid phone number format for selected country code.";
          } else if (fbErr.code === "auth/operation-not-allowed") {
            userFacingErr = "Phone authentication disabled in Firebase Console. Please enable Phone provider under Sign-in method.";
          } else if (fbErr.code === "auth/invalid-app-credential") {
            userFacingErr = "Domain error: Please add 'localhost' to Authorized Domains in Firebase Console Settings.";
          } else if (fbErr.code === "auth/quota-exceeded") {
            userFacingErr = "Firebase SMS daily limit exceeded.";
          } else if (fbErr.code === "auth/captcha-check-failed") {
            userFacingErr = "reCAPTCHA verification failed. Please try again.";
          }
          setErrorMessage(userFacingErr);
          return;
        }
      }

      navigate("/otp", {
        state: {
          from,
          mobileNumber: cleanedNumber,
          countryCode,
          fullPhoneNumber: fullFormattedNumber,
          firebaseSent,
        },
      });

    } catch (error) {
      console.error(error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isButtonEnabled = mobileNumber.trim().length === currentCountry.maxLength && !loading;

  const handleContinue = handleSubmit;

  return (
    <div
      className="verify-page"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <div id="recaptcha-container"></div>
      <div className="verify-card">
        {/* TC-08: Top-left back button */}
        <button
          className="back-btn"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back to Create Account"
        >
          ← Back
        </button>

        {/* TC-09: Title */}
        <h1 className="verify-title">
          Verify your
          <br />
          Mobile Number
        </h1>

        {/* TC-10: Description text */}
        <p className="verify-subtitle">
          We'll send you a verification code to confirm your number.
        </p>

        {/* TC-11: Label & phone input row */}
        <label className="phone-label">
          Phone number
        </label>

        <div className="phone-row">
          {/* Country code dropdown */}
          <select
            id="country_code"
            name="country_code"
            value={countryCode}
            onChange={handleCountryChange}
            className="country-code"
            aria-label="Country Code"
          >
            {Object.entries(COUNTRY_CONFIGS).map(([code, config]) => (
              <option key={code} value={code}>
                {config.name}
              </option>
            ))}
          </select>

          <input
            id="mobileNumber"
            name="mobileNumber"
            type="tel"
            placeholder={currentCountry.placeholder}
            className="phone-input"
            value={mobileNumber}
            onChange={handlePhoneInput}
            maxLength={currentCountry.maxLength}
            aria-label="Phone Number Input"
          />
        </div>

        {errorMessage && (
          <div style={{ color: "#f87171", fontSize: "13px", margin: "10px 0", textAlign: "center", fontWeight: "500" }}>
            {errorMessage}
          </div>
        )}

        {/* Invisible reCAPTCHA container for Firebase Phone SMS */}
        <div id="recaptcha-container"></div>

        {/* Continue button */}

        <button
          type="button"
          className="continue-btn"
          onClick={handleContinue}
          disabled={!isButtonEnabled}
          style={{
            opacity: isButtonEnabled ? 1 : 0.5,
            cursor: isButtonEnabled ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Sending..." : "Continue"}
        </button>
      </div>
    </div>
  );
}

export default VerifyPhone;
