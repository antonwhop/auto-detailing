import { env } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { randomId, readStore, updateStore } from "@/lib/store";

// Slide: POST /ads. The Whop SDK only exposes ads.list/retrieve (no create), so
// this composes a simple local ad whose destination is the plan's booking link.
export async function POST(req: Request) {
	try {
		const { headline, primaryText, cta, budget, planId } = (await req.json()) as {
			headline?: string;
			primaryText?: string;
			cta?: string;
			budget?: number | string;
			planId?: string;
		};
		if (!headline) return fail("A headline is required", 400);
		if (!planId) return fail("planId is required", 400);

		const s = await readStore();
		if (!s.plans.some((p) => p.id === planId))
			return fail("Unknown planId", 400);

		const referral = s.referrals.find((r) => r.planId === planId);
		const link = referral?.link ?? `${env.baseUrl}/book/${planId}`;

		const ad = {
			id: randomId("ad"),
			headline,
			primaryText: primaryText ?? "",
			cta: cta ?? "Book now",
			budget: Number(budget ?? 0),
			link,
		};

		await updateStore((st) => {
			st.ads.push(ad);
		});

		return ok(ad);
	} catch (e) {
		return fail(e);
	}
}
