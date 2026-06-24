"use client";

import { WhopCheckoutEmbed } from "@whop/checkout/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarPicker } from "@/components/CalendarPicker";

function fmtSlot(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

const PERKS = [
	{ ic: "🚐", t: "We come to you", d: "Home, office, anywhere — our mobile unit is fully self-contained." },
	{ ic: "🧴", t: "Pro-grade products", d: "Swirl-free wash, premium sealants, microfiber finish." },
	{ ic: "🛡️", t: "Insured & guaranteed", d: "Background-checked detailers and a satisfaction guarantee." },
];

export function BookingClient({
	planId,
	title,
	description,
	priceLabel,
	cadence,
	recurring,
	image,
	slots,
	referral,
	success,
}: {
	planId: string;
	title: string;
	description: string | null;
	priceLabel: string | null;
	cadence: string | null;
	recurring: boolean;
	image: string;
	slots: string[];
	referral: string | null;
	success: boolean;
}) {
	const [slot, setSlot] = useState(slots[0] ?? "");
	const [email, setEmail] = useState("");
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [err, setErr] = useState<string | null>(null);
	const [done, setDone] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	async function start() {
		setBusy(true);
		setErr(null);
		try {
			const res = await fetch("/api/checkout", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ planId, ref: referral, slot, email }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error ?? "Could not start checkout");
			setSessionId(data.sessionId);
		} catch (e) {
			setErr(e instanceof Error ? e.message : String(e));
		} finally {
			setBusy(false);
		}
	}

	return (
		<>
			<nav className="nav">
				<div className="nav-inner">
					<Link href="/" className="brand">
						<span className="brand-mark">✦</span>
						Shine
					</Link>
					<div className="nav-links">
						<Link href="/#services" className="nav-link">
							Services
						</Link>
						<Link href="/#gallery" className="nav-link">
							Gallery
						</Link>
					</div>
				</div>
			</nav>

			<div className="booking">
				<div className="container">
					<Link href="/#services" className="back-link">
						← All services
					</Link>

					{success && (
						<div className="alert ok" style={{ marginBottom: 24 }}>
							Payment received — see you at your appointment! 🎉
						</div>
					)}

					<div className="booking-grid">
						{/* Left: the pitch */}
						<div>
							<div className="booking-hero">
								<img src={image} alt={title} />
								<div className="overlay">
									<span className="eyebrow">Mobile detailing</span>
									<h1>{title}</h1>
									<div className="price-row">
										{priceLabel && <span className="price">{priceLabel}</span>}
										{cadence && <span className="muted">{cadence} · we come to you</span>}
									</div>
								</div>
							</div>

							{description && (
								<p className="muted" style={{ marginTop: 20, fontSize: 15 }}>
									{description}
								</p>
							)}

							<div className="booking-perks">
								{PERKS.map((p) => (
									<div className="perk" key={p.t}>
										<span className="ic">{p.ic}</span>
										<div>
											<strong>{p.t}</strong>
											<span>{p.d}</span>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Right: the booking flow */}
						<div className="card">
							{!sessionId ? (
								<>
									<h2>Book your appointment</h2>
									<p className="sub">Choose a time and we’ll handle the rest.</p>

									{referral && (
										<div className="alert ok">
											Referral <span className="pill">{referral}</span> applied.
										</div>
									)}

									<label>Pick a time</label>
									{slots.length > 0 ? (
										<CalendarPicker slots={slots} value={slot} onChange={setSlot} />
									) : (
										<p className="muted">No times available right now.</p>
									)}

									<label>Your email</label>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@example.com"
									/>

									{recurring && (
										<p className="muted" style={{ marginTop: 12, fontSize: 13.5 }}>
											This is a monthly membership — your first visit is scheduled above
											and you’ll be billed each month. Cancel anytime.
										</p>
									)}

									<button
										className="btn btn-primary btn-block"
										style={{ marginTop: 18 }}
										disabled={busy || !slot}
										onClick={start}
									>
										{busy ? "Loading…" : "Continue to payment →"}
									</button>
									{err && <div className="alert err">{err}</div>}
								</>
							) : done ? (
								<div className="alert ok">
									Booked{slot ? ` for ${fmtSlot(slot)}` : ""}! 🎉 A receipt is on its way.
								</div>
							) : (
								mounted && (
									<>
										<h2>Complete your payment</h2>
										{slot && <div className="appointment-tag">🗓️ {fmtSlot(slot)}</div>}
										<div className="checkout-shell">
											<WhopCheckoutEmbed
												sessionId={sessionId}
												theme="light"
												returnUrl={
													window.location.origin.startsWith("https://")
														? `${window.location.origin}/book/${planId}?status=success`
														: undefined
												}
												onComplete={() => setDone(true)}
											/>
										</div>
									</>
								)
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
