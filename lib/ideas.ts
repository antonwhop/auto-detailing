import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env";

// Whop has no POST /ideas endpoint, so this is a simple local generator. When an
// Anthropic key is present it uses Claude to draft a real plan; otherwise it
// falls back to a deterministic template.

export type Ideas = {
	source: "claude" | "static";
	supplies: string[];
	plan: string;
	whopResources: { title: string; why: string }[];
};

const SYSTEM = `You are a startup advisor for someone launching a small local service business.
Return STRICT JSON only (no markdown fences) matching:
{
  "supplies": string[],            // 6-10 concrete supplies/tools to buy to get started
  "plan": string,                  // a concise business plan, 4-6 short paragraphs, plain text
  "whopResources": [{"title": string, "why": string}]  // 3-5 Whop features (products, plans, checkout, invoices, payouts/transfers, affiliates) and why they help
}`;

async function viaClaude(idea: string): Promise<Ideas> {
	const client = new Anthropic({ apiKey: env.anthropicApiKey });
	const msg = await client.messages.create({
		model: env.anthropicModel,
		max_tokens: 1800,
		system: SYSTEM,
		messages: [{ role: "user", content: `Business idea: ${idea}` }],
	});
	const text = msg.content
		.filter((b): b is Anthropic.TextBlock => b.type === "text")
		.map((b) => b.text)
		.join("")
		.trim();
	const json = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
	const parsed = JSON.parse(json) as Omit<Ideas, "source">;
	return { source: "claude", ...parsed };
}

function staticIdeas(idea: string): Ideas {
	return {
		source: "static",
		supplies: [
			"Pressure washer + portable water tank",
			"Dual-action polisher and pads",
			"Wash mitts, microfiber towels, drying towels",
			"Car shampoo, iron remover, tar remover",
			"Interior brushes, steam cleaner, vacuum",
			"Ceramic spray sealant / wax",
			"Trim & tire dressing",
			"Folding table, bins, and a branded canopy for on-site jobs",
		],
		plan: [
			`Concept: ${idea}. Start as a solo, mobile operation that travels to customers, keeping overhead near zero.`,
			"Offer 3 packages: Express (exterior wash + tire shine), Full Detail (interior + exterior), and Premium (full + ceramic sealant). Price for your local market and book by appointment.",
			"Acquisition: post before/after photos locally, run a small launch ad, and offer a referral discount so happy customers bring their neighbors.",
			"Operations: take bookings online with a fixed weekly availability, collect payment up front at checkout, and send an invoice for any add-ons discovered on site.",
			"Growth: once demand is steady, hire friends as detailers, add their availability to the calendar, and run weekly payroll. Pitch local businesses a flat employee rate for recurring volume.",
		].join("\n\n"),
		whopResources: [
			{ title: "Products + Plans", why: "Define each detailing package and its price as a one-time plan with a hosted checkout." },
			{ title: "Embedded Checkout", why: "Take payment up front inside your own booking page." },
			{ title: "Invoices", why: "Charge customers for add-ons (extra seats, heavy soiling) after the appointment." },
			{ title: "Payouts & Transfers", why: "See your balance, withdraw earnings, and run payroll to the friends you hire." },
			{ title: "Affiliates / Referrals", why: "Give customers a referral code that credits them when they bring new business." },
		],
	};
}

export async function generateIdeas(idea: string): Promise<Ideas> {
	if (env.anthropicApiKey) {
		try {
			return await viaClaude(idea);
		} catch {
			// fall through to the static template on any error
		}
	}
	return staticIdeas(idea);
}
