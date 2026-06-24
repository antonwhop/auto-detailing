import { readStore } from "@/lib/store";
import { BookingClient } from "./page.client";

export const dynamic = "force-dynamic";

export default async function BookPage({
	params,
	searchParams,
}: {
	params: Promise<{ planId: string }>;
	searchParams: Promise<{ ref?: string; status?: string }>;
}) {
	const { planId } = await params;
	const { ref, status } = await searchParams;
	const s = await readStore();
	const plan = s.plans.find((p) => p.id === planId) ?? null;
	const slots = s.availability[planId] ?? [];

	return (
		<BookingClient
			planId={planId}
			planTitle={plan?.title ?? "Car detailing"}
			price={plan?.price ?? null}
			slots={slots}
			referral={ref ?? null}
			success={status === "success"}
		/>
	);
}
