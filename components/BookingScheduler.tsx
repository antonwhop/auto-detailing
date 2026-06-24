"use client";

import { useMemo, useState } from "react";
import styles from "./BookingScheduler.module.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function dayKey(d: Date): string {
	return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function fmtTime(d: Date, h24: boolean): string {
	return d.toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit",
		hour12: !h24,
	});
}

const TZ_LABEL = (() => {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	} catch {
		return "Local time";
	}
})();

function IconClock() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<circle cx="12" cy="12" r="9" />
			<path d="M12 7v5l3 2" />
		</svg>
	);
}

function IconPin() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
			<circle cx="12" cy="10" r="2.5" />
		</svg>
	);
}

function IconGlobe() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<circle cx="12" cy="12" r="9" />
			<path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
		</svg>
	);
}

type Step = "schedule" | "location" | "review";

export type BookingSchedulerProps = {
	serviceTitle: string;
	priceLabel: string | null;
	cadence: string | null;
	recurring: boolean;
	slots: string[];
	busy: boolean;
	error: string | null;
	onConfirm: (data: { slot: string; location: string; email: string }) => void;
};

export function BookingScheduler({
	serviceTitle,
	priceLabel,
	cadence,
	recurring,
	slots,
	busy,
	error,
	onConfirm,
}: BookingSchedulerProps) {
	const slotsByDay = useMemo(() => {
		const map = new Map<string, { iso: string; date: Date }[]>();
		for (const iso of slots) {
			const date = new Date(iso);
			if (Number.isNaN(date.getTime())) continue;
			const key = dayKey(date);
			const list = map.get(key) ?? [];
			list.push({ iso, date });
			map.set(key, list);
		}
		for (const list of map.values()) {
			list.sort((a, b) => a.date.getTime() - b.date.getTime());
		}
		return map;
	}, [slots]);

	const firstSlotDate = slots.length ? new Date(slots[0]) : new Date();

	const [step, setStep] = useState<Step>("schedule");
	const [openDayKey, setOpenDayKey] = useState<string | null>(null);
	const [slot, setSlot] = useState("");
	const [location, setLocation] = useState("");
	const [email, setEmail] = useState("");
	const [h24, setH24] = useState(false);

	const [viewMonth, setViewMonth] = useState(
		() => new Date(firstSlotDate.getFullYear(), firstSlotDate.getMonth(), 1),
	);

	const year = viewMonth.getFullYear();
	const month = viewMonth.getMonth();
	const firstWeekday = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const todayKey = dayKey(new Date());

	const cells: (number | null)[] = [];
	for (let i = 0; i < firstWeekday; i++) cells.push(null);
	for (let d = 1; d <= daysInMonth; d++) cells.push(d);

	const monthKeys = useMemo(() => {
		const set = new Set<string>();
		for (const iso of slots) {
			const d = new Date(iso);
			if (!Number.isNaN(d.getTime())) set.add(`${d.getFullYear()}-${d.getMonth()}`);
		}
		return set;
	}, [slots]);

	const canGo = (offset: number) => {
		const m = new Date(year, month + offset, 1);
		return monthKeys.has(`${m.getFullYear()}-${m.getMonth()}`);
	};

	const goMonth = (offset: number) => setViewMonth(new Date(year, month + offset, 1));

	const openTimes = openDayKey ? slotsByDay.get(openDayKey) : undefined;
	const selectedDate = slot ? new Date(slot) : null;

	const fmtFullDay = (d: Date) =>
		d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

	const avatarLetter = serviceTitle.trim().charAt(0).toUpperCase() || "S";

	const recap = selectedDate
		? `${fmtFullDay(selectedDate)} · ${fmtTime(selectedDate, h24)}`
		: null;

	const aside = (
		<aside className={styles.aside}>
			<div className={styles.avatar}>{avatarLetter}</div>
			<p className={styles.brand}>Shine Mobile Detailing</p>
			<h1 className={styles.title}>{serviceTitle}</h1>

			<div className={styles.metaRow}>
				<IconClock />
				<span>
					{priceLabel ?? "Mobile detail"}
					{cadence ? ` · ${cadence}` : ""}
				</span>
			</div>
			<div className={styles.metaRow}>
				<IconPin />
				<span>We come to you</span>
			</div>
			<div className={styles.metaRow}>
				<IconGlobe />
				<span className={styles.tzSelect}>{TZ_LABEL}</span>
			</div>

			{recap && (
				<div className={styles.recap}>
					<span className={styles.recapLabel}>Your appointment</span>
					<div className={styles.recapVal}>{recap}</div>
				</div>
			)}
		</aside>
	);

	if (step === "schedule") {
		return (
			<div className={`${styles.panel} ${openTimes ? styles.panelThree : ""}`}>
				{aside}

				<div className={styles.cal}>
					<div className={styles.calHead}>
						<span className={styles.month}>
							{MONTHS[month]} <span className={styles.year}>{year}</span>
						</span>
						<div className={styles.nav}>
							<button
								type="button"
								className={styles.navBtn}
								onClick={() => goMonth(-1)}
								disabled={!canGo(-1)}
								aria-label="Previous month"
							>
								‹
							</button>
							<button
								type="button"
								className={styles.navBtn}
								onClick={() => goMonth(1)}
								disabled={!canGo(1)}
								aria-label="Next month"
							>
								›
							</button>
						</div>
					</div>

					<div className={styles.weekdays}>
						{WEEKDAYS.map((w) => (
							<div key={w} className={styles.weekday}>
								{w}
							</div>
						))}
					</div>

					<div className={styles.days}>
						{cells.map((d, i) => {
							if (d === null) return <div key={`b${i}`} />;
							const date = new Date(year, month, d);
							const key = dayKey(date);
							const hasSlots = slotsByDay.has(key);
							const cls = [
								styles.day,
								hasSlots ? styles.dayAvailable : styles.dayDisabled,
								key === todayKey ? styles.dayToday : "",
								key === openDayKey ? styles.daySelected : "",
							]
								.filter(Boolean)
								.join(" ");
							return (
								<button
									key={key}
									type="button"
									className={cls}
									disabled={!hasSlots}
									onClick={() => setOpenDayKey(key)}
								>
									{d === 1 && <span className={styles.crossMonth}>{MONTHS[month].slice(0, 3)}</span>}
									{d}
								</button>
							);
						})}
					</div>
				</div>

				{openTimes && (
					<div className={styles.times}>
						<div className={styles.timesHead}>
							<span className={styles.timesDate}>
								{openTimes[0].date.toLocaleDateString([], { weekday: "short" })}
								<span className={styles.dim}>{openTimes[0].date.getDate()}</span>
							</span>
							<div className={styles.fmtToggle}>
								<button
									type="button"
									className={`${styles.fmtBtn} ${!h24 ? styles.fmtBtnActive : ""}`}
									onClick={() => setH24(false)}
								>
									12h
								</button>
								<button
									type="button"
									className={`${styles.fmtBtn} ${h24 ? styles.fmtBtnActive : ""}`}
									onClick={() => setH24(true)}
								>
									24h
								</button>
							</div>
						</div>
						<div className={styles.timeList}>
							{openTimes.map(({ iso, date }) => (
								<button
									key={iso}
									type="button"
									className={`${styles.time} ${iso === slot ? styles.timeSelected : ""}`}
									onClick={() => {
										setSlot(iso);
										setStep("location");
									}}
								>
									{fmtTime(date, h24)}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className={styles.panel}>
			{aside}

			<div className={styles.content}>
				{step === "location" && (
					<>
						<button type="button" className={styles.backRow} onClick={() => setStep("schedule")}>
							‹ Back
						</button>
						<h2 className={styles.stepLabel}>Where should we come?</h2>
						<p className={styles.fieldHelp}>
							Enter the address where you’d like your detail.
						</p>
						<label htmlFor="bs-location">Service address</label>
						<textarea
							id="bs-location"
							rows={3}
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							placeholder="123 University Ave, Palo Alto, CA — driveway, street parking, etc."
						/>
						<button
							type="button"
							className="btn btn-primary btn-block"
							style={{ marginTop: 18 }}
							disabled={!location.trim()}
							onClick={() => setStep("review")}
						>
							Review booking →
						</button>
					</>
				)}

				{step === "review" && (
					<>
						<button type="button" className={styles.backRow} onClick={() => setStep("location")}>
							‹ Back
						</button>
						<h2 className={styles.stepLabel}>Review &amp; confirm</h2>
						<div className={styles.summary}>
							<div className={styles.summaryRow}>
								<span className={styles.ic}>🧽</span>
								<div>
									<span className={styles.label}>Service</span>
									<div className={styles.val}>
										{serviceTitle}
										{priceLabel ? ` · ${priceLabel}` : ""}
									</div>
								</div>
							</div>
							<div className={styles.summaryRow}>
								<span className={styles.ic}>🗓️</span>
								<div>
									<span className={styles.label}>Date &amp; time</span>
									<div className={styles.val}>{recap ?? "—"}</div>
								</div>
							</div>
							<div className={styles.summaryRow}>
								<span className={styles.ic}>📍</span>
								<div>
									<span className={styles.label}>Location</span>
									<div className={styles.val}>{location || "—"}</div>
								</div>
							</div>
						</div>

						{recurring && (
							<p className={styles.fieldHelp} style={{ marginTop: 14 }}>
								Monthly membership — your first visit is scheduled above and you’ll be
								billed each month. Cancel anytime.
							</p>
						)}

						<label htmlFor="bs-email">Your email</label>
						<input
							id="bs-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
						/>

						<button
							type="button"
							className="btn btn-primary btn-block"
							style={{ marginTop: 18 }}
							disabled={busy || !slot || !email.trim()}
							onClick={() => onConfirm({ slot, location, email })}
						>
							{busy ? "Loading…" : "Continue to payment →"}
						</button>
						{error && <div className="alert err">{error}</div>}
					</>
				)}
			</div>
		</div>
	);
}
