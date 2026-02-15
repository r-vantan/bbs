"use client";

import { useEffect, useRef, useState } from "react";

export default function ResizableLayout({
	timeline,
	detail,
}: {
	timeline: React.ReactNode;
	detail: React.ReactNode;
}) {
	const [timelineWidth, setTimelineWidth] = useState(35); // Initial width percentage
	const [isResizing, setIsResizing] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isResizing || !containerRef.current) return;

			const containerRect = containerRef.current.getBoundingClientRect();
			const newWidth =
				((e.clientX - containerRect.left) / containerRect.width) * 100;

			// Min/Max constraints
			// Assuming min width around 300px and total width varries
			// Let's constrain between 20% and 60% for safety on most screens
			if (newWidth >= 20 && newWidth <= 60) {
				setTimelineWidth(newWidth);
			}
		};

		const handleMouseUp = () => {
			setIsResizing(false);
			document.body.style.cursor = "default";
			document.body.style.userSelect = "auto";
		};

		if (isResizing) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none"; // Prevent text selection while dragging
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isResizing]);

	return (
		<div ref={containerRef} className="flex-1 flex overflow-hidden w-full">
			{/* Timeline Section */}
			<div
				style={{ width: `${timelineWidth}%` }}
				className="flex-shrink-0 min-w-[300px] overflow-y-auto border-r border-zinc-200 dark:border-zinc-800"
			>
				{timeline}
			</div>

			{/* Resizer Handle */}
			<div
				className="w-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-500 cursor-col-resize flex items-center justify-center transition-colors group z-10"
				onMouseDown={() => setIsResizing(true)}
			>
				<div className="w-[2px] h-8 bg-zinc-300 dark:bg-zinc-600 rounded-full group-hover:bg-white" />
			</div>

			{/* Detail Section */}
			<div className="flex-1 min-w-[400px] overflow-y-auto bg-zinc-50 dark:bg-zinc-900/30">
				{detail}
			</div>
		</div>
	);
}
