import { env } from "@/lib/env";
import { defaultSlots, fail, ok } from "@/lib/http";
import { activeCompanyId, readStore, updateStore } from "@/lib/store";
import { whop } from "@/lib/whop";

// Slide: POST /plans. Real — a one-time priced package on the product.
export async function POST(req: Request) {
	try {
		const { title, price, productId } = (await req.json()) as {
			title?: string;
			price?: number | string;
			productId?: string;
		};
		if (!title) return fail("A plan title is required", 400);
		if (price === undefined || price === "") return fail("A price is required", 400);

		const s = await readStore();
		const company_id = activeCompanyId(s, env.whopCompanyId);
		const product_id = productId || s.product?.id;
		if (!product_id) return fail("Create a product first", 400);

		const plan = await whop().plans.create({
			company_id,
			product_id,
			plan_type: "one_time",
			initial_price: Number(price),
			currency: "usd",
			title,
			visibility: "visible",
		});

		await updateStore((st) => {
			st.plans.push({
				id: plan.id,
				title,
				price: Number(price),
				productId: product_id,
				kind: "standard",
				purchaseUrl: plan.purchase_url,
			});
			st.availability[plan.id] = defaultSlots();
		});

		return ok({
			id: plan.id,
			title,
			price: Number(price),
			purchaseUrl: plan.purchase_url,
			bookingLink: `${env.baseUrl}/book/${plan.id}`,
		});
	} catch (e) {
		return fail(e);
	}
}
