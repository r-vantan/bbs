"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavItem({
	href,
	icon,
	label,
	activeIcon,
}: {
	href: string;
	icon: React.ReactNode;
	label: string;
	activeIcon?: React.ReactNode;
}) {
	const pathname = usePathname();
	const isActive =
		pathname === href || (href !== "/" && pathname?.startsWith(href));

	return (
		<Link
			href={href}
			className={`flex items-center gap-4 p-3 rounded-full transition-colors w-full justify-center lg:justify-start group ${
				isActive
					? "font-bold text-black dark:text-white"
					: "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
			}`}
		>
			<div
				className={`${
					isActive
						? "text-black dark:text-white [&>svg]:stroke-[2.5px]"
						: "text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white"
				}`}
			>
				{isActive && activeIcon ? activeIcon : icon}
			</div>
			<span
				className={`hidden lg:inline text-lg ${
					isActive
						? "font-bold text-black dark:text-white"
						: "font-medium text-zinc-900 dark:text-zinc-100"
				}`}
			>
				{label}
			</span>
		</Link>
	);
}
