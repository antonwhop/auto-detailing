import { env } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { updateStore } from "@/lib/store";
import { whop } from "@/lib/whop";

// Slide: "create business account" → POST /accounts. Real: companies.create
// spins up a (sub-)business under the configured parent company.
export async function POST(req: Request) {
	try {
		const { title, email } = (await req.json()) as {
			title?: string;
			email?: string;
		};
		if (!title) return fail("A business name is required", 400);

		const company = await whop().companies.create({
			parent_company_id: env.whopParentCompanyId || undefined,
			title,
			email: email || undefined,
		});

		await updateStore((s) => {
			s.business = { id: company.id, title, email };
		});

		return ok({ id: company.id, title, email });
	} catch (e) {
		return fail(e);
	}
}
