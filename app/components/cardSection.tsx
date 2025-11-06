"use client";

import React, { useMemo } from "react";
import styles from "./CardSection.module.css";

type CategoryCard = {
	id: number;
	label: string;
	image: string;
};

const useCategoryData = (): CategoryCard[] => {
	return useMemo(
		() => [
			{
				id: 1,
				label: "SHIRTS",
				image: "https://picsum.photos/seed/category1/600/700",
			},
			{
				id: 2,
				label: "SWEATERS AND MORE",
				image: "https://picsum.photos/seed/category2/600/700",
			},
			{
				id: 3,
				label: "T-SHIRTS",
				image: "https://picsum.photos/seed/category3/600/700",
			},
			{
				id: 4,
				label: "DENIM",
				image: "https://picsum.photos/seed/category4/600/700",
			},
			{
				id: 5,
				label: "ACTIVEWEAR",
				image: "https://picsum.photos/seed/category5/600/700",
			},
			{
				id: 6,
				label: "OUTERWEAR",
				image: "https://picsum.photos/seed/category6/600/700",
			},
		],
		[]
	);
};

export default function CardSection() {
	const categories = useCategoryData();

	return (
		<section className={styles.wrapper}>
			<h2 className={styles.heading}>CATEGORIES</h2>
			<div className={styles.grid}>
				{categories.map((category) => (
					<div key={category.id} className={styles.card}>
						<div className={styles.imageContainer}>
							<img
								src={category.image}
								alt={category.label}
								loading="lazy"
							/>
						</div>
						<h3 className={styles.label}>{category.label}</h3>
					</div>
				))}
			</div>
		</section>
	);
}
