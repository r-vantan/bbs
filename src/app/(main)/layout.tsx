import { Suspense } from "react";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import ResizableLayout from "@/components/ResizableLayout";

export default function MainLayout({
	children,
	timeline,
	detail,
	modal,
}: Readonly<{
	children: React.ReactNode;
	timeline: React.ReactNode;
	detail: React.ReactNode;
	modal: React.ReactNode;
}>) {
	return (
		<div className="h-screen w-screen overflow-hidden flex">
			<Navbar />
			<main className="flex-1 flex flex-col h-full overflow-hidden relative">
				<Header />
				<ResizableLayout timeline={timeline} detail={detail} />
				{modal}
			</main>
			{/* Hidden children to satisfy Next.js layout requirements if slots handle all visible content */}
			<div className="hidden">{children}</div>
		</div>
	);
}
