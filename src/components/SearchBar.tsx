"use client";

import {
	ClockIcon,
	MagnifyingGlassIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { searchTags, searchUsers } from "@/app/actions";

interface SearchUser {
	id: string;
	name: string;
	image: string | null;
}

export default function SearchBar() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [query, setQuery] = useState(searchParams.get("q") || "");
	const [isOpen, setIsOpen] = useState(false);
	const [history, setHistory] = useState<string[]>([]);
	const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
	const [suggestedUsers, setSuggestedUsers] = useState<SearchUser[]>([]);
	const wrapperRef = useRef<HTMLDivElement>(null);

	// Load history on mount
	useEffect(() => {
		const saved = localStorage.getItem("search_history");
		if (saved) {
			setHistory(JSON.parse(saved));
		}
	}, []);

	// Handle outside click to close
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Fetch suggestions
	useEffect(() => {
		const timer = setTimeout(async () => {
			if (query.trim().length > 0) {
				const [tags, users] = await Promise.all([
					searchTags(query),
					searchUsers(query),
				]);
				setSuggestedTags(tags);
				setSuggestedUsers(users);
			} else {
				setSuggestedTags([]);
				setSuggestedUsers([]);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [query]);

	const saveToHistory = (term: string) => {
		const newHistory = [term, ...history.filter((h) => h !== term)].slice(0, 5);
		setHistory(newHistory);
		localStorage.setItem("search_history", JSON.stringify(newHistory));
	};

	const removeFromHistory = (e: React.MouseEvent, term: string) => {
		e.stopPropagation();
		const newHistory = history.filter((h) => h !== term);
		setHistory(newHistory);
		localStorage.setItem("search_history", JSON.stringify(newHistory));
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (query.trim()) {
			saveToHistory(query.trim());
			setIsOpen(false);
			router.push(`/?q=${encodeURIComponent(query.trim())}`);
		}
	};

	const clearQuery = () => {
		setQuery("");
		setSuggestedTags([]);
		setSuggestedUsers([]);
	};

	return (
		<div ref={wrapperRef} className="relative w-full max-w-md">
			<form onSubmit={handleSearch} className="relative z-20">
				<div className="relative">
					<MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
					<input
						type="text"
						placeholder="検索..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onFocus={() => setIsOpen(true)}
						className="w-full pl-10 pr-10 py-2 rounded-full bg-zinc-100 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
					/>
					{query && (
						<button
							type="button"
							onClick={clearQuery}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
						>
							<XMarkIcon className="w-4 h-4" />
						</button>
					)}
				</div>
			</form>

			{isOpen && (
				<div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-50 text-black">
					{/* Search History */}
					{!query && history.length > 0 && (
						<div className="py-2">
							<div className="px-4 py-1 text-xs font-semibold text-zinc-500 uppercase">
								最近の検索
							</div>
							{history.map((term, i) => (
								<div
									key={i}
									onClick={() => {
										setQuery(term);
										saveToHistory(term);
										setIsOpen(false);
										router.push(`/?q=${encodeURIComponent(term)}`);
									}}
									className="px-4 py-2 hover:bg-zinc-100 cursor-pointer flex justify-between items-center group"
								>
									<div className="flex items-center gap-3">
										<ClockIcon className="w-4 h-4 text-zinc-400" />
										<span>{term}</span>
									</div>
									<button
										onClick={(e) => removeFromHistory(e, term)}
										className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<XMarkIcon className="w-4 h-4" />
									</button>
								</div>
							))}
						</div>
					)}

					{/* Suggestions */}
					{query && (
						<div className="py-2">
							{/* Users */}
							{suggestedUsers.length > 0 && (
								<div className="mb-2">
									<div className="px-4 py-1 text-xs font-semibold text-zinc-500 uppercase">
										ユーザー
									</div>
									{suggestedUsers.map((user) => (
										<Link
											key={user.id}
											href={`/profile/${user.id}`}
											onClick={() => {
												saveToHistory(user.name);
												setIsOpen(false);
											}}
											className="px-4 py-2 hover:bg-zinc-100 flex items-center gap-3 cursor-pointer"
										>
											<div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
												{user.image ? (
													<img
														src={user.image}
														alt={user.name}
														className="w-full h-full object-cover"
													/>
												) : (
													user.name[0]
												)}
											</div>
											<div>
												<div className="font-medium text-sm">{user.name}</div>
												<div className="text-xs text-zinc-500">@{user.id}</div>
											</div>
										</Link>
									))}
								</div>
							)}

							{/* Tags */}
							{suggestedTags.length > 0 && (
								<div className="mb-2">
									<div className="px-4 py-1 text-xs font-semibold text-zinc-500 uppercase">
										タグ
									</div>
									{suggestedTags.map((tag) => (
										<Link
											key={tag}
											href={`/tags/${encodeURIComponent(tag)}`}
											onClick={() => {
												saveToHistory(`#${tag}`);
												setIsOpen(false);
											}}
											className="px-4 py-2 hover:bg-zinc-100 flex items-center gap-3 cursor-pointer"
										>
											<div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500">
												#
											</div>
											<span className="font-medium text-sm">{tag}</span>
										</Link>
									))}
								</div>
							)}

							{/* Search for text */}
							<div
								onClick={() => {
									saveToHistory(query);
									setIsOpen(false);
									router.push(`/?q=${encodeURIComponent(query)}`);
								}}
								className="px-4 py-2 hover:bg-zinc-100 cursor-pointer flex items-center gap-3 text-blue-500"
							>
								<MagnifyingGlassIcon className="w-4 h-4" />
								<span>&quot;{query}&quot; を検索</span>
							</div>
						</div>
					)}

					{query &&
						suggestedUsers.length === 0 &&
						suggestedTags.length === 0 && (
							<div className="px-4 py-8 text-center text-zinc-500 text-sm">
								見つかりませんでした
							</div>
						)}
				</div>
			)}
		</div>
	);
}
