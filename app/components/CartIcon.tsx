"use client";

import { useCart } from "../context/CartContext";
import styles from "./CartIcon.module.css";

export default function CartIcon() {
  const { getTotalItems, setIsCartOpen } = useCart();
  const itemCount = getTotalItems();

  return (
    <button
      className={styles.cartIcon}
      onClick={() => setIsCartOpen(true)}
      aria-label={`Open cart with ${itemCount} items`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {itemCount > 0 && (
        <span className={styles.badge}>
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
