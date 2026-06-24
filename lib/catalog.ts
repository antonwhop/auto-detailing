import { env } from "./env";
import { whop } from "./whop";

// Reads the bookable services straight from Whop (durable), so the storefront
// works regardless of any local/ephemeral state.

export type Service = {
	id: string;
	title: string;
	description: string | null;
	recurring: boolean;
	price: number;
	priceLabel: string;
	cadence: string;
	features: string[];
};

// Feature bullets are stored on each Whop plan under metadata.features as a
// JSON-encoded string array. Parse defensively — bad/missing data yields [].
function parseFeatures(metadata: { [key: string]: unknown } | null): string[] {
	const raw = metadata?.features;
	if (Array.isArray(raw)) return raw.filter((f): f is string => typeof f === "string");
	if (typeof raw === "string") {
		try {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) {
				return parsed.filter((f): f is string => typeof f === "string");
			}
		} catch {
			// not JSON — fall through
		}
	}
	return [];
}

function toService(p: {
	id: string;
	title: string | null;
	description: string | null;
	plan_type: string;
	initial_price: number;
	renewal_price: number;
	billing_period: number | null;
	metadata: { [key: string]: unknown } | null;
}): Service {
	const recurring = p.plan_type === "renewal";
	const price = recurring ? p.renewal_price : p.initial_price;
	const period = p.billing_period ?? 30;
	const cadence = recurring
		? period === 30
			? "per month"
			: `every ${period} days`
		: "one-time";
	return {
		id: p.id,
		title: p.title ?? "Detailing service",
		description: p.description,
		recurring,
		price,
		priceLabel: recurring ? `$${price}/mo` : `$${price}`,
		cadence,
		features: parseFeatures(p.metadata),
	};
}

export async function listServices(): Promise<Service[]> {
	const query: Parameters<ReturnType<typeof whop>["plans"]["list"]>[0] = {
		company_id: env.whopCompanyId,
		visibilities: ["visible"],
	};
	if (env.whopProductId) query.product_ids = [env.whopProductId];

	const page = await whop().plans.list(query);
	const services: Service[] = [];
	for await (const plan of page) {
		// biome-ignore lint/suspicious/noExplicitAny: SDK list item shape
		services.push(toService(plan as any));
	}
	// Cheapest / one-time first for a sensible default order.
	return services.sort((a, b) => Number(a.recurring) - Number(b.recurring));
}

export async function getService(planId: string): Promise<Service | null> {
	try {
		const plan = await whop().plans.retrieve(planId);
		// biome-ignore lint/suspicious/noExplicitAny: SDK plan shape
		return toService(plan as any);
	} catch {
		return null;
	}
}
