"use client";

import { EllipsisHorizontalIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { deletePost } from "@/app/actions";
import { authClient } from "@/lib/auth-client";
import Modal from "./Modal";

export default function PostMenu({
	postId,
	authorId,
}: {
	postId: number;
	authorId: string;
}) {
	const { data: session } = authClient.useSession();
	const [isOpen, setIsOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	if (!session || session.user.id !== authorId) {
		return null;
	}

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deletePost(postId, session.user.id);
		} catch (error) {
			console.error(error);
		} finally {
			setIsDeleting(false);
			setIsModalOpen(false);
			setIsOpen(false);
		}
	};

	return (
		<>
			<div className="relative" ref={menuRef}>
				<button
					onClick={(e) => {
						e.stopPropagation();
						setIsOpen(!isOpen);
					}}
					className="p-1 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
				>
					<EllipsisHorizontalIcon className="w-5 h-5" />
				</button>

				{isOpen && (
					<div
						onClick={(e) => e.stopPropagation()}
						className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-50 overflow-hidden"
					>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setIsModalOpen(true);
								setIsOpen(false);
							}}
							className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors disabled:opacity-50"
						>
							<TrashIcon className="w-4 h-4" />
							削除
						</button>
					</div>
				)}
			</div>

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="ポストを削除"
			>
				<div className="space-y-4">
					<p className="text-zinc-600 dark:text-zinc-400">
						このポストを削除してもよろしいですか？この操作は取り消せません。
					</p>
					<div className="flex gap-4 justify-end">
						<button
							onClick={() => setIsModalOpen(false)}
							className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-bold transition-colors"
						>
							キャンセル
						</button>
						<button
							onClick={handleDelete}
							disabled={isDeleting}
							className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
						>
							{isDeleting && (
								<svg
									className="animate-spin h-4 w-4 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
							)}
							{isDeleting ? "削除中" : "削除"}
						</button>
					</div>
				</div>
			</Modal>
		</>
	);
}
