"use client";

import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { useEffect, useState } from "react";

function fmtSlot(iso: string): string {
	const d = new Date(iso);
	return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export function BookingClient({
	planId,
	planTitle,
	price,
	slots,
	referral,
	success,
}: {
	planId: string;
	planTitle: string;
	price: number | null;
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
				<h1>Book: {planTitle}</h1>
				<p>{price != null ? `$${price} · we come to you` : "We come to you"}</p>
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
							<p className="muted">No times published yet — contact the business.</p>
						)}
						<label>Your email</label>
						<input value={email} onChange={(e) => setEmail(e.target.value)} />
						<button disabled={busy} onClick={start}>
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
							{slot && (
								<p className="muted">Appointment: {fmtSlot(slot)}</p>
							)}
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
