import Link from "next/link";
import { Logo } from "@/components/Logo";
import { listServices } from "@/lib/catalog";
import { missingRequiredEnv } from "@/lib/env";
import { img, PHOTOS, serviceImage } from "@/lib/images";

const SERVICE_AREA = [
	"Palo Alto",
	"Menlo Park",
	"Stanford",
	"Los Altos",
	"Mountain View",
	"Atherton",
];

export const dynamic = "force-dynamic";

function SiteNav() {
	return (
		<nav className="nav">
			<div className="nav-inner">
				<Logo />
				<div className="nav-links">
					<a href="#services" className="nav-link">
						Services
					</a>
					<a href="#how" className="nav-link">
						How it works
					</a>
					<a href="#gallery" className="nav-link">
						Gallery
					</a>
					<a href="#reviews" className="nav-link">
						Reviews
					</a>
					<a href="#services" className="btn btn-primary">
						Book now
					</a>
				</div>
			</div>
		</nav>
	);
}

const STEPS = [
	{
		t: "Pick a service & time",
		d: "Choose the detail your car needs and grab an appointment slot that fits your week — all online, in under a minute.",
	},
	{
		t: "We come to you",
		d: "Our fully-equipped mobile unit rolls up to your home or office with its own water and power. You don't lift a finger.",
	},
	{
		t: "Drive away gleaming",
		d: "Pay securely online and hop into a car that looks, smells, and feels showroom-fresh. Satisfaction guaranteed.",
	},
];

const FEATURES = [
	{
		ic: "🚐",
		t: "We come to you",
		d: "Crescent Park driveway, a Sand Hill office lot, a Stanford apartment garage — we bring the whole studio to you.",
	},
	{
		ic: "🧴",
		t: "Pro-grade products",
		d: "pH-neutral foams, ceramic sealants, and microfiber only. Never a swirl mark.",
	},
	{
		ic: "💧",
		t: "Easy on the drought",
		d: "Our rinseless process uses a fraction of the water of a traditional wash — California-conscious by design.",
	},
	{
		ic: "🤝",
		t: "Locally owned",
		d: "A small Palo Alto crew you'll get to know by name — fully insured, and we treat your neighbors' cars like our own.",
	},
];

const REVIEWS = [
	{
		q: "Booked a full detail on my lunch break on California Ave and came out to a car that looked brand new. The interior smelled incredible. Worth every penny.",
		name: "Marcus T.",
		role: "Tesla Model 3 · Midtown",
		initials: "MT",
	},
	{
		q: "I'm on the monthly membership now. Same detailer every time, always on schedule, and my black paint has zero swirls. Can't recommend them enough.",
		name: "Priya S.",
		role: "BMW M340i · Old Palo Alto",
		initials: "PS",
	},
	{
		q: "They came to my office near Stanford, knocked out the SUV right in the parking lot, and I never had to leave my desk. This is how car care should work.",
		name: "Derek L.",
		role: "Audi Q5 · Menlo Park",
		initials: "DL",
	},
];

