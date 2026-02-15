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
import useSWRInfinite from "swr/infinite";
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
	header,
}: {
	posts: PostData[];
	q?: string;
	userId?: string;
	tag?: string;
	hidePostCreator?: boolean;
	header?: React.ReactNode;
}) {
	const { data: session } = authClient.useSession();
	const [isPending, startTransition] = useTransition();
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [replyingTo, setReplyingTo] = useState<PostData | null>(null);
	const loaderRef = useRef<HTMLDivElement>(null);

	// SWR Key Generator
	const getKey = (pageIndex: number, previousPageData: PostData[]) => {
		if (previousPageData && !previousPageData.length) return null;
		return [q, userId, tag, pageIndex * 10];
	};

	// SWR Fetcher
	const fetcher = async ([q, userId, tag, offset]: [
		string | undefined,
		string | undefined,
		string | undefined,
		number,
	]) => {
		return await getPosts(q, userId, tag, offset, 10);
	};

	const {
		data,
		size,
		setSize,
		isLoading: isSwrLoading,
		mutate,
	} = useSWRInfinite(getKey, fetcher, {
		fallbackData: [posts],
		refreshInterval: 10000,
		revalidateFirstPage: false,
	});

	const allPosts = data ? data.flat() : [];
	const isEmpty = data?.[0]?.length === 0;
	const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 10);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isReachingEnd && !isSwrLoading) {
					setSize(size + 1);
				}
			},
			{ threshold: 1.0 },
		);

		if (loaderRef.current) {
			observer.observe(loaderRef.current);
		}

		return () => observer.disconnect();
	}, [loaderRef, isReachingEnd, isSwrLoading, setSize, size]);

	const [optimisticPosts, dispatchOptimistic] = useOptimistic(
		allPosts,
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
			mutate(); // Revalidate SWR cache
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
				<div className="border-b border-zinc-200">
					<PostCreator
						onOptimisticAdd={(post) =>
							dispatchOptimistic({ type: "add", post })
						}
					/>
				</div>
			)}
			<div className="flex-1 overflow-y-auto">
				{header}
				{optimisticPosts.map((post) => (
					<div
						key={post.id}
						onClick={() => handlePostClick(post.id)}
						onMouseEnter={() => handlePrefetch(post.id)}
						className="block p-4 border-b border-zinc-200 hover:bg-zinc-50 transition-colors cursor-pointer"
					>
						<div className="flex gap-3">
							{/* 左側: アイコン */}
							<div className="shrink-0">
								<Link
									href={`/profile/${post.userId}`}
									onClick={(e) => e.stopPropagation()}
									className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold hover:opacity-80 transition-opacity overflow-hidden"
								>
									{post.authorImage ? (
										<Image
											src={post.authorImage}
											alt={post.author}
											width={40}
											height={40}
											className="w-full h-full object-cover"
										/>
									) : (
										post.author[0]
									)}
								</Link>
							</div>

							{/* 右側: 名前、本文、画像、アクション */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between mb-1">
									<div className="flex items-center gap-2 min-w-0">
										<Link
											href={`/profile/${post.userId}`}
											onClick={(e) => e.stopPropagation()}
											className="font-semibold truncate hover:underline text-zinc-900"
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
									<div className="text-zinc-800 text-sm break-words prose prose-sm max-w-none prose-zinc prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0 prose-headings:my-1 prose-headings:text-sm prose-headings:font-bold prose-a:text-blue-500 hover:prose-a:underline prose-pre:my-2 prose-pre:bg-transparent prose-pre:p-0">
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
												className={`relative w-full rounded-lg overflow-hidden border border-zinc-200 block ${
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
										<div className="p-2 -ml-2 rounded-full group-hover:bg-pink-100 transition-colors">
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
										<div className="p-2 rounded-full group-hover:bg-blue-100 transition-colors">
											<ChatBubbleLeftIcon className="w-5 h-5 group-hover:fill-blue-500" />
										</div>
										<span className="text-xs font-medium">
											{post.replyCount > 0 && post.replyCount}
										</span>
									</button>
									<button className="flex items-center gap-1 hover:text-green-500 transition-colors group">
										<div className="p-2 rounded-full group-hover:bg-green-100 transition-colors">
											<ShareIcon className="w-5 h-5 group-hover:fill-green-500" />
										</div>
									</button>
								</div>
							</div>
						</div>
					</div>
				))}
				{!isReachingEnd && (
					<div ref={loaderRef} className="p-4 text-center text-zinc-500">
						{isSwrLoading ? "読み込み中..." : "さらに読み込む"}
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
						<div className="mb-4 pl-4 border-l-2 border-zinc-200">
							<div className="text-sm text-zinc-500 mb-1">
								<span className="font-bold">@{replyingTo.author}</span> に返信
							</div>
							<p className="text-zinc-600 line-clamp-3 text-sm">
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
