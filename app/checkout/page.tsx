"use client";

import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "./Checkout.module.css";

type StockValidation = {
  productId: number;
  name: string;
  requestedQty: number;
  availableStock: number;
  isValid: boolean;
};

export default function CheckoutPage() {
  const { items, getTotalPrice, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  const [validating, setValidating] = useState(true);
  const [stockIssues, setStockIssues] = useState<StockValidation[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Validate stock function
  const validateStock = async () => {
    setValidating(true);
    const issues: StockValidation[] = [];

    // Fetch current stock for all items in cart
    for (const item of items) {
      try {
        const response = await fetch(`/api/admin/products?id=${item.id}`);
        const data = await response.json();

        if (data.success && data.data) {
          const currentStock = data.data.stock;

          // Check if cart quantity exceeds available stock
          if (item.quantity > currentStock) {
            issues.push({
              productId: item.id,
              name: item.name,
              requestedQty: item.quantity,
              availableStock: currentStock,
              isValid: false,
            });

            // Auto-adjust quantity to available stock
            if (currentStock > 0) {
              updateQuantity(
                item.id,
                currentStock,
                item.selectedSize,
                item.selectedColor
              );
            } else {
              // Remove if out of stock
              removeFromCart(item.id, item.selectedSize, item.selectedColor);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to validate stock for ${item.name}:`, error);
      }
    }

    setStockIssues(issues);
    setValidating(false);
  };

  // Validate stock on mount
  useEffect(() => {
    if (items.length > 0) {
      validateStock();
    } else {
      setValidating(false);
    }
  }, []); // Run only on mount

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    
    // Re-validate stock before placing order
    await validateStock();
    
    // Check if there are any stock issues after validation
    const hasIssues = items.some(item => {
      // Fetch would have already adjusted/removed problematic items
      return false; // This will be updated by the validation
    });
    
    // TODO: Implement actual order placement logic
    alert("Order placed successfully! (Demo mode)");
    
    setIsPlacingOrder(false);
  };

  if (validating) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⏳</div>
          <h2>Validating stock availability...</h2>
          <p>Please wait while we check product availability</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add items to your cart to proceed with checkout</p>
          <button className={styles.shopBtn} onClick={() => router.push("/")}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          ← Back
        </button>

        <h1 className={styles.title}>Checkout</h1>

        {/* Stock Issues Warning */}
        {stockIssues.length > 0 && (
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Stock Availability Issues</h3>
            </div>
            <p className={styles.warningText}>
              Some items in your cart have limited availability. We've adjusted the quantities automatically:
            </p>
            <ul className={styles.issuesList}>
              {stockIssues.map((issue, index) => (
                <li key={index}>
                  <strong>{issue.name}</strong>:{" "}
                  {issue.availableStock === 0 ? (
                    <span className={styles.outOfStock}>
                      Out of stock (removed from cart)
                    </span>
                  ) : (
                    <span className={styles.adjusted}>
                      Quantity adjusted from {issue.requestedQty} to {issue.availableStock}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.grid}>
          {/* Order Summary */}
          <div className={styles.orderSection}>
            <h2>Order Summary</h2>
            <div className={styles.items}>
              {items.map((item, index) => {
                const price = item.discount_price || item.price;
                return (
                  <div key={index} className={styles.item}>
                    <div className={styles.itemImage}>
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        sizes="80px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className={styles.itemDetails}>
                      <h3>{item.name}</h3>
                      <p className={styles.itemBrand}>{item.brand}</p>
                      {item.selectedSize && (
                        <span className={styles.variant}>Size: {item.selectedSize}</span>
                      )}
                      {item.selectedColor && (
                        <span className={styles.variant}>
                          Color: <span style={{ 
                            display: 'inline-block',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: item.selectedColor,
                            border: '1px solid #ddd',
                            marginLeft: '4px',
                            verticalAlign: 'middle'
                          }} />
                        </span>
                      )}
                      <div className={styles.itemFooter}>
                        <span className={styles.qty}>Qty: {item.quantity}</span>
                        <span className={styles.price}>₹{(price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.totalSection}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>₹{getTotalPrice().toLocaleString()}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span className={styles.free}>Free</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Total</span>
                <span>₹{getTotalPrice().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className={styles.formSection}>
            <h2>Delivery Information</h2>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input type="text" placeholder="Enter your full name" required />
              </div>

              <div className={styles.formGroup}>
                <label>Email Address *</label>
                <input type="email" placeholder="your@email.com" required />
              </div>

              <div className={styles.formGroup}>
                <label>Phone Number *</label>
                <input type="tel" placeholder="+91 XXXXX XXXXX" required />
              </div>

              <div className={styles.formGroup}>
                <label>Address *</label>
                <textarea placeholder="Street address" rows={3} required />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>City *</label>
                  <input type="text" placeholder="City" required />
                </div>

                <div className={styles.formGroup}>
                  <label>State *</label>
                  <input type="text" placeholder="State" required />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>PIN Code *</label>
                  <input type="text" placeholder="000000" required />
                </div>

                <div className={styles.formGroup}>
                  <label>Country *</label>
                  <input type="text" placeholder="India" defaultValue="India" required />
                </div>
              </div>

              <div className={styles.paymentInfo}>
                <h3>Payment Method</h3>
                <div className={styles.paymentOptions}>
                  <label className={styles.paymentOption}>
                    <input type="radio" name="payment" value="cod" defaultChecked />
                    <span>Cash on Delivery</span>
                  </label>
                  <label className={styles.paymentOption}>
                    <input type="radio" name="payment" value="online" />
                    <span>Online Payment (Coming Soon)</span>
                  </label>
                </div>
              </div>

              <button 
                type="button" 
                className={styles.placeOrderBtn}
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || items.length === 0}
              >
                {isPlacingOrder ? "Processing..." : "Place Order"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
