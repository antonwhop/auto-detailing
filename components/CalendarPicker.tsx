"use client";

import { useMemo, useState } from "react";
import styles from "./CalendarPicker.module.css";

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

/** Local YYYY-MM-DD key for a date (used to group/compare days). */
function dayKey(d: Date): string {
	return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function fmtTime(d: Date): string {
	return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export type CalendarPickerProps = {
	/** Available slots as ISO datetime strings. */
	slots: string[];
	/** Currently selected slot (ISO string), or "" if none. */
	value: string;
	/** Called with the ISO string of the newly selected slot. */
	onChange: (iso: string) => void;
};

/**
 * A self-contained calendar date+time picker. Renders a month grid where only
 * days that have available slots are selectable; picking a day reveals its
 * time slots. Fully styled via a CSS module so it can be dropped in anywhere.
 */
export function CalendarPicker({ slots, value, onChange }: CalendarPickerProps) {
	// Group available slots by local day.
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

	const selectedDate = value ? new Date(value) : null;
	const firstSlotDate = slots.length ? new Date(slots[0]) : new Date();

	// The month currently shown in the grid.
	const [viewMonth, setViewMonth] = useState(() => {
		const base = selectedDate ?? firstSlotDate;
		return new Date(base.getFullYear(), base.getMonth(), 1);
	});

	const selectedDayKey = selectedDate ? dayKey(selectedDate) : null;

	// Which day's times are expanded below the grid.
	const [openDayKey, setOpenDayKey] = useState<string | null>(selectedDayKey);

	const year = viewMonth.getFullYear();
	const month = viewMonth.getMonth();
	const firstWeekday = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const todayKey = dayKey(new Date());

	// Build the grid cells (leading blanks + each day of month).
	const cells: (number | null)[] = [];
	for (let i = 0; i < firstWeekday; i++) cells.push(null);
	for (let d = 1; d <= daysInMonth; d++) cells.push(d);

	// Limit navigation to months that actually contain slots.
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

	const goMonth = (offset: number) =>
		setViewMonth(new Date(year, month + offset, 1));

	const openTimes = openDayKey ? slotsByDay.get(openDayKey) : undefined;

	return (
		<div className={styles.picker}>
			<div className={styles.header}>
				<span className={styles.month}>
					{MONTHS[month]} {year}
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
						{w.slice(0, 2)}
					</div>
				))}
			</div>

			<div className={styles.days}>
				{cells.map((d, i) => {
					if (d === null) return <div key={`b${i}`} />;
					const date = new Date(year, month, d);
					const key = dayKey(date);
					const hasSlots = slotsByDay.has(key);
					const isSelected = key === selectedDayKey;
					const isToday = key === todayKey;
					const cls = [
						styles.day,
						hasSlots ? styles.dayAvailable : styles.dayDisabled,
						isToday ? styles.dayToday : "",
						isSelected ? styles.daySelected : "",
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
							aria-pressed={isSelected}
						>
							{d}
							{hasSlots && <span className={styles.dot} />}
						</button>
					);
				})}
			</div>

			<div className={styles.times}>
				{openTimes && openTimes.length > 0 ? (
					<>
						<div className={styles.timesLabel}>
							{openTimes[0].date.toLocaleDateString([], {
								weekday: "long",
								month: "long",
								day: "numeric",
							})}
						</div>
						<div className={styles.timeGrid}>
							{openTimes.map(({ iso, date }) => (
								<button
									key={iso}
									type="button"
									className={`${styles.time} ${
										iso === value ? styles.timeSelected : ""
									}`}
									onClick={() => onChange(iso)}
								>
									{fmtTime(date)}
								</button>
							))}
						</div>
					</>
				) : (
					<div className={styles.empty}>
						Select a highlighted day to see available times.
					</div>
				)}
			</div>
		</div>
	);
}
