import { headers } from "next/headers";
import { getCachedPosts } from "@/app/actions";
import Timeline from "@/components/Timeline";
import { auth } from "@/lib/auth";

export default async function TimelinePage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const q = params?.q as string | undefined;

	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const currentUserId = session?.user.id;

	const posts = await getCachedPosts(
		q,
		undefined,
		undefined,
		0,
		10,
		currentUserId,
	);

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950">
			<div className="p-4 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-950/80 backdrop-blur-md z-10">
				<h2 className="text-xl font-bold">タイムライン</h2>
			</div>
			<div className="flex-1 overflow-hidden">
				<Timeline posts={posts} q={q} />
			</div>
		</div>
	);
}
