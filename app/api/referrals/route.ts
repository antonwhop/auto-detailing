import { env } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { readStore, updateStore } from "@/lib/store";

// Slide: POST /referrals/products/:product_id → a calendar link with a referral
// code. Whop has no such endpoint, but the code is honored for real: it is passed
// to checkout as `affiliate_code`, so Whop credits the referrer at payment time.
export async function POST(req: Request) {
	try {
		const { planId } = (await req.json()) as { planId?: string };
		if (!planId) return fail("planId is required", 400);

		const s = await readStore();
		if (!s.plans.some((p) => p.id === planId))
			return fail("Unknown planId", 400);

		const code = Math.random().toString(36).slice(2, 8).toUpperCase();
		const link = `${env.baseUrl}/book/${planId}?ref=${code}`;

		await updateStore((st) => {
			st.referrals.push({ code, planId, link });
		});

		return ok({ code, planId, link });
	} catch (e) {
		return fail(e);
	}
}
