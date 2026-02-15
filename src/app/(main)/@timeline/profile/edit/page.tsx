import { headers } from "next/headers";
import { getUserProfile } from "@/app/actions";
import ProfileEditForm from "@/components/ProfileEditForm";
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

	return (
		<div className="p-8 max-w-2xl mx-auto h-full overflow-y-auto">
			<h1 className="text-3xl font-bold mb-8">プロフィール編集</h1>
			<ProfileEditForm profile={profile} />
		</div>
	);
}
