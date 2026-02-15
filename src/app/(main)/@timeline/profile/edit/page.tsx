import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getUserProfile, updateUserProfile } from "@/app/actions";
import { auth } from "@/lib/auth";

export default async function ProfilePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const userId = session?.user.id;

	if (!userId) {
		return <div className="p-8">ログインしていません。</div>;
	}

	const profile = await getUserProfile(userId);

	if (!profile) {
		return <div className="p-8">プロフィールが見つかりませんでした。</div>;
	}

	async function updateProfile(formData: FormData) {
		"use server";
		if (!userId) return;
		const name = formData.get("name") as string;
		const bio = formData.get("bio") as string;
		await updateUserProfile(userId, { name, bio });
		revalidatePath("/profile");
	}

	return (
		<div className="p-8 max-w-2xl mx-auto h-full overflow-y-auto">
			<h1 className="text-3xl font-bold mb-8">プロフィール編集</h1>
			<form action={updateProfile} className="space-y-6">
				<div>
					<label className="block text-sm font-medium mb-2">表示名</label>
					<input
						name="name"
						defaultValue={profile.name}
						className="w-full px-4 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-500 outline-none"
						required
					/>
				</div>
				<div>
					<label className="block text-sm font-medium mb-2">自己紹介</label>
					<textarea
						name="bio"
						defaultValue={profile.bio || ""}
						className="w-full px-4 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-500 h-32 resize-none outline-none"
					/>
				</div>
				<button
					type="submit"
					className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
				>
					変更を保存
				</button>
			</form>
		</div>
	);
}
