import { Suspense } from "react";
import SearchBar from "./SearchBar";

export default function Header() {
	return (
		<header className="h-16 border-b border-zinc-200 flex items-center px-4 bg-white backdrop-blur-md sticky top-0 z-50 text-black">
			<Suspense>
				<SearchBar />
			</Suspense>
		</header>
	);
}
