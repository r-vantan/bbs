"use client";

import { useRef, useState } from "react";
import { UserProfile } from "@/app/actions";
import { submitProfileUpdate } from "@/app/submit-profile";

export default function ProfileEditForm({ profile }: { profile: UserProfile }) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		profile.image || null,
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
		}
	};

	return (
		<form action={submitProfileUpdate} className="space-y-6">
			<div className="flex flex-col items-center mb-6">
				<div
					className="w-32 h-32 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mb-4 cursor-pointer relative group"
					onClick={() => fileInputRef.current?.click()}
				>
					{previewUrl ? (
						<img
							src={previewUrl}
							alt="Profile Preview"
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-400">
							{profile.name[0]}
						</div>
					)}
					<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
						<span className="text-white text-sm font-bold">変更</span>
					</div>
				</div>
				<input
					type="file"
					name="image"
					ref={fileInputRef}
					className="hidden"
					accept="image/*"
					onChange={handleImageChange}
				/>
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					className="text-blue-500 text-sm font-medium hover:underline"
				>
					アイコンを変更
				</button>
			</div>

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
			<div className="flex gap-4">
				<a
					href={`/profile/${profile.id}`}
					className="flex-1 py-3 text-center bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-bold rounded-lg transition-colors"
				>
					キャンセル
				</a>
				<button
					type="submit"
					className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
				>
					変更を保存
				</button>
			</div>
		</form>
	);
}
