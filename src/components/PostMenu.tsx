"use client";

import { EllipsisHorizontalIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { deletePost } from "@/app/actions";
import { authClient } from "@/lib/auth-client";

export default function PostMenu({
	postId,
	authorId,
}: {
	postId: number;
	authorId: string;
}) {
	const { data: session } = authClient.useSession();
	const [isOpen, setIsOpen] = useState(false);
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
		if (!confirm("本当に削除しますか？")) return;
		setIsDeleting(true);
		try {
			await deletePost(postId, session.user.id);
		} catch (error) {
			alert("削除に失敗しました");
			console.error(error);
		} finally {
			setIsDeleting(false);
			setIsOpen(false);
		}
	};

	return (
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
							handleDelete();
						}}
						disabled={isDeleting}
						className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors disabled:opacity-50"
					>
						<TrashIcon className="w-4 h-4" />
						{isDeleting ? "削除中..." : "削除"}
					</button>
				</div>
			)}
		</div>
	);
}
