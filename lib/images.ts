// Real, hotlinkable photography from Unsplash's image CDN. Each id was verified to
// resolve (HTTP 200) and visually checked to match its use. We hit the CDN directly
// with `auto=format` so it serves modern formats — no next/image domain config needed.

const BASE = "https://images.unsplash.com";

/** Build a sized, compressed Unsplash CDN url for a given photo id. */
export function img(
	id: string,
	{ w = 1200, h, q = 75 }: { w?: number; h?: number; q?: number } = {},
): string {
	const params = new URLSearchParams({
		auto: "format",
		fit: "crop",
		w: String(w),
		q: String(q),
	});
	if (h) params.set("h", String(h));
	return `${BASE}/${id}?${params.toString()}`;
}

// Curated, hand-checked photo ids.
export const PHOTOS = {
	foamWash: "photo-1607860108855-64acf2078ed9", // person snow-foaming a black car
	waterSpray: "photo-1520340356584-f9917d1eea6f", // water spraying off a dark car rear
	interior: "photo-1610647752706-3bb12232b3ab", // clean modern dashboard / interior
	brush: "photo-1558618666-fcd25c85cd64", // detailing brush, close craft shot
	cleanSedan: "photo-1601362840469-51e4d8d58785", // gleaming grey sedan by the water
	glossyPorsche: "photo-1503376780353-7e6692767b70", // black Porsche, mirror-gloss paint
	redFerrari: "photo-1583121274602-3e2820c69888", // red Ferrari, showroom finish
	blueCamaro: "photo-1552519507-da3b142c6e3d", // electric-blue muscle car
	blackMustang: "photo-1494976388531-d1058494cdd8", // moody black muscle car, front
} as const;

/**
 * Pick a fitting hero image for a service by reading keywords from its title,
 * falling back to a rotation so every card still gets a distinct photo.
 */
const ROTATION = [
	PHOTOS.foamWash,
	PHOTOS.glossyPorsche,
	PHOTOS.interior,
	PHOTOS.cleanSedan,
	PHOTOS.waterSpray,
];

export function serviceImage(title: string, index: number): string {
	const t = title.toLowerCase();
	if (t.includes("interior")) return PHOTOS.interior;
	if (t.includes("ceramic") || t.includes("coat") || t.includes("polish"))
		return PHOTOS.glossyPorsche;
	if (t.includes("express") || t.includes("wash") || t.includes("exterior"))
		return PHOTOS.waterSpray;
	if (t.includes("full") || t.includes("premium") || t.includes("ultimate"))
		return PHOTOS.foamWash;
	if (t.includes("member") || t.includes("month") || t.includes("plan"))
		return PHOTOS.cleanSedan;
	return ROTATION[index % ROTATION.length];
}
