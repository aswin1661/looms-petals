"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./auth.module.css";

export default function RegisterPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'details'>('email');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('details');
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        alert('New OTP sent successfully!');
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await register(email, password, name, otp);
      if (!result.success) {
        setError(result.message || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>
            {step === 'email' && 'Enter your email to get started'}
            {step === 'otp' && 'Verify your email'}
            {step === 'details' && 'Complete your registration'}
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleSendOTP} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.spinner}></span>
              ) : (
                "Send Verification Code"
              )}
            </button>

            <div className={styles.footer}>
              <p className={styles.footerText}>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className={styles.link}
                  disabled={loading}
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className={styles.form}>
            <div className={styles.otpInfo}>
              <p style={{ marginBottom: '5px', color: '#666' }}>We&apos;ve sent a 6-digit code to</p>
              <p style={{ fontWeight: '600', color: '#333' }}>{email}</p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="otp" className={styles.label}>
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={styles.input}
                placeholder="000000"
                maxLength={6}
                required
                disabled={loading}
                style={{ 
                  textAlign: 'center', 
                  fontSize: '1.5rem', 
                  letterSpacing: '0.5rem',
                  fontWeight: '600'
                }}
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <span className={styles.spinner}></span>
              ) : (
                "Verify Code"
              )}
            </button>

            <div className={styles.footer}>
              <button
                type="button"
                onClick={handleResendOTP}
                className={styles.link}
                disabled={loading}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Resend Code
              </button>
              <span style={{ margin: '0 8px', color: '#ccc' }}>•</span>
              <button
                type="button"
                onClick={() => setStep('email')}
                className={styles.link}
                disabled={loading}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        {step === 'details' && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div style={{ 
              background: '#d4edda', 
              color: '#155724', 
              padding: '12px 16px', 
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              ✓ Email verified successfully!
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="John Doe"
                required
                autoComplete="name"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="Minimum 8 characters"
                required
                autoComplete="new-password"
                disabled={loading}
                minLength={8}
              />
              <p className={styles.hint}>Must be at least 8 characters</p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.spinner}></span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
