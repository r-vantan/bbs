"use client";

import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useTransition } from "react";
import { mutate } from "swr";
import { toggleLike } from "@/app/actions";
import { authClient } from "@/lib/auth-client";

export default function LikeButton({
	postId,
	initialIsLiked,
	initialLikeCount,
	onToggle,
}: {
	postId: number;
	initialIsLiked: boolean;
	initialLikeCount: number;
	onToggle?: (newIsLiked: boolean) => void;
}) {
	const { data: session } = authClient.useSession();
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	// Using optimistic state for immediate feedback
	const [optimisticState, setOptimisticState] = useOptimistic(
		{ isLiked: initialIsLiked, likeCount: initialLikeCount },
		(state, newIsLiked: boolean) => ({
			isLiked: newIsLiked,
			likeCount: newIsLiked
				? state.likeCount + 1
				: Math.max(0, state.likeCount - 1),
		}),
	);

	// Sync optimistic state when props change (e.g. from SWR revalidation or server refresh)
	useEffect(() => {
		startTransition(() => {
			setOptimisticState(initialIsLiked);
		});
	}, [initialIsLiked, initialLikeCount]);

	const handleLike = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!session) {
			authClient.signIn.anonymous();
			return;
		}

		const newIsLiked = !optimisticState.isLiked;

		startTransition(async () => {
			setOptimisticState(newIsLiked);
			if (onToggle) {
				onToggle(newIsLiked);
			}
			await toggleLike(postId, session.user.id);

			// Global SWR mutation to update timelines
			mutate((key) => Array.isArray(key) && key.length === 4, undefined, {
				revalidate: true,
			});

			// Refresh server components (like DetailView)
			router.refresh();
		});
	};

	return (
		<button
			onClick={handleLike}
			disabled={isPending}
			className={`flex items-center gap-1 transition-colors group ${
				optimisticState.isLiked ? "text-pink-500" : "hover:text-pink-500"
			}`}
		>
			<div className="p-2 -ml-2 rounded-full group-hover:bg-pink-100 dark:group-hover:bg-pink-900/30 transition-colors">
				{optimisticState.isLiked ? (
					<HeartIconSolid className="w-5 h-5 fill-pink-500" />
				) : (
					<HeartIcon className="w-5 h-5 group-hover:fill-pink-500" />
				)}
			</div>
			<span className="text-xs font-medium">
				{optimisticState.likeCount > 0 && optimisticState.likeCount}
			</span>
		</button>
	);
}
