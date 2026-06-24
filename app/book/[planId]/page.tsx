import { getService } from "@/lib/catalog";
import { defaultSlots } from "@/lib/http";
import { img, serviceImage } from "@/lib/images";
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

	const title = service?.title ?? "Car detailing";
	const image = img(serviceImage(title, 0), { w: 900, q: 72 });

	return (
		<BookingClient
			planId={planId}
			title={title}
			description={service?.description ?? null}
			priceLabel={service?.priceLabel ?? null}
			cadence={service?.cadence ?? null}
			recurring={service?.recurring ?? false}
			image={image}
			slots={defaultSlots()}
			referral={ref ?? null}
			success={status === "success"}
		/>
	);
}
