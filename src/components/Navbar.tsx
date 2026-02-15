import {
	ArrowLeftOnRectangleIcon,
	ArrowRightOnRectangleIcon,
	BellIcon,
	HomeIcon,
	UserIcon,
	UserPlusIcon,
} from "@heroicons/react/24/outline";
import {
	BellIcon as BellIconSolid,
	HomeIcon as HomeIconSolid,
	UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import NavItem from "./NavItem";
import SignOutButton from "./SignOutButton";

export default async function Navbar() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const userId = session?.user.id;
	// @ts-ignore
	const isAnonymous = session?.user.isAnonymous;

	return (
		<nav className="w-20 lg:w-64 h-screen border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-4 bg-white dark:bg-black">
			<div className="font-bold text-2xl mb-8 pl-4 hidden lg:block tracking-wider">
				BBS
			</div>
			<div className="flex justify-center lg:justify-start lg:pl-4 mb-8 lg:hidden">
				<div className="w-8 h-8 bg-black dark:bg-white rounded-full" />
			</div>

			<div className="flex-1 space-y-4">
				<NavItem
					href="/"
					icon={<HomeIcon className="w-7 h-7" />}
					activeIcon={<HomeIconSolid className="w-7 h-7" />}
					label="ホーム"
				/>
				<NavItem
					href="/notifications"
					icon={<BellIcon className="w-7 h-7" />}
					activeIcon={<BellIconSolid className="w-7 h-7" />}
					label="通知"
				/>
				<NavItem
					href={userId && !isAnonymous ? `/profile/${userId}` : "/login"}
					icon={<UserIcon className="w-7 h-7" />}
					activeIcon={<UserIconSolid className="w-7 h-7" />}
					label="プロフィール"
				/>
			</div>

			<div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
				{userId && !isAnonymous ? (
					<SignOutButton />
				) : (
					<>
						<NavItem
							href="/login"
							icon={<ArrowRightOnRectangleIcon className="w-7 h-7" />}
							label="ログイン"
						/>
						<NavItem
							href="/signup"
							icon={<UserPlusIcon className="w-7 h-7" />}
							label="登録"
						/>
					</>
				)}
			</div>
		</nav>
	);
}

// export default async function Navbar() ...
