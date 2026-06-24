import Whop from "@whop/sdk";
import { env } from "./env";

// Lazily constructed so a missing API key surfaces on the first real request
// rather than at module import / build time.
let client: Whop | null = null;

export function whop(): Whop {
	if (!client) {
		client = new Whop({ apiKey: env.whopApiKey });
	}
	return client;
}
