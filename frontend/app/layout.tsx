import type { Metadata } from "next";
import { ToastContainer } from 'react-toastify';
import "./globals.css";

export const metadata: Metadata =
{
	title: {
		default:  "A Two Store",
		template: "%s | A Two Store",
	},
	description:     "A powerful order and logistics management platform built for Moroccan sellers. Track shipments, manage DigyLog orders, and grow your store — all in one place.",
	applicationName: "A Two Store",
	authors:         [{ name: "youbella" }],
	keywords:        ["A Two Store", "DigyLog", "shipping", "delivery", "order management", "logistics", "Morocco", "e-commerce", "seller dashboard"],
	icons:
	{
		icon:     "/logo_A2Store.png",
		shortcut: "/logo_A2Store.png",
		apple:    "/logo_A2Store.png",
	},
	openGraph:
	{
		title:       "A Two Store — Order & Logistics Management",
		description: "Track shipments, manage DigyLog orders, and grow your store — all in one place.",
		siteName:    "A Two Store",
		locale:      "en_US",
		type:        "website",
	},
	twitter:
	{
		card:        "summary",
		title:       "A Two Store — Order & Logistics Management",
		description: "Track shipments, manage DigyLog orders, and grow your store — all in one place.",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="h-full antialiased">
			<body>
				{children}
				<ToastContainer />
			</body>
		</html>
	);
}
