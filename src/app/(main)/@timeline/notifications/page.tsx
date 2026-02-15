import { headers } from "next/headers";
import { getNotifications } from "@/app/actions";
import { auth } from "@/lib/auth";

const formatDate = (date: Date) => {
	const d = new Date(date);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}/${m}/${day}`;
};

export default async function NotificationsPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const userId = session?.user.id;

	if (!userId) {
		return <div className="p-8">ログインしていません。</div>;
	}

	const notifications = await getNotifications(userId);

	return (
		<div className="p-8 h-full overflow-y-auto">
			<h1 className="text-2xl font-bold mb-6">通知</h1>
			<div className="space-y-4">
				{notifications.map((notification) => (
					<div
						key={notification.id}
						className="p-4 border rounded border-zinc-200 dark:border-zinc-800"
					>
						<p className="font-semibold">
							{notification.actorName}さんがあなたのポスト
							{notification.type === "like"
								? "にいいねしました"
								: "に返信しました"}
						</p>
						<p className="text-sm text-zinc-500">
							{formatDate(notification.createdAt)}
						</p>
						{notification.postContent && (
							<p className="mt-2 text-zinc-600 dark:text-zinc-400 italic">
								"{notification.postContent}"
							</p>
						)}
					</div>
				))}
				{notifications.length === 0 && (
					<p className="text-zinc-500">通知はまだありません。</p>
				)}
			</div>
		</div>
	);
}
