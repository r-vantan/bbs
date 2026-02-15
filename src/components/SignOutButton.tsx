"use client";

import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
	const router = useRouter();

	const handleSignOut = async () => {
		await authClient.signOut();
		router.refresh();
	};

	return (
		<button
			onClick={handleSignOut}
			className="flex items-center gap-4 p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors w-full justify-center lg:justify-start group"
		>
			<div className="text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
				<ArrowLeftOnRectangleIcon className="w-7 h-7" />
			</div>
			<span className="hidden lg:inline text-lg font-medium text-zinc-900 dark:text-zinc-100">
				ログアウト
			</span>
		</button>
	);
}
