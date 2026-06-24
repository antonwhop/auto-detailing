import { env } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { readStore, updateStore } from "@/lib/store";

// Slide: POST /calendar (set availability for a plan) and PATCH /calendar (add
// more availability, e.g. when a friend joins). Whop has no calendar endpoint,
// so availability lives in the local store and the "calendar link" is our own
// public booking page.

function bookingLink(planId: string) {
	return `${env.baseUrl}/book/${planId}`;
}

export async function POST(req: Request) {
	try {
		const { planId, slots } = (await req.json()) as {
			planId?: string;
			slots?: string[];
		};
		if (!planId) return fail("planId is required", 400);

		const s = await readStore();
		if (!s.plans.some((p) => p.id === planId))
			return fail("Unknown planId", 400);

		const next = await updateStore((st) => {
			st.availability[planId] = [...new Set(slots ?? st.availability[planId] ?? [])].sort();
		});

		return ok({ planId, link: bookingLink(planId), slots: next.availability[planId] });
	} catch (e) {
		return fail(e);
	}
}

export async function PATCH(req: Request) {
	try {
		const { planId, slots } = (await req.json()) as {
			planId?: string;
			slots?: string[];
		};
		if (!planId) return fail("planId is required", 400);
		if (!slots?.length) return fail("slots are required", 400);

		const next = await updateStore((st) => {
			const existing = st.availability[planId] ?? [];
			st.availability[planId] = [...new Set([...existing, ...slots])].sort();
		});

		return ok({ planId, link: bookingLink(planId), slots: next.availability[planId] });
	} catch (e) {
		return fail(e);
	}
}
