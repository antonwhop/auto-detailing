import { env } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { activeCompanyId, readStore } from "@/lib/store";
import { whop } from "@/lib/whop";

// Slide: POST /invoices. Real and (per project decision) auto-charging: this
// charges the customer's stored payment method. Requires the customer to be a
// member with a payment method on file — otherwise Whop returns an error, which
// we surface rather than hide.
export async function POST(req: Request) {
	try {
		const { email, name, amount, description } = (await req.json()) as {
			email?: string;
			name?: string;
			amount?: number | string;
			description?: string;
		};
		if (!email) return fail("Customer email is required", 400);
		if (amount === undefined || amount === "") return fail("An amount is required", 400);

		const s = await readStore();
		const company_id = activeCompanyId(s, env.whopCompanyId);
		const due = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

		const invoice = await whop().invoices.create({
			company_id,
			collection_method: "charge_automatically",
			plan: {
				initial_price: Number(amount),
				plan_type: "one_time",
			},
			product: { title: description || "Car detailing — additional charge" },
			email_address: email,
			customer_name: name || undefined,
			due_date: due,
		});

		return ok({
			id: invoice.id,
			number: invoice.number,
			status: invoice.status,
		});
	} catch (e) {
		return fail(e);
	}
}
