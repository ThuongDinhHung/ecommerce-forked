import React, { useMemo } from 'react'

// StarRating component
// - Default export so existing imports like `import StarRating from "../review/StarRating"` work
// - Props:
//    - `rating` (number): current rating value (can be fractional) — defaults to 0
//    - `max` (number): number of stars to show — defaults to 5
//    - `size` (number|string): pixel size or tailwind size class — defaults to 16
//    - `modeRate` (boolean): if true, show interactive UI placeholder (not implementing full rating input here)
// Notes:
// - This is intentionally lightweight and dependency-free.
// - Handles edge cases: non-number rating, out-of-range rating, zero/max <= 0.

function Star({ filled, size = 16, title }) {
	const s = typeof size === 'number' ? size : 16;
	return (
		<svg
			width={s}
			height={s}
			viewBox="0 0 24 24"
			fill={filled ? 'currentColor' : 'none'}
			stroke="currentColor"
			strokeWidth="1.2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden={title ? 'false' : 'true'}
			role={title ? 'img' : 'presentation'}
			className="inline-block text-yellow-400"
		>
			{title && <title>{title}</title>}
			<path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.172L12 18.896l-7.336 3.87 1.402-8.172L.132 9.21l8.2-1.192z" />
		</svg>
	)
}

export default function StarRating({ rating = 0, max = 5, size = 16, modeRate = false }) {
	// Defensive normalization
	const safeMax = Number.isFinite(max) && max > 0 ? Math.floor(max) : 5;
	let value = Number(rating);
	if (!Number.isFinite(value) || value < 0) value = 0;
	if (value > safeMax) value = safeMax;

	// Create an array describing each star's fill state (full / partial / empty)
	const stars = useMemo(() => {
		const arr = [];
		for (let i = 0; i < safeMax; i++) {
			const starIndex = i + 1;
			if (value >= starIndex) arr.push({ filled: 1 });
			else if (value + 0.25 >= starIndex) arr.push({ filled: 0.75 });
			else if (value + 0.5 >= starIndex) arr.push({ filled: 0.5 });
			else if (value + 0.75 >= starIndex) arr.push({ filled: 0.25 });
			else arr.push({ filled: 0 });
		}
		return arr;
	}, [value, safeMax]);

	// For simplicity we render full/empty visuals using color only. Partial fills require masking which is overkill here.
	// Keep the component pure and lightweight; it's only used for display in product cards.

	return (
		<div className="star-rating inline-flex items-center gap-1" aria-label={`Rating: ${value} of ${safeMax}`} role="img">
			{stars.map((s, idx) => (
				// use the 'filled' threshold to decide color; partials will look like filled for now
				<span key={idx} className={s.filled ? 'text-yellow-400' : 'text-gray-300'}>
					<Star filled={s.filled >= 0.5} size={size} />
				</span>
			))}
			{/* Optionally show numeric rating for clarity */}
			{modeRate && (
				<span className="text-sm text-gray-600 ml-2">{value.toFixed(1)}</span>
			)}
		</div>
	)
}

