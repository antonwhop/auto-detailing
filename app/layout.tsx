import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Shine — Mobile Car Detailing",
	description:
		"Showroom shine, parked in your driveway. Premium mobile car detailing that comes to you — book a service, pick a time, and pay online.",
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
