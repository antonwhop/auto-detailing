// Centralized, validated env access. Required vars throw at *use* time (not import
// time) so `next build` doesn't crash, but any request that needs them fails loud.

function required(name: string): string {
	const v = process.env[name];
	if (!v || v.trim() === "") {
		throw new Error(
			`Missing required env var ${name}. Set it in .env.local (see .env.example).`,
		);
	}
	return v;
}

export const env = {
	get whopApiKey() {
		return required("WHOP_API_KEY");
	},
	get whopCompanyId() {
		return required("WHOP_COMPANY_ID");
	},
	// Optional: restrict the storefront to one product's plans. If unset, all of
	// the company's visible plans are shown.
	whopProductId: process.env.WHOP_PRODUCT_ID || "",
	get baseUrl() {
		if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
		// On Vercel, default to the stable production https domain.
		if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
			return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
		return "http://localhost:3000";
	},
};

// Non-throwing check used by the UI to render a clear setup banner.
export function missingRequiredEnv(): string[] {
	const missing: string[] = [];
	if (!process.env.WHOP_API_KEY?.trim()) missing.push("WHOP_API_KEY");
	if (!process.env.WHOP_COMPANY_ID?.trim()) missing.push("WHOP_COMPANY_ID");
	return missing;
}
