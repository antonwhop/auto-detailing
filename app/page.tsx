import Link from "next/link";
import { listServices } from "@/lib/catalog";
import { missingRequiredEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function Home() {
	const missing = missingRequiredEnv();
	let services: Awaited<ReturnType<typeof listServices>> = [];
	let error: string | null = null;

	if (missing.length === 0) {
		try {
			services = await listServices();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	return (
		<div className="wrap">
			<header className="hero">
				<h1>🚗 Shine Mobile Detailing</h1>
				<p>Showroom shine, parked in your driveway. Pick a service, choose a time, and pay — we come to you.</p>
			</header>

			{missing.length > 0 && (
				<div className="alert warn">
					This storefront isn’t configured yet (missing{" "}
					<strong>{missing.join(", ")}</strong>).
				</div>
			)}
			{error && <div className="alert err">{error}</div>}

			{missing.length === 0 && !error && services.length === 0 && (
				<div className="alert warn">No services are available right now.</div>
			)}

			<div className="grid">
				{services.map((s) => (
					<div key={s.id} className="service">
						<div className="service-body">
							<span className="badge">{s.cadence}</span>
							<h2>{s.title}</h2>
							{s.description && <p className="muted">{s.description}</p>}
						</div>
						<div className="service-foot">
							<span className="price">{s.priceLabel}</span>
							<Link className="cta" href={`/book/${s.id}`}>
								Schedule →
							</Link>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
