"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
}

export default function Modal({
	isOpen,
	onClose,
	title,
	children,
}: ModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (isOpen) {
			if (!dialog.open) {
				dialog.showModal();
			}
		} else {
			if (dialog.open) {
				dialog.close();
			}
		}
	}, [isOpen]);

	// Close on click outside
	const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
		if (e.target === dialogRef.current) {
			onClose();
		}
	};

	return (
		<dialog
			ref={dialogRef}
			className="fixed inset-0 z-50 m-auto backdrop:bg-black/50 backdrop:backdrop-blur-sm open:animate-fade-in w-full max-w-lg rounded-2xl shadow-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 p-0"
			onClick={handleBackdropClick}
			onClose={onClose}
		>
			<div className="flex flex-col max-h-[90vh]">
				<div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
					{title && <h2 className="text-lg font-bold">{title}</h2>}
					<button
						onClick={onClose}
						className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
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
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<div className="p-4 overflow-y-auto">{children}</div>
			</div>
		</dialog>
	);
}
