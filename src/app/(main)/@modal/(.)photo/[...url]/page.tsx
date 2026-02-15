"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function PhotoModal({
	params,
}: {
	params: Promise<{ url: string[] }>;
}) {
	const router = useRouter();
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (!dialogRef.current?.open) {
			dialogRef.current?.showModal();
		}
	}, []);

	function onDismiss() {
		router.back();
	}

	return createPortal(
		<dialog
			ref={dialogRef}
			className="bg-transparent p-0 m-0 backdrop:bg-black/80 w-screen h-screen max-w-none max-h-none fixed inset-0 z-50 flex items-center justify-center outline-none"
			onClick={onDismiss}
			onClose={onDismiss}
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center pointer-events-none"
			>
				{/* Content wrapper with pointer events enabled */}
				<div className="pointer-events-auto relative">
					<PhotoContent params={params} />
					<button
						onClick={onDismiss}
						className="absolute -top-12 -right-12 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-6 h-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 18 18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			</div>
		</dialog>,
		document.getElementById("modal-root") || document.body,
	);
}

function PhotoContent({ params }: { params: Promise<{ url: string[] }> }) {
	const { url } = use(params);
	console.log("PhotoModal params:", url);

	// Handle both encoded (single segment) and split (multi-segment) cases
	// Next.js might decode the slash and split the params, or keep it encoded
	let decodedUrl: string;

	try {
		if (url.length === 1 && url[0].includes("%")) {
			// Likely fully encoded
			decodedUrl = decodeURIComponent(url[0]);
		} else {
			// Likely split by slashes
			// reconstruct: https: + "" + domain + path...
			// But simple join("/") often works if segments are clean
			// However, https:// becomes https:/ via join.

			// If the first segment is "https:" and second is "", join("/") gives "https://".
			// Let's just join and see, but usually standard join("/") works for split paths
			// EXCEPT for the protocol double slash if it was split into ["https:", "", "domain"...]
			// But Next.js catch-all usually swallows empty segments or handles them?

			// Let's decode each segment just in case
			const decodedSegments = url.map((segment) => decodeURIComponent(segment));
			decodedUrl = decodedSegments.join("/");

			// Fix protocol double slash if needed (e.g. https:/example.com -> https://example.com)
			// Also handles http:/
			decodedUrl = decodedUrl.replace(/^(https?):\/(?!\/)/, "$1://");
		}
		console.log("Decoded URL:", decodedUrl);
	} catch (e) {
		console.error("Error decoding URL:", e);
		decodedUrl = "";
	}

	return (
		<img
			src={decodedUrl}
			alt="Full size"
			className="max-w-[90vw] max-h-[90vh] object-contain"
		/>
	);
}
