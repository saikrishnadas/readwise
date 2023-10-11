import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Readwise",
	description:
		"Readwise AI is a cutting-edge SAAS (Software as a Service) solution that seamlessly integrates document analysis and intelligent chatbot technology to revolutionize the way you interact with your PDF documents. With Readwise AI, you can effortlessly gain insights, answers, and summaries from your documents in a user-friendly and conversational manner.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="light">
			<body
				className={cn(
					"min-h-screen font-sans antialiased grainy",
					inter.className
				)}
			>
				{children}
			</body>
		</html>
	);
}