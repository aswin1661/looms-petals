"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./ProductPage.module.css";

type Product = {
	id: number;
	name: string;
	description: string;
	price: number;
	discount_price: number | null;
	category: string;
	subcategory: string | null;
	brand: string | null;
	image_url: string;
	images: string[];
	stock: number;
	sizes: string[];
	colors: string[];
	status: string;
	type: string;
	is_featured: boolean;
	created_at: string;
};

// Skeleton loader component
const ProductSkeleton = () => (
	<div className={styles.loadingContainer}>
		<div className={styles.loader}></div>
	</div>
);

export default function ProductPage() {
	const params = useParams();
	const router = useRouter();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedSize, setSelectedSize] = useState<string>("");
	const [selectedColor, setSelectedColor] = useState<string>("");
	const [quantity, setQuantity] = useState(1);
	const [currentImage, setCurrentImage] = useState(0);

	const fetchProduct = useCallback(async (slug: string) => {
		try {
			// Extract ID from slug (format: "product-name-123")
			const id = slug.split('-').pop();
			if (!id) {
				router.push("/");
				return;
			}

			const response = await fetch(`/api/admin/products?id=${id}`);
			const data = await response.json();

			if (data.success) {
				setProduct(data.data);
			} else {
				router.push("/");
			}
		} catch (error) {
			console.error("Failed to fetch product:", error);
			router.push("/");
		} finally {
			setLoading(false);
		}
	}, [router]);

	useEffect(() => {
		if (params.slug) {
			fetchProduct(params.slug as string);
		}
	}, [params.slug, fetchProduct]);

	const images = useMemo(() => {
		if (!product) return [];
		return product.images && product.images.length > 0
			? product.images
			: [product.image_url || `https://picsum.photos/seed/${product.id}/800/1000`];
	}, [product]);

	const discount = useMemo(() => {
		if (!product?.discount_price) return 0;
		return Math.round(((product.price - product.discount_price) / product.price) * 100);
	}, [product]);

	const handleQuantityChange = useCallback((delta: number) => {
		setQuantity((prev) => {
			const newQty = prev + delta;
			return Math.max(1, Math.min(product?.stock || 1, newQty));
		});
	}, [product?.stock]);

	const handleImageChange = useCallback((index: number) => {
		setCurrentImage(index);
	}, []);

	if (loading) {
		return <ProductSkeleton />;
	}

	if (!product) {
		return null;
	}

	// Structured data for SEO
	const structuredData = {
		"@context": "https://schema.org/",
		"@type": "Product",
		name: product.name,
		image: images,
		description: product.description || `${product.name} - ${product.category}`,
		brand: {
			"@type": "Brand",
			name: product.brand || "Looms & Petals",
		},
		offers: {
			"@type": "Offer",
			url: typeof window !== "undefined" ? window.location.href : "",
			priceCurrency: "INR",
			price: product.discount_price || product.price,
			availability:
				product.stock > 0
					? "https://schema.org/InStock"
					: "https://schema.org/OutOfStock",
			priceValidUntil: new Date(
				Date.now() + 30 * 24 * 60 * 60 * 1000
			).toISOString(),
		},
		category: product.category,
	};

	return (
		<>
			{/* SEO: Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>

			<div className={styles.container}>
				<div className={styles.wrapper}>
					{/* Back Button */}
					<button onClick={() => router.back()} className={styles.backBtn}>
						← Back
					</button>

					<div className={styles.productGrid}>
					{/* Image Gallery */}
					<div className={styles.imageSection}>
						<div className={styles.mainImage}>
							<Image
								src={images[currentImage]}
								alt={product.name}
								fill
								sizes="(max-width: 768px) 100vw, 50vw"
								priority={currentImage === 0}
								quality={85}
								style={{ objectFit: "cover" }}
							/>
							{product.status !== "normal" && (
								<span className={`${styles.statusBadge} ${styles[product.status]}`}>
									{product.status.replace("_", " ").toUpperCase()}
								</span>
							)}
						</div>
						{images.length > 1 && (
							<div className={styles.thumbnails}>
								{images.map((img, index) => (
									<button
										key={index}
										className={`${styles.thumbnail} ${
											currentImage === index ? styles.activeThumbnail : ""
										}`}
										onClick={() => handleImageChange(index)}
										aria-label={`View image ${index + 1}`}
									>
										<Image
											src={img}
											alt={`${product.name} ${index + 1}`}
											fill
											sizes="100px"
											quality={60}
											style={{ objectFit: "cover" }}
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Product Details */}
					<div className={styles.detailsSection}>
						<div className={styles.breadcrumb}>
							{product.type} / {product.category}
						</div>

						<h1 className={styles.productName}>{product.name}</h1>

						{product.brand && (
							<p className={styles.brand}>by {product.brand}</p>
						)}

						<div className={styles.priceSection}>
							<div className={styles.priceRow}>
								<span className={styles.currentPrice}>
									₹{product.discount_price || product.price}
								</span>
								{product.discount_price && (
									<>
										<span className={styles.originalPrice}>₹{product.price}</span>
										<span className={styles.discountBadge}>{discount}% OFF</span>
									</>
								)}
							</div>
							<p className={styles.taxInfo}>Inclusive of all taxes</p>
						</div>

						{/* Description */}
						{product.description && (
							<div className={styles.description}>
								<h3>Description</h3>
								<p>{product.description}</p>
							</div>
						)}

						{/* Size Selection */}
						{product.sizes && product.sizes.length > 0 && (
							<div className={styles.optionGroup}>
								<h3>Select Size</h3>
								<div className={styles.sizeOptions}>
									{product.sizes.map((size) => (
										<button
											key={size}
											className={`${styles.sizeBtn} ${
												selectedSize === size ? styles.selected : ""
											}`}
											onClick={() => setSelectedSize(size)}
										>
											{size}
										</button>
									))}
								</div>
							</div>
						)}

						{/* Color Selection */}
						{product.colors && product.colors.length > 0 && (
							<div className={styles.optionGroup}>
								<h3>Select Color</h3>
								<div className={styles.colorOptions}>
									{product.colors.map((color) => (
										<button
											key={color}
											className={`${styles.colorBtn} ${
												selectedColor === color ? styles.selected : ""
											}`}
											onClick={() => setSelectedColor(color)}
											style={{ background: color }}
										>
											{selectedColor === color && <span>✓</span>}
										</button>
									))}
								</div>
							</div>
						)}

						{/* Quantity */}
						<div className={styles.optionGroup}>
							<h3>Quantity</h3>
							<div className={styles.quantitySelector}>
								<button
									onClick={() => handleQuantityChange(-1)}
									className={styles.qtyBtn}
									aria-label="Decrease quantity"
									disabled={quantity <= 1}
								>
									−
								</button>
								<span className={styles.quantity}>{quantity}</span>
								<button
									onClick={() => handleQuantityChange(1)}
									className={styles.qtyBtn}
									aria-label="Increase quantity"
									disabled={quantity >= product.stock}
								>
									+
								</button>
							</div>
							<p className={styles.stockInfo}>
								{product.stock > 0 ? (
									<span className={styles.inStock}>
										{product.stock} items in stock
									</span>
								) : (
									<span className={styles.outOfStock}>Out of stock</span>
								)}
							</p>
						</div>

						{/* Action Buttons */}
						<div className={styles.actions}>
							<button
								className={styles.addToCartBtn}
								disabled={product.stock === 0}
							>
								Add to Cart
							</button>
							<button
								className={styles.buyNowBtn}
								disabled={product.stock === 0}
							>
								Buy Now
							</button>
						</div>

						{/* Additional Info */}
						<div className={styles.infoCards}>
							<div className={styles.infoCard}>
								<span className={styles.infoIcon}>🚚</span>
								<div>
									<h4>Free Delivery</h4>
									<p>On orders above ₹999</p>
								</div>
							</div>
							<div className={styles.infoCard}>
								<span className={styles.infoIcon}>↩️</span>
								<div>
									<h4>Easy Returns</h4>
									<p>7 days return policy</p>
								</div>
							</div>
							<div className={styles.infoCard}>
								<span className={styles.infoIcon}>✓</span>
								<div>
									<h4>Authentic Product</h4>
									<p>100% original</p>
								</div>
							</div>
						</div>
					</div>
					</div>
				</div>
			</div>
		</>
	);
}
