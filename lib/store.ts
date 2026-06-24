import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

// Tiny file-backed JSON store. Single-business demo state, no DB. It holds the
// real Whop IDs created during the flow plus the simple local concepts (calendar
// availability, bookings, ads, referrals) that Whop has no endpoint for.

// On Vercel the project filesystem is read-only, so use the writable temp dir
// there (state is per-instance/ephemeral, which is fine for a demo). Locally we
// persist under .data/.
const DATA_DIR = process.env.VERCEL
	? path.join(os.tmpdir(), "whop-car-detail")
	: path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "store.json");

export type Plan = {
	id: string;
	title: string;
	price: number;
	productId: string;
	kind: "standard" | "corporate";
	purchaseUrl?: string;
};

export type Booking = {
	id: string;
	planId: string;
	slot: string;
	email: string;
	ref?: string;
	sessionId: string;
	createdAt: string;
};

export type Friend = { id: string; name: string; email: string };

export type Ad = {
	id: string;
	headline: string;
	primaryText: string;
	cta: string;
	budget: number;
	link: string;
};

export type Referral = { code: string; planId: string; link: string };

export type Store = {
	business: { id: string; title: string; email?: string } | null;
	product: { id: string; title: string } | null;
	plans: Plan[];
	availability: Record<string, string[]>;
	bookings: Booking[];
	friends: Friend[];
	ads: Ad[];
	referrals: Referral[];
};

const EMPTY: Store = {
	business: null,
	product: null,
	plans: [],
	availability: {},
	bookings: [],
	friends: [],
	ads: [],
	referrals: [],
};

export async function readStore(): Promise<Store> {
	try {
		const raw = await fs.readFile(FILE, "utf8");
		return { ...EMPTY, ...JSON.parse(raw) };
	} catch {
		return { ...EMPTY };
	}
}

export async function writeStore(s: Store): Promise<void> {
	await fs.mkdir(DATA_DIR, { recursive: true });
	await fs.writeFile(FILE, JSON.stringify(s, null, 2));
}

export async function updateStore(
	fn: (s: Store) => void | Store,
): Promise<Store> {
	const s = await readStore();
	const next = fn(s) || s;
	await writeStore(next);
	return next;
}

// The company products/plans/payouts operate on: the in-app created business if
// present, otherwise the configured company.
export function activeCompanyId(s: Store, fallback: string): string {
	return s.business?.id || fallback;
}

export function randomId(prefix: string): string {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
