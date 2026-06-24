import { fail, ok } from "@/lib/http";
import { generateIdeas } from "@/lib/ideas";

// Slide: POST /ideas. Simple local generator (Claude when configured, else static).
export async function POST(req: Request) {
	try {
		const { idea } = (await req.json()) as { idea?: string };
		if (!idea) return fail("Describe your business idea", 400);
		const result = await generateIdeas(idea);
		return ok(result);
	} catch (e) {
		return fail(e);
	}
}
