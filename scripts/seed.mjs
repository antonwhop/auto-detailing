// One-off seed: creates the canonical product + two plans (one-time + monthly)
// for the car-detailing business. Run with WHOP_API_KEY + WHOP_COMPANY_ID set:
//
//   set -a; . ./.env.local; set +a; node scripts/seed.mjs
//
// Prints the IDs to put in WHOP_PRODUCT_ID.
import Whop from "@whop/sdk";

const apiKey = process.env.WHOP_API_KEY;
const company_id = process.env.WHOP_COMPANY_ID;
if (!apiKey || !company_id) {
	console.error("Set WHOP_API_KEY and WHOP_COMPANY_ID");
	process.exit(1);
}

const whop = new Whop({ apiKey });

const product = await whop.products.create({
	company_id,
	title: "Mobile Car Detailing",
	description: "Professional detailing that comes to you.",
});
console.log("PRODUCT", product.id);

const oneTime = await whop.plans.create({
	company_id,
	product_id: product.id,
	plan_type: "one_time",
	initial_price: 149,
	currency: "usd",
	title: "Full Detail — one-time",
	visibility: "visible",
});
console.log("PLAN one_time", oneTime.id, oneTime.purchase_url);

const monthly = await whop.plans.create({
	company_id,
	product_id: product.id,
	plan_type: "renewal",
	initial_price: 99,
	renewal_price: 99,
	billing_period: 30,
	currency: "usd",
	title: "Detailing Membership — monthly",
	visibility: "visible",
});
console.log("PLAN renewal", monthly.id, monthly.purchase_url);

console.log("\nWHOP_PRODUCT_ID=" + product.id);
