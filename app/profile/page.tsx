"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSaving(true);

    try {
      const result = await updateProfile({ name, phone });
      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({ type: "error", text: result.message || "Update failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          ← Back
        </button>

        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.subtitle}>Manage your account information</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {message.text && (
              <div className={`${styles.message} ${styles[message.type]}`}>
                {message.text}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={user.email}
                className={styles.input}
                disabled
              />
              <p className={styles.hint}>Email cannot be changed</p>
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
                placeholder="Enter your name"
                disabled={saving}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={styles.input}
                placeholder="Enter your phone number"
                disabled={saving}
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
