import { fail } from "@/lib/http";
import { whop } from "@/lib/whop";

export const dynamic = "force-dynamic";

// Mints a short-lived access token for the embedded payouts components, scoped to
// the given company. Mirrors the official embeddable-components example.
export async function GET(req: Request) {
	try {
		const companyId = new URL(req.url).searchParams.get("companyId");
		if (!companyId) return new Response(null, { status: 400 });
		const res = await whop().accessTokens.create({ company_id: companyId });
		return Response.json({ token: res.token });
	} catch (e) {
		return fail(e);
	}
}
