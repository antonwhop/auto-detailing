// JSON helpers for route handlers. `fail` surfaces the real error message (and any
// Whop API error detail) instead of swallowing it — the app should fail loud.

export function ok(data: unknown, status = 200): Response {
	return Response.json(data, { status });
}

export function fail(e: unknown, status = 500): Response {
	if (typeof e === "string") {
		return Response.json({ error: e }, { status: status === 500 ? 400 : status });
	}
	const message = e instanceof Error ? e.message : "Unknown error";
	// Stainless SDK errors expose `status` and often a structured `error` body.
	const anyErr = e as { status?: number; error?: unknown };
	return Response.json(
		{ error: message, detail: anyErr?.error },
		{ status: anyErr?.status ?? status },
	);
}

export function defaultSlots(): string[] {
	// Next 7 days, skipping weekends, at 9:00 and 14:00 local time.
	const slots: string[] = [];
	const now = new Date();
	for (let d = 1; d <= 7 && slots.length < 8; d++) {
		const day = new Date(now);
		day.setDate(now.getDate() + d);
		const weekday = day.getDay();
		if (weekday === 0 || weekday === 6) continue;
		for (const hour of [9, 14]) {
			const slot = new Date(day);
			slot.setHours(hour, 0, 0, 0);
			slots.push(slot.toISOString());
		}
	}
	return slots;
}
