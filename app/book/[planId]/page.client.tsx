"use client";

import { WhopCheckoutEmbed } from "@whop/checkout/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookingScheduler } from "@/components/BookingScheduler";
import { Logo } from "@/components/Logo";

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
	description: string | null;
	priceLabel: string | null;
	cadence: string | null;
	recurring: boolean;
	image: string;
	slots: string[];
	referral: string | null;
	success: boolean;
}) {
	const [slot, setSlot] = useState("");
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [err, setErr] = useState<string | null>(null);
	const [done, setDone] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	async function start({
		slot: chosenSlot,
		location,
		email,
	}: {
		slot: string;
		location: string;
		email: string;
	}) {
		setSlot(chosenSlot);
		setBusy(true);
		setErr(null);
		try {
			const res = await fetch("/api/checkout", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ planId, ref: referral, slot: chosenSlot, location, email }),
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
					<Logo />
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

					{referral && !sessionId && (
						<div className="alert ok" style={{ marginBottom: 18 }}>
							Referral <span className="pill">{referral}</span> applied.
						</div>
					)}

					{!sessionId ? (
						slots.length > 0 ? (
							<BookingScheduler
								serviceTitle={title}
								priceLabel={priceLabel}
								cadence={cadence}
								recurring={recurring}
								slots={slots}
								busy={busy}
								error={err}
								onConfirm={start}
							/>
						) : (
							<p className="muted">No times available right now.</p>
						)
					) : done ? (
						<div className="card booking-pay">
							<div className="alert ok">
								Booked{slot ? ` for ${fmtSlot(slot)}` : ""}! 🎉 A receipt is on its way.
							</div>
						</div>
					) : (
						mounted && (
							<div className="card booking-pay">
								<h2>Complete your payment</h2>
								{slot && <div className="appointment-tag">🗓️ {fmtSlot(slot)}</div>}
								<div className="checkout-shell">
									<WhopCheckoutEmbed
										sessionId={sessionId}
										theme="system"
										returnUrl={
											window.location.origin.startsWith("https://")
												? `${window.location.origin}/book/${planId}?status=success`
												: undefined
										}
										onComplete={() => setDone(true)}
									/>
								</div>
							</div>
						)
					)}
				</div>
			</div>
		</>
	);
}
