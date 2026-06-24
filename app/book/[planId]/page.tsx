import { getService } from "@/lib/catalog";
import { defaultSlots } from "@/lib/http";
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
	const service = await getService(planId);

	return (
		<BookingClient
			planId={planId}
			title={service?.title ?? "Car detailing"}
			priceLabel={service?.priceLabel ?? null}
			cadence={service?.cadence ?? null}
			recurring={service?.recurring ?? false}
			slots={defaultSlots()}
			referral={ref ?? null}
			success={status === "success"}
		/>
	);
}
