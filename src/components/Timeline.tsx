"use client";

import {
	ChatBubbleLeftIcon,
	HeartIcon,
	ShareIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
	useEffect,
	useOptimistic,
	useRef,
	useState,
	useTransition,
} from "react";
import { getPosts, PostData, toggleLike } from "@/app/actions";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Modal from "@/components/Modal";
import PostCreator from "@/components/PostCreator";
import PostMenu from "@/components/PostMenu";
import { authClient } from "@/lib/auth-client";

type OptimisticAction =
	| { type: "add"; post: PostData }
	| { type: "incrementReply"; postId: number }
	| { type: "toggleLike"; postId: number; userId: string };

export default function Timeline({
	posts,
	q,
	userId,
	tag,
	hidePostCreator = false,
}: {
	posts: PostData[];
	q?: string;
	userId?: string;
	tag?: string;
	hidePostCreator?: boolean;
}) {
	const [loadedPosts, setLoadedPosts] = useState<PostData[]>(posts);
	const [offset, setOffset] = useState(posts.length);
	const [hasMore, setHasMore] = useState(posts.length >= 10);
	const [isLoading, setIsLoading] = useState(false);
	const loaderRef = useRef<HTMLDivElement>(null);

	const [replyingTo, setReplyingTo] = useState<PostData | null>(null);
	const { data: session } = authClient.useSession();
	const [isPending, startTransition] = useTransition();
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	// Update loadedPosts when initial posts prop changes (e.g. navigation)
	useEffect(() => {
		setLoadedPosts(posts);
		setOffset(posts.length);
		setHasMore(posts.length >= 10);
	}, [posts]);

	const loadMorePosts = async () => {
		if (isLoading || !hasMore) return;
		setIsLoading(true);
		try {
			const newPosts = await getPosts(q, userId, tag, offset, 10);
			if (newPosts.length < 10) {
				setHasMore(false);
			}
			setLoadedPosts((prev) => [...prev, ...newPosts]);
			setOffset((prev) => prev + newPosts.length);
		} catch (error) {
			console.error("Failed to load more posts:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadMorePosts();
				}
			},
			{ threshold: 1.0 },
		);

		if (loaderRef.current) {
			observer.observe(loaderRef.current);
		}

		return () => observer.disconnect();
	}, [loaderRef, hasMore, isLoading, offset]); // Add dependencies for closure freshness

	const [optimisticPosts, dispatchOptimistic] = useOptimistic(
		loadedPosts,
		(state, action: OptimisticAction) => {
			switch (action.type) {
				case "add":
					return [action.post, ...state];
				case "incrementReply":
					return state.map((post) =>
						post.id === action.postId
							? { ...post, replyCount: (post.replyCount || 0) + 1 }
							: post,
					);
				case "toggleLike":
					return state.map((post) =>
						post.id === action.postId
							? {
									...post,
									likeCount: post.isLiked
										? post.likeCount - 1
										: post.likeCount + 1,
									isLiked: !post.isLiked,
								}
							: post,
					);
				default:
					return state;
			}
		},
	);

	const handleLike = (post: PostData) => {
		if (!session) {
			authClient.signIn.anonymous();
			return;
		}

		startTransition(async () => {
			// Optimistic update must happen inside the transition
			dispatchOptimistic({
				type: "toggleLike",
				postId: post.id,
				userId: session.user.id,
			});
			await toggleLike(post.id, session.user.id);
		});
	};

	const handleReply = (post: PostData) => {
		setReplyingTo(post);
	};

	const handlePostClick = (postId: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("id", postId.toString());
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	};

	const handlePrefetch = (postId: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("id", postId.toString());
		router.prefetch(`${pathname}?${params.toString()}`);
	};

	return (
		<div className="flex flex-col h-full overflow-hidden">
			{!hidePostCreator && (
				<div className="border-b border-zinc-200 dark:border-zinc-800">
					<PostCreator
						onOptimisticAdd={(post) =>
							dispatchOptimistic({ type: "add", post })
						}
					/>
				</div>
			)}
			<div className="flex-1 overflow-y-auto">
				{optimisticPosts.map((post) => (
					<div
						key={post.id}
						onClick={() => handlePostClick(post.id)}
						onMouseEnter={() => handlePrefetch(post.id)}
						className="block p-4 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
					>
						<div className="flex gap-3">
							{/* 左側: アイコン */}
							<div className="shrink-0">
								<Link
									href={`/profile/${post.userId}`}
									onClick={(e) => e.stopPropagation()}
									className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold hover:opacity-80 transition-opacity"
								>
									{post.author[0]}
								</Link>
							</div>

							{/* 右側: 名前、本文、画像、アクション */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between mb-1">
									<div className="flex items-center gap-2 min-w-0">
										<Link
											href={`/profile/${post.userId}`}
											onClick={(e) => e.stopPropagation()}
											className="font-semibold truncate hover:underline text-zinc-900 dark:text-zinc-100"
										>
											{post.author}
										</Link>
										<span className="text-xs text-zinc-500 shrink-0">
											{post.timestamp}
										</span>
									</div>
									<div onClick={(e) => e.stopPropagation()}>
										<PostMenu postId={post.id} authorId={post.userId} />
									</div>
								</div>

								<div className="block group">
									<div className="text-zinc-800 dark:text-zinc-200 text-sm break-words prose prose-sm dark:prose-invert max-w-none prose-zinc dark:prose-invert prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0 prose-headings:my-1 prose-headings:text-sm prose-headings:font-bold prose-a:text-blue-500 hover:prose-a:underline prose-pre:my-2 prose-pre:bg-transparent prose-pre:p-0">
										<MarkdownRenderer content={post.content} />
									</div>
								</div>

								{post.images && post.images.length > 0 && (
									<div
										className={`grid gap-2 mt-3 ${
											post.images.length === 1
												? "grid-cols-1"
												: post.images.length === 2
													? "grid-cols-2"
													: "grid-cols-2"
										}`}
									>
										{post.images.map((img, idx) => (
											<Link
												key={idx}
												href={`/photo/${encodeURIComponent(img)}`}
												scroll={false}
												className={`relative w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 block ${
													post.images.length === 1 ? "h-96" : "aspect-square"
												}`}
												onClick={(e) => e.stopPropagation()}
											>
												<Image
													src={img}
													alt="Post image"
													fill
													className="object-cover"
													loading="lazy"
												/>
											</Link>
										))}
									</div>
								)}

								<div className="flex items-center gap-6 mt-3 text-zinc-500">
									<button
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											handleLike(post);
										}}
										className={`flex items-center gap-1 transition-colors group ${post.isLiked ? "text-pink-500" : "hover:text-pink-500"}`}
									>
										<div className="p-2 -ml-2 rounded-full group-hover:bg-pink-100 dark:group-hover:bg-pink-900/30 transition-colors">
											{post.isLiked ? (
												<HeartIconSolid className="w-5 h-5 fill-pink-500" />
											) : (
												<HeartIcon className="w-5 h-5 group-hover:fill-pink-500" />
											)}
										</div>
										<span className="text-xs font-medium">
											{post.likeCount > 0 && post.likeCount}
										</span>
									</button>
									<button
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											handleReply(post);
										}}
										className="flex items-center gap-1 hover:text-blue-500 transition-colors group"
									>
										<div className="p-2 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
											<ChatBubbleLeftIcon className="w-5 h-5 group-hover:fill-blue-500" />
										</div>
										<span className="text-xs font-medium">
											{post.replyCount > 0 && post.replyCount}
										</span>
									</button>
									<button className="flex items-center gap-1 hover:text-green-500 transition-colors group">
										<div className="p-2 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
											<ShareIcon className="w-5 h-5 group-hover:fill-green-500" />
										</div>
									</button>
								</div>
							</div>
						</div>
					</div>
				))}
				{hasMore && (
					<div ref={loaderRef} className="p-4 text-center text-zinc-500">
						{isLoading ? "読み込み中..." : "さらに読み込む"}
					</div>
				)}
				{optimisticPosts.length === 0 && (
					<div className="p-8 text-center text-zinc-500">
						ポストが見つかりませんでした。
					</div>
				)}
			</div>

			<Modal
				isOpen={!!replyingTo}
				onClose={() => setReplyingTo(null)}
				title="返信を投稿"
			>
				{replyingTo && (
					<>
						<div className="mb-4 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700">
							<div className="text-sm text-zinc-500 mb-1">
								<span className="font-bold">@{replyingTo.author}</span> に返信
							</div>
							<p className="text-zinc-600 dark:text-zinc-400 line-clamp-3 text-sm">
								{replyingTo.content}
							</p>
						</div>
						<PostCreator
							parentId={replyingTo.id}
							onComplete={() => setReplyingTo(null)}
							onOptimisticAdd={() => {
								dispatchOptimistic({
									type: "incrementReply",
									postId: replyingTo.id,
								});
							}}
						/>
					</>
				)}
			</Modal>
		</div>
	);
}
