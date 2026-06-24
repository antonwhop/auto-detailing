import { env } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { activeCompanyId, readStore } from "@/lib/store";
import { whop } from "@/lib/whop";

// Slide: "run payroll to your friends" → POST /transfers. Real money movement:
// requires a funded origin balance and a valid destination. Errors are surfaced.
export async function POST(req: Request) {
	try {
		const { friendId, amount } = (await req.json()) as {
			friendId?: string;
			amount?: number | string;
		};
		if (!friendId) return fail("friendId is required", 400);
		if (amount === undefined || amount === "") return fail("An amount is required", 400);

		const s = await readStore();
		const origin_id = activeCompanyId(s, env.whopCompanyId);

		const transfer = await whop().transfers.create({
			origin_id,
			destination_id: friendId,
			amount: Number(amount),
			currency: "usd",
			notes: "Payroll",
		});

		return ok({
			id: (transfer as { id?: string }).id,
			amount: Number(amount),
			destination_id: friendId,
		});
	} catch (e) {
		return fail(e);
	}
}
