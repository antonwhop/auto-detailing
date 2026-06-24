import Link from "next/link";

/**
 * Brand mark — a stylized redwood, a nod to "El Palo Alto," the tall tree the
 * city is named after and carries on its seal. Renders dark on the cyan tile.
 */
export function BrandMark({ size = 30 }: { size?: number }) {
	const inner = Math.round(size * 0.62);
	return (
		<span className="brand-mark" style={{ width: size, height: size }} aria-hidden="true">
			<svg
				width={inner}
				height={inner}
				viewBox="0 0 24 24"
				fill="currentColor"
				role="presentation"
			>
				<path d="M12 3 L15.4 8.2 H8.6 Z" />
				<path d="M12 6.6 L17 13 H7 Z" />
				<path d="M12 10.4 L19 17.4 H5 Z" />
				<rect x="10.8" y="16.8" width="2.4" height="4.4" rx="0.4" />
			</svg>
		</span>
	);
}

/** Full lockup: redwood mark + stacked "Palo Alto / Auto Spa" wordmark. */
export function Logo() {
	return (
		<Link href="/" className="brand">
			<BrandMark />
			<span className="brand-word">
				<span className="brand-name">Palo Alto</span>
				<span className="brand-sub">Auto Spa</span>
			</span>
		</Link>
	);
}
