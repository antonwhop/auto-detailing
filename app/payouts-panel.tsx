"use client";

import {
	BalanceElement,
	Elements,
	PayoutsSession,
	StatusBannerElement,
	WithdrawalsElement,
	WithdrawButtonElement,
} from "@whop/embedded-components-react-js";
import { loadWhopElements } from "@whop/embedded-components-vanilla-js";
import { useEffect, useState } from "react";

// Real Whop embedded components for the business's balance + withdrawals. They are
// browser-only, so we load them lazily and only render after mount to avoid SSR
// touching `window`.
export function PayoutsPanel({ companyId }: { companyId: string }) {
	const [mounted, setMounted] = useState(false);
	const [elements] = useState(() =>
		typeof window !== "undefined" ? loadWhopElements() : null,
	);

	useEffect(() => setMounted(true), []);

	if (!mounted || !elements) {
		return <p className="muted">Loading balance…</p>;
	}

	return (
		<Elements elements={elements}>
			<PayoutsSession
				token={() =>
					fetch(`/api/token?companyId=${encodeURIComponent(companyId)}`)
						.then((r) => r.json())
						.then((d) => d.token)
				}
				companyId={companyId}
				currency="usd"
				redirectUrl={`${window.location.origin}/`}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					<div style={{ minHeight: 96, position: "relative" }}>
						<BalanceElement fallback={<p className="muted">Loading balance…</p>} />
					</div>
					<div style={{ position: "relative" }}>
						<StatusBannerElement fallback={<span />} />
					</div>
					<div style={{ height: 40, position: "relative" }}>
						<WithdrawButtonElement
							options={{ variant: "soft" }}
							fallback={<p className="muted">Loading…</p>}
						/>
					</div>
					<div style={{ position: "relative" }}>
						<WithdrawalsElement fallback={<span />} />
					</div>
				</div>
			</PayoutsSession>
		</Elements>
	);
}
