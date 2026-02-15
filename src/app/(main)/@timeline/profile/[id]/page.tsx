import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { getPosts, getUserProfile } from "@/app/actions";
import Timeline from "@/components/Timeline";

export default async function ProfileTimelinePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const profile = await getUserProfile(id);
	// Fetch posts for this user
	const posts = await getPosts(undefined, id);

	if (!profile) {
		return (
			<div className="flex flex-col h-full bg-white dark:bg-zinc-950 p-4">
				<div className="flex items-center gap-4 mb-4">
					<Link
						href="/"
						className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
					>
						<ArrowLeftIcon className="w-5 h-5" />
					</Link>
					<h2 className="text-xl font-bold">プロフィール</h2>
				</div>
				<div className="flex-1 flex items-center justify-center text-zinc-500">
					ユーザーが見つかりません
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950">
			{/* Sticky Header */}
			<div className="p-4 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 flex items-center gap-4">
				<Link
					href="/"
					className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
				>
					<ArrowLeftIcon className="w-5 h-5" />
				</Link>
				<div>
					<h2 className="text-xl font-bold leading-tight">{profile.name}</h2>
					<p className="text-xs text-zinc-500">{posts.length} 件のポスト</p>
				</div>
			</div>

			{/* Profile Info */}
			<div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
				<div className="flex justify-between items-start mb-4">
					<div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
						{profile.image ? (
							<img
								src={profile.image}
								alt={profile.name}
								className="w-full h-full object-cover"
							/>
						) : (
							profile.name[0]
						)}
					</div>
					{/* Edit Profile Button is on separate page */}
				</div>
				<h1 className="text-xl font-bold mb-1">{profile.name}</h1>
				<p className="text-zinc-500 text-sm mb-4">@{profile.id}</p>
				{profile.bio && (
					<p className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap mb-4">
						{profile.bio}
					</p>
				)}
			</div>

			{/* Timeline */}
			<div className="flex-1 overflow-hidden">
				<Timeline posts={posts} hidePostCreator={true} userId={id} />
			</div>
		</div>
	);
}
