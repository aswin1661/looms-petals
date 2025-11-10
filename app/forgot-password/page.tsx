"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../login/auth.module.css";

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setStep("otp");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("OTP resent successfully!");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("OTP verified! Enter your new password.");
        setStep("password");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep("email");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>
            {step === "email" && "Enter your email to receive an OTP"}
            {step === "otp" && "Enter the OTP sent to your email"}
            {step === "password" && "Create a new password"}
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: step === "email" ? "#7a2d2d" : "#e5e7eb",
              transition: 'all 0.3s'
            }}
          />
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: step === "otp" ? "#7a2d2d" : "#e5e7eb",
              transition: 'all 0.3s'
            }}
          />
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: step === "password" ? "#7a2d2d" : "#e5e7eb",
              transition: 'all 0.3s'
            }}
          />
        </div>

        <form className={styles.form} onSubmit={
          step === "email" ? handleSendOtp :
          step === "otp" ? handleVerifyOtp :
          handleResetPassword
        }>
          {error && (
            <div className={styles.error}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          {message && (
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#0369a1',
              fontSize: '14px'
            }}>
              <span style={{ fontSize: '18px' }}>✓</span>
              {message}
            </div>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
              >
                {loading ? <span className={styles.spinner}></span> : "Send OTP"}
              </button>

              <div className={styles.footer}>
                <p className={styles.footerText}>
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className={styles.link}
                    disabled={loading}
                  >
                    Back to Login
                  </button>
                </p>
              </div>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="otp" className={styles.label}>
                  Enter OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className={styles.input}
                  placeholder="000000"
                  disabled={loading}
                  style={{ 
                    textAlign: 'center', 
                    fontSize: '24px', 
                    letterSpacing: '8px',
                    fontWeight: '600'
                  }}
                />
                <p className={styles.hint}>
                  Sent to: {email}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={styles.submitBtn}
              >
                {loading ? <span className={styles.spinner}></span> : "Verify OTP"}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className={styles.link}
                  style={{ fontSize: '14px' }}
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className={styles.link}
                  style={{ fontSize: '14px' }}
                >
                  Change Email
                </button>
              </div>
            </>
          )}

          {/* Step 3: New Password */}
          {step === "password" && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="newPassword" className={styles.label}>
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Enter new password"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <p className={styles.hint}>
                  Password must be at least 8 characters long
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
              >
                {loading ? <span className={styles.spinner}></span> : "Reset Password"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
