import { missingRequiredEnv } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { activeCompanyId, readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

// Hydrates the dashboard: current store state plus config the UI needs (the
// active company, whether AI ideas are enabled, and any missing required env).
export async function GET() {
	try {
		const s = await readStore();
		const fallback = process.env.WHOP_COMPANY_ID || "";
		return ok({
			...s,
			config: {
				activeCompanyId: activeCompanyId(s, fallback),
				hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
				baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
				missingEnv: missingRequiredEnv(),
			},
		});
	} catch (e) {
		return fail(e);
	}
}
