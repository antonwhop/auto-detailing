import { env } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { whop } from "@/lib/whop";

// Creates a Whop checkout session for a plan. The chosen appointment time and the
// customer email are attached as metadata; a referral code (if any) is forwarded
// as affiliate_code. The returned sessionId is rendered by <WhopCheckoutEmbed>.
export async function POST(req: Request) {
	try {
		const { planId, ref, slot, email } = (await req.json()) as {
			planId?: string;
			ref?: string;
			slot?: string;
			email?: string;
		};
		if (!planId) return fail("planId is required", 400);

		const metadata: Record<string, unknown> = {};
		if (slot) metadata.slot = slot;
		if (ref) metadata.ref = ref;
		if (email) metadata.email = email;

		// Whop only accepts an https redirect URL, so omit it on http/localhost.
		const redirect_url = env.baseUrl.startsWith("https://")
			? `${env.baseUrl}/book/${planId}?status=success`
			: undefined;

		const session = await whop().checkoutConfigurations.create({
			plan_id: planId,
			affiliate_code: ref || undefined,
			metadata,
			redirect_url,
		});

		return ok({ sessionId: session.id, purchaseUrl: session.purchase_url });
	} catch (e) {
		return fail(e);
	}
}
