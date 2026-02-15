import { Suspense } from "react";
import SearchBar from "./SearchBar";

export default function Header() {
	return (
		<header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
			<Suspense>
				<SearchBar />
			</Suspense>
		</header>
	);
}
