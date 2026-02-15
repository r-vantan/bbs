import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { getCachedPosts, getUserProfile } from "@/app/actions";
import Timeline from "@/components/Timeline";
import { auth } from "@/lib/auth";

export default async function ProfileTimelinePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const profile = await getUserProfile(id);
	// Fetch posts for this user
	const posts = await getCachedPosts(undefined, id);
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const currentUserId = session?.user.id;

	if (!profile) {
		return (
			<div className="flex flex-col h-full bg-white p-4">
				<div className="flex items-center gap-4 mb-4">
					<Link
						href="/"
						className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
					>
						<ArrowLeftIcon className="w-5 h-5 text-black" />
					</Link>
					<h2 className="text-xl font-bold text-black">プロフィール</h2>
				</div>
				<div className="flex-1 flex items-center justify-center text-zinc-500">
					ユーザーが見つかりません
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-white">
			{/* Sticky Header */}
			<div className="p-4 border-b border-zinc-200 sticky top-0 bg-white backdrop-blur-md z-10 flex items-center gap-4">
				<Link
					href="/"
					className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
				>
					<ArrowLeftIcon className="w-5 h-5 text-black" />
				</Link>
				<div>
					<h2 className="text-xl font-bold leading-tight text-black">
						{profile.name}
					</h2>
					<p className="text-xs text-zinc-500">{posts.length} 件のポスト</p>
				</div>
			</div>

			<div className="flex-1 overflow-hidden">
				<Timeline
					posts={posts}
					hidePostCreator={true}
					userId={id}
					header={
						/* Profile Info inside Timeline scroll area */
						<div className="p-4 border-b border-zinc-200">
							<div className="flex justify-between items-start mb-4">
								<div className="relative w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
									{profile.image ? (
										<Image
											src={profile.image}
											alt={profile.name}
											className="w-full h-full object-cover"
											width={80}
											height={80}
										/>
									) : (
										profile.name[0]
									)}
								</div>
								{/* Edit Profile Button */}
								{currentUserId === id && (
									<Link
										href="/profile/edit"
										className="px-4 py-2 rounded-full border border-zinc-300 font-bold hover:bg-zinc-100 transition-colors text-black"
									>
										編集
									</Link>
								)}
							</div>
							<h1 className="text-xl font-bold mb-1 text-black">
								{profile.name}
							</h1>
							<p className="text-zinc-500 text-sm mb-4">@{profile.id}</p>
							{profile.bio && (
								<p className="text-zinc-800 whitespace-pre-wrap mb-4">
									{profile.bio}
								</p>
							)}
						</div>
					}
				/>
			</div>
		</div>
	);
}
