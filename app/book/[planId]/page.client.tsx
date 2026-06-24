"use client";

import { WhopCheckoutEmbed } from "@whop/checkout/react";
import Link from "next/link";
import { useEffect, useState } from "react";

function fmtSlot(iso: string): string {
	const d = new Date(iso);
	return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export function BookingClient({
	planId,
	title,
	priceLabel,
	cadence,
	recurring,
	slots,
	referral,
	success,
}: {
	planId: string;
	title: string;
	priceLabel: string | null;
	cadence: string | null;
	recurring: boolean;
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
		<div className="wrap" style={{ maxWidth: 520 }}>
			<header className="hero">
				<Link href="/" className="muted">
					← All services
				</Link>
				<h1 style={{ marginTop: 10 }}>{title}</h1>
				<p>
					{priceLabel ? <strong>{priceLabel}</strong> : null}
					{priceLabel && cadence ? ` · ${cadence}` : cadence}
					{" · we come to you"}
				</p>
			</header>

			{success && (
				<div className="alert ok">Payment received — see you at your appointment! 🎉</div>
			)}

			<section className="card">
				{!sessionId ? (
					<>
						{referral && (
							<div className="alert ok">
								Referral <span className="pill">{referral}</span> applied.
							</div>
						)}
						<label>Pick a time</label>
						{slots.length > 0 ? (
							<select value={slot} onChange={(e) => setSlot(e.target.value)}>
								{slots.map((iso) => (
									<option key={iso} value={iso}>
										{fmtSlot(iso)}
									</option>
								))}
							</select>
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
							<p className="muted" style={{ marginTop: 8 }}>
								This is a monthly membership — your first visit is scheduled above and
								you’ll be billed each month.
							</p>
						)}
						<button disabled={busy || !slot} onClick={start}>
							{busy ? "Loading…" : "Continue to payment"}
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
							{slot && <p className="muted">Appointment: {fmtSlot(slot)}</p>}
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
						</>
					)
				)}
			</section>
		</div>
	);
}
