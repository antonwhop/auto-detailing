import { env } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { activeCompanyId, readStore, updateStore } from "@/lib/store";
import { whop } from "@/lib/whop";

// Slide: POST /products. Real.
export async function POST(req: Request) {
	try {
		const { title, description } = (await req.json()) as {
			title?: string;
			description?: string;
		};
		if (!title) return fail("A product title is required", 400);

		const s = await readStore();
		const company_id = activeCompanyId(s, env.whopCompanyId);

		const product = await whop().products.create({
			company_id,
			title,
			description: description || undefined,
		});

		await updateStore((st) => {
			st.product = { id: product.id, title };
		});

		return ok({ id: product.id, title, company_id });
	} catch (e) {
		return fail(e);
	}
}