// Fallback bullets for plans that don't yet have metadata.features set in Whop.
function fallbackFeatures(recurring: boolean): string[] {
	return recurring
		? ["Recurring visits on your schedule", "Priority booking & same detailer", "Cancel anytime"]
		: ["Hand wash & wax", "Interior vacuum & wipe-down", "Wheels, tires & glass"];
}

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
		<>
			<SiteNav />

			{/* ----------------------- Hero ----------------------- */}
			<section className="hero-section">
				<div
					className="hero-bg"
					style={{ backgroundImage: `url(${img(PHOTOS.heroClean, { w: 1920, q: 72 })})` }}
				/>
				<div className="hero-content">
					<span className="local-badge">
						<span className="dot-live" />
						Now booking across the Peninsula
					</span>
					{/* <span className="eyebrow">Mobile car detailing · Palo Alto, CA</span> */}
					<h1>
						Get your Car Detailed <br /><span className="accent">In your Driveway.</span>
					</h1>
					<p className="hero-sub">
						Premium detailing that comes to you. Pick a service and choose a time. Pay in person or online. 
						Our mobile studio handles the rest while you carry on with your day.
					</p>
					<div className="hero-cta">
						<a href="#services" className="btn btn-primary">
							Book a detail →
						</a>
						<a href="#how" className="btn btn-ghost">
							How it works
						</a>
					</div>
					<div className="hero-stats">
						<div>
							<div className="stat-num">5,000+</div>
							<div className="stat-label">Cars detailed</div>
						</div>
						<div>
							<div className="stat-num">60 min</div>
							<div className="stat-label">Avg. turnaround</div>
						</div>
					</div>
				</div>
			</section>

			{/* ----------------------- Service-area bar ----------------------- */}
			<div className="area-bar">
				<div className="area-bar-inner">
					<span className="area-label">Proudly serving</span>
					<div className="area-list">
						{SERVICE_AREA.map((city) => (
							<span key={city}>{city}</span>
						))}
					</div>
				</div>
			</div>

			{/* ----------------------- Services ----------------------- */}
			<section className="section" id="services">
				<div className="container">
					<div className="section-head">
						<span className="eyebrow">Our packages</span>
						<h2>Detailing on your schedule</h2>
						<p>
							From a quick refresh to a full paint-correcting transformation — pick the
							package that fits, then lock in a time.
						</p>
					</div>

					{missing.length > 0 && (
						<div className="alert warn">
							This storefront isn’t connected yet (missing{" "}
							<strong>{missing.join(", ")}</strong>). Add your Whop credentials in
							<span className="pill">.env.local</span> and your live services will appear
							here automatically.
						</div>
					)}
					{error && <div className="alert err">{error}</div>}
					{missing.length === 0 && !error && services.length === 0 && (
						<div className="alert warn">
							No services are published right now — check back soon.
						</div>
					)}

					<div className="grid">
						{services.map((s, i) => (
							<div key={s.id} className="service">
								<div className="service-media">
									<span className="badge">{s.cadence}</span>
									<img
										src={img(serviceImage(s.title, i), { w: 700, q: 70 })}
										alt={s.title}
										loading="lazy"
									/>
								</div>
								<div className="service-body">
									<h3>{s.title}</h3>
									{s.description && <p className="desc">{s.description}</p>}
									<ul className="service-features">
										{(s.features.length > 0 ? s.features : fallbackFeatures(s.recurring)).map((f) => (
											<li key={f}>{f}</li>
										))}
									</ul>
								</div>
								<div className="service-foot">
									<div className="price">
										${s.price}
										<span className="per">{s.recurring ? "/mo" : " one-time"}</span>
									</div>
									<Link className="btn btn-primary" href={`/book/${s.id}`}>
										Schedule →
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ----------------------- How it works ----------------------- */}
			<section className="section section-alt" id="how">
				<div className="container">
					<div className="section-head center">
						<span className="eyebrow">How it works</span>
						<h2>Three steps to a spotless car</h2>
					</div>
					<div className="steps">
						{STEPS.map((s, i) => (
							<div className="step" key={s.t}>
								<div className="step-num">{i + 1}</div>
								<h3>{s.t}</h3>
								<p>{s.d}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ----------------------- Why us ----------------------- */}
			<section className="section">
				<div className="container">
					<div className="section-head">
						<span className="eyebrow">Why Palo Alto Auto Spa</span>
						<h2>The careful kind of clean</h2>
						<p>
							We treat every vehicle like it’s about to roll across a concours lawn —
							because around here, the details are the whole point.
						</p>
					</div>
					<div className="feat-grid">
						{FEATURES.map((f) => (
							<div className="feat" key={f.t}>
								<div className="ic">{f.ic}</div>
								<h3>{f.t}</h3>
								<p>{f.d}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ----------------------- Gallery ----------------------- */}
			<section className="section section-alt" id="gallery">
				<div className="container">
					<div className="section-head">
						<span className="eyebrow">The results</span>
						<h2>Recent work from the studio</h2>
					</div>
					<div className="gallery">
						<a className="wide tall" href="#services">
							<img src={img(PHOTOS.foamWash, { w: 900, q: 70 })} alt="Snow-foam exterior wash" loading="lazy" />
						</a>
						<a href="#services">
							<img src={img(PHOTOS.interior, { w: 600, q: 70 })} alt="Interior detailing" loading="lazy" />
						</a>
						<a href="#services">
							<img src={img(PHOTOS.brush, { w: 600, q: 70 })} alt="Detail brush work" loading="lazy" />
						</a>
						<a className="wide" href="#services">
							<img src={img(PHOTOS.waterSpray, { w: 900, q: 70 })} alt="High-pressure rinse" loading="lazy" />
						</a>
						<a href="#services">
							<img src={img(PHOTOS.glossyPorsche, { w: 600, q: 70 })} alt="Mirror-gloss paint finish" loading="lazy" />
						</a>
						<a href="#services">
							<img src={img(PHOTOS.cleanSedan, { w: 600, q: 70 })} alt="Finished, gleaming sedan" loading="lazy" />
						</a>
					</div>
				</div>
			</section>

			{/* ----------------------- Reviews ----------------------- */}
			<section className="section" id="reviews">
				<div className="container">
					<div className="section-head center">
						<span className="eyebrow">Loved by drivers</span>
						<h2>Don’t take our word for it</h2>
					</div>
					<div className="reviews">
						{REVIEWS.map((r) => (
							<div className="review" key={r.name}>
								<div className="stars">★★★★★</div>
								<p>“{r.q}”</p>
								<div className="who">
									<div className="avatar">{r.initials}</div>
									<div>
										<div className="name">{r.name}</div>
										<div className="role">{r.role}</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ----------------------- CTA band ----------------------- */}
			<section className="section" style={{ paddingTop: 0 }}>
				<div className="container">
					<div className="cta-band">
						<div className="cta-band-inner">
							<div>
								<h2>Ready to fall back in love with your car?</h2>
								<p>Book in under a minute. We’ll bring the studio to your Palo Alto driveway.</p>
							</div>
							<a href="#services" className="btn btn-primary">
								Book a detail →
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* ----------------------- Footer ----------------------- */}
			<footer className="footer">
				<div className="container">
					<div className="footer-grid">
						<div>
							<Logo />
							<p>
								Locally owned mobile car detailing, born in Palo Alto. We bring the studio
								to your driveway — water, power, and a perfectionist’s eye included.
							</p>
						</div>
						<div>
							<h4>Company</h4>
							<ul>
								<li>
									<a href="#services">Services</a>
								</li>
								<li>
									<a href="#how">How it works</a>
								</li>
								<li>
									<a href="#gallery">Gallery</a>
								</li>
								<li>
									<a href="#reviews">Reviews</a>
								</li>
							</ul>
						</div>
						<div>
							<h4>Get in touch</h4>
							<ul>
								<li>hello@paloaltoautospa.com</li>
								<li>(650) 530-0199</li>
								<li>Mon–Sat · 8am–6pm</li>
								<li>Palo Alto &amp; the Peninsula</li>
							</ul>
						</div>
					</div>
					<div className="footer-bottom">
						<span>© {new Date().getFullYear()} Palo Alto Auto Spa · Locally owned</span>
						<span>Booking & payments powered by Whop</span>
					</div>
				</div>
			</footer>
		</>
	);
}
