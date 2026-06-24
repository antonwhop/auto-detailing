import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Shine — car detailing on Whop",
	description: "Stand up a mobile car-detailing business end-to-end on Whop.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
