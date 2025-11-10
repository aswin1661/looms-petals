"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message || "Login failed");
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
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

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

          <div className={styles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className={styles.link}
                disabled={loading}
                style={{ fontSize: '0.875rem' }}
              >
                Forgot Password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
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
              "Sign In"
            )}
          </button>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className={styles.link}
                disabled={loading}
              >
                Create Account
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
