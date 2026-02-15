import { headers } from "next/headers";
import { getCachedPosts } from "@/app/actions";
import Timeline from "@/components/Timeline";
import { auth } from "@/lib/auth";

export default async function TagTimelinePage({
	params,
}: {
	params: Promise<{ tag: string }>;
}) {
	const { tag } = await params;
	const decodedTag = decodeURIComponent(tag);

	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const currentUserId = session?.user.id;

	const posts = await getCachedPosts(
		undefined,
		undefined,
		decodedTag,
		0,
		10,
		currentUserId,
	);

	return (
		<div className="h-full flex flex-col">
			<div className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-bold text-lg sticky top-0 bg-white dark:bg-black/80 backdrop-blur z-10">
				#{decodedTag}
			</div>
			<Timeline posts={posts} hidePostCreator tag={decodedTag} />
		</div>
	);
}
