import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAl_ADzvszn-x0t0ZaxO89brx1Oo5IWRA0",
  authDomain: "globalpulse-c4870.firebaseapp.com",
  projectId: "globalpulse-c4870",
  storageBucket: "globalpulse-c4870.firebasestorage.app",
  messagingSenderId: "438768082415",
  appId: "1:438768082415:web:fb65572341c1d2f9adea1a",
  measurementId: "G-YVVXSLGSFF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const setupRecaptcha = (containerId = "recaptcha-container") => {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = "";
  }

  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Recaptcha clear warning:", e);
    }
    window.recaptchaVerifier = null;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    containerId,
    {
      size: "invisible",
      callback: () => {
        console.log("reCAPTCHA solved successfully");
      },
      "expired-callback": () => {
        console.warn("reCAPTCHA expired, resetting...");
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch (e) { }
          window.recaptchaVerifier = null;
        }
      },
    }
  );

  return window.recaptchaVerifier;
};

export const sendFirebasePhoneOTP = async (phoneNumber, containerId = "recaptcha-container") => {
  let recaptcha;
  try {
    recaptcha = setupRecaptcha(containerId);
  } catch (err) {
    if (err.message && err.message.includes("already been rendered")) {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = "";
      window.recaptchaVerifier = null;
      recaptcha = setupRecaptcha(containerId);
    } else {
      throw err;
    }
  }

  const formattedNumber = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber.trim()}`;
  console.log(`[Firebase Phone Auth] Sending real SMS to ${formattedNumber}...`);
  const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, recaptcha);
  window.confirmationResult = confirmationResult;
  console.log(`[Firebase Phone Auth] Real SMS dispatched successfully to ${formattedNumber}`);
  return confirmationResult;
};

export const verifyFirebasePhoneOTP = async (otpCode) => {
  if (!window.confirmationResult) {
    throw new Error("No active OTP session found. Please request OTP again.");
  }
  const result = await window.confirmationResult.confirm(otpCode);
  const idToken = await result.user.getIdToken();
  return {
    user: result.user,
    idToken: idToken,
    verificationId: window.confirmationResult.verificationId || null,
  };
};

export const authenticateWithBackend = async (idToken, username = null) => {
  const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:8000" : "";
  const response = await fetch(`${API_BASE_URL}/api/auth/firebase-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_token: idToken,
      username: username,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to authenticate with backend.");
  }

  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
};

