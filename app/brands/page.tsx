"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Brands.module.css";

type Brand = {
  name: string;
  minPrice: number;
  productCount: number;
  image: string;
};

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/admin/products");
        const data = await response.json();

        if (data.success) {
          const products = data.data;

          // Group by brand
          const brandMap = new Map<string, { minPrice: number; count: number; image: string; type: string }>();

          products.forEach((product: any) => {
            if (product.brand) {
              const price = product.discount_price || product.price;
              const existing = brandMap.get(product.brand);

              if (!existing || price < existing.minPrice) {
                brandMap.set(product.brand, {
                  minPrice: price,
                  count: existing ? existing.count + 1 : 1,
                  image: product.image_url || `https://picsum.photos/seed/${product.brand}/800/600`,
                  type: product.type
                });
              } else {
                brandMap.set(product.brand, {
                  ...existing,
                  count: existing.count + 1
                });
              }
            }
          });

          // Convert to array
          const brandsArray = Array.from(brandMap.entries()).map(([name, data]) => ({
            name,
            minPrice: data.minPrice,
            productCount: data.count,
            image: data.image
          }));

          setBrands(brandsArray);
        }
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const filteredBrands = filter === "all" 
    ? brands 
    : brands.filter(b => b.name.toLowerCase().startsWith(filter));

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backBtn}>
        ← Back
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>All Brands</h1>
        <p className={styles.subtitle}>
          Discover {brands.length} premium brands for your wardrobe
        </p>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"].map(
          (letter) => (
            <button
              key={letter}
              className={`${styles.filterBtn} ${filter === letter ? styles.active : ""}`}
              onClick={() => setFilter(letter)}
            >
              {letter.toUpperCase()}
            </button>
          )
        )}
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className={styles.brandCard} style={{ background: "#f0f0f0" }}>
              <div style={{ height: "100%" }} />
            </div>
          ))}
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className={styles.empty}>
          <p>No brands found starting with "{filter.toUpperCase()}"</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredBrands.map((brand) => (
            <div 
              key={brand.name} 
              className={styles.brandCard}
              onClick={() => router.push(`/brands/${encodeURIComponent(brand.name.toLowerCase().replace(/\s+/g, '-'))}`)}
            >
              <div className={styles.imageWrapper}>
                <img src={brand.image} alt={brand.name} />
                <div className={styles.overlay} />
              </div>
              <div className={styles.content}>
                <h3 className={styles.brandName}>{brand.name}</h3>
                <div className={styles.info}>
                  <span className={styles.price}>From ₹{brand.minPrice}</span>
                  <span className={styles.count}>{brand.productCount} Products</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
