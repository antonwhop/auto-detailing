import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Palo Alto Auto Spa — Mobile Car Detailing",
	description:
		"Locally owned mobile car detailing in Palo Alto, CA. We bring the studio to your driveway across the Peninsula — book a service, pick a time, and pay in person or online.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700;800&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}
