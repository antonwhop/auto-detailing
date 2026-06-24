import { env } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { updateStore } from "@/lib/store";
import { whop } from "@/lib/whop";

// Slide: "hire your friends" → POST /accounts (from the business API key). Real:
// each friend becomes a connected (sub-)company we can pay via transfers.
export async function POST(req: Request) {
	try {
		const { name, email } = (await req.json()) as {
			name?: string;
			email?: string;
		};
		if (!name) return fail("A name is required", 400);

		const company = await whop().companies.create({
			parent_company_id: env.whopParentCompanyId || env.whopCompanyId,
			title: `${name} (detailer)`,
			email: email || undefined,
		});

		const friend = { id: company.id, name, email: email || "" };
		await updateStore((st) => {
			st.friends.push(friend);
		});

		return ok(friend);
	} catch (e) {
		return fail(e);
	}
}
