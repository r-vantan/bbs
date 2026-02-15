"use client";

import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useOptimistic, useTransition } from "react";
import { toggleLike } from "@/app/actions";
import { authClient } from "@/lib/auth-client";

export default function LikeButton({
	postId,
	initialIsLiked,
	initialLikeCount,
}: {
	postId: number;
	initialIsLiked: boolean;
	initialLikeCount: number;
}) {
	const { data: session } = authClient.useSession();
	const [isPending, startTransition] = useTransition();

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

	const handleLike = () => {
		if (!session) {
			authClient.signIn.anonymous();
			return;
		}

		startTransition(async () => {
			setOptimisticState(!optimisticState.isLiked);
			await toggleLike(postId, session.user.id);
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
			<div className="p-2 rounded-full group-hover:bg-pink-100 dark:group-hover:bg-pink-900/30 transition-colors">
				{optimisticState.isLiked ? (
					<HeartIconSolid className="w-6 h-6 fill-pink-500" />
				) : (
					<HeartIcon className="w-6 h-6 group-hover:fill-pink-500" />
				)}
			</div>
			<span className="text-sm font-medium">
				{optimisticState.likeCount > 0 && optimisticState.likeCount}
			</span>
		</button>
	);
}
