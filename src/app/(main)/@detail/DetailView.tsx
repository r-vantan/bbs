import Image from "next/image";
import Link from "next/link";
import { getPost } from "@/app/actions";
import LikeButton from "@/components/LikeButton";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import PostCreator from "@/components/PostCreator";
import PostMenu from "@/components/PostMenu";

export default async function DetailPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const idStr = params?.id as string | undefined;
	const id = idStr ? Number(idStr) : null;
	const isValidId = id !== null && Number.isInteger(id) && id > 0;
	const post = isValidId && id ? await getPost(id) : null;

	if (!post) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-zinc-500">
				<div className="text-4xl mb-4">ポストを選択</div>
				<p>タイムラインからポストを選択して詳細を表示します。</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950 p-4 overflow-y-auto">
			<div className="mx-0 w-full">
				{/* Main Post */}
				<div className="mb-8">
					<div className="flex items-start justify-between mb-6">
						<div className="flex items-center gap-4">
							<Link
								href={`/profile/${post.userId}`}
								className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold hover:opacity-80 transition-opacity"
							>
								{post.author[0]}
							</Link>
							<div>
								<Link
									href={`/profile/${post.userId}`}
									className="text-2xl font-bold hover:underline"
								>
									{post.author}
								</Link>
								<p className="text-zinc-500">{post.timestamp}</p>
							</div>
						</div>
						<PostMenu postId={post.id} authorId={post.userId} />
					</div>

					<div className="prose prose-zinc dark:prose-invert max-w-none mb-6 prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0 prose-headings:my-2 prose-headings:text-lg prose-headings:font-bold prose-a:text-blue-500 hover:prose-a:underline prose-pre:my-4 prose-pre:bg-transparent prose-pre:p-0">
						<div className="text-base leading-relaxed whitespace-pre-wrap">
							<MarkdownRenderer content={post.body} />
						</div>
					</div>

					{post.images && post.images.length > 0 && (
						<div
							className={`grid gap-2 mb-6 ${
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
										post.images.length === 1 ? "h-[500px]" : "aspect-square"
									}`}
								>
									<Image
										src={img}
										alt="Post image"
										fill
										className="object-cover"
									/>
								</Link>
							))}
						</div>
					)}

					<div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-4 text-zinc-500 text-sm">
						<span>{post.likeCount} いいね</span>
						<span>{post.replies.length} 返信</span>
					</div>

					<div className="mt-4 flex gap-4">
						<LikeButton
							postId={post.id}
							initialIsLiked={post.isLiked}
							initialLikeCount={post.likeCount}
						/>
					</div>
				</div>

				<div className="mb-8">
					<PostCreator parentId={post.id} />
				</div>

				{/* Replies */}
				<div className="space-y-4 pt-8">
					<h3 className="text-lg font-bold mb-4">返信</h3>
					{post.replies.map((reply) => (
						<div
							key={reply.id}
							className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900"
						>
							<div className="flex items-center gap-2 mb-2">
								<Link
									href={`/profile/${reply.userId}`}
									className="font-semibold hover:underline"
								>
									{reply.author}
								</Link>
								<span className="text-xs text-zinc-500">{reply.timestamp}</span>
							</div>
							<div className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap mb-2 prose prose-zinc prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-ul:my-0 prose-ol:my-0 prose-li:my-0 prose-headings:my-1 prose-headings:text-sm prose-headings:font-bold prose-a:text-blue-500 hover:prose-a:underline prose-pre:my-2 prose-pre:bg-[#1e1e1e] prose-pre:rounded-lg prose-pre:p-0">
								<MarkdownRenderer content={reply.body} />
							</div>
							{reply.images && reply.images.length > 0 && (
								<div
									className={`grid gap-2 mt-2 ${
										reply.images.length === 1
											? "grid-cols-1"
											: reply.images.length === 2
												? "grid-cols-2"
												: "grid-cols-2"
									}`}
								>
									{reply.images.map((img, idx) => (
										<Link
											key={idx}
											href={`/photo/${encodeURIComponent(img)}`}
											scroll={false}
											className={`relative w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 block ${
												reply.images.length === 1 ? "h-64" : "aspect-square"
											}`}
										>
											<Image
												src={img}
												alt="Reply image"
												fill
												className="object-cover"
											/>
										</Link>
									))}
								</div>
							)}
						</div>
					))}
					{post.replies.length === 0 && (
						<p className="text-zinc-500 text-center py-8">
							まだ返信はありません。
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
