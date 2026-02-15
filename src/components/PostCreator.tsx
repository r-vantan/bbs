"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import getCaretCoordinates from "textarea-caret";
import { PostData, searchTags } from "@/app/actions";
import { submitPost } from "@/app/submit-post";
import { authClient } from "@/lib/auth-client";

function formatDate(date: Date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}/${m}/${d}`;
}

export default function PostCreator({
	parentId,
	onOptimisticAdd,
	onComplete,
}: {
	parentId?: number;
	onOptimisticAdd?: (post: PostData) => void;
	onComplete?: () => void;
}) {
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();
	const formRef = useRef<HTMLFormElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);
	const [content, setContent] = useState("");
	const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
	const [cursorPosition, setCursorPosition] = useState<number | null>(null);
	const [caretCoords, setCaretCoords] = useState<{
		top: number;
		left: number;
	} | null>(null);

	// Detect tag input
	useEffect(() => {
		const checkTags = async () => {
			if (!textareaRef.current) return;

			const cursorPos = textareaRef.current.selectionStart;
			const textBeforeCursor = content.slice(0, cursorPos);
			const words = textBeforeCursor.split(/\s/);
			const currentWord = words[words.length - 1];

			if (currentWord.startsWith("#") && currentWord.length > 1) {
				const query = currentWord.slice(1);
				const suggestions = await searchTags(query);
				setTagSuggestions(suggestions);
				setCursorPosition(cursorPos);

				// Calculate caret coordinates
				const coords = getCaretCoordinates(textareaRef.current, cursorPos);
				// Adjust for scroll and textarea position
				// We subtract scrollTop to account for scrolling within the textarea
				const scrollTop = textareaRef.current.scrollTop;
				setCaretCoords({
					top: coords.top + coords.height - scrollTop,
					left: coords.left,
				});
			} else {
				setTagSuggestions([]);
				setCursorPosition(null);
				setCaretCoords(null);
			}
		};

		const timeoutId = setTimeout(checkTags, 300);
		return () => clearTimeout(timeoutId);
	}, [content]);

	const insertTag = (tag: string) => {
		if (!textareaRef.current || cursorPosition === null) return;

		const textBeforeCursor = content.slice(0, cursorPosition);
		const textAfterCursor = content.slice(cursorPosition);
		const words = textBeforeCursor.split(/\s/);
		const lastWord = words[words.length - 1]; // This is the partial tag (e.g. "#re")

		// Remove the partial tag and append the full tag
		const newTextBeforeCursor = textBeforeCursor.slice(0, -lastWord.length);
		const newContent = newTextBeforeCursor + `#${tag} ` + textAfterCursor;

		setContent(newContent);
		setTagSuggestions([]);
		setCursorPosition(null);
		setCaretCoords(null);

		// Focus back to textarea
		textareaRef.current.focus();
	};

	useEffect(() => {
		if (!isSessionPending && !session) {
			authClient.signIn.anonymous();
		}
	}, [session, isSessionPending]);

	// Cleanup object URLs when component unmounts or previews change
	useEffect(() => {
		return () => {
			previewUrls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [previewUrls]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const files = Array.from(e.target.files);
			const newFiles = [...selectedFiles, ...files];
			setSelectedFiles(newFiles);

			const newUrls = files.map((file) => URL.createObjectURL(file));
			setPreviewUrls([...previewUrls, ...newUrls]);
		}
		// Reset input value to allow selecting the same file again if needed
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const removeImage = (index: number) => {
		URL.revokeObjectURL(previewUrls[index]);
		const newFiles = selectedFiles.filter((_, i) => i !== index);
		const newUrls = previewUrls.filter((_, i) => i !== index);
		setSelectedFiles(newFiles);
		setPreviewUrls(newUrls);
	};

	async function handleSubmit(formData: FormData) {
		if (!session) {
			await authClient.signIn.anonymous();
			return;
		}

		const content = formData.get("content") as string;
		if (!content.trim() && selectedFiles.length === 0) return;

		// Append selected files to FormData manually
		// Note: The file input in the form is empty because we reset it,
		// so we need to add the files from our state.
		selectedFiles.forEach((file) => {
			formData.append("images", file);
		});

		// Optimistic UI update
		if (onOptimisticAdd) {
			const optimisticPost: PostData = {
				id: Math.random() * -1, // Temporary ID
				content: content,
				author: session.user.name || "匿名ユーザー",
				timestamp: formatDate(new Date()),
				likeCount: 0,
				replyCount: 0,
				userId: session.user.id,
				isLiked: false,
				images: previewUrls,
			};
			onOptimisticAdd(optimisticPost);
		}

		startTransition(async () => {
			await submitPost(formData);
			formRef.current?.reset();
			setSelectedFiles([]);
			setPreviewUrls([]);
			setContent("");
			if (onComplete) {
				onComplete();
			}
			router.refresh();
		});
	}

	return (
		<div className="p-4 border-b border-zinc-200 dark:border-zinc-800 relative">
			<form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
				<div className="relative">
					<textarea
						ref={textareaRef}
						name="content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder={parentId ? "返信を投稿" : "いまどうしてる？"}
						className="w-full bg-transparent resize-none outline-none text-lg min-h-[100px] text-foreground placeholder:text-zinc-500"
						required={selectedFiles.length === 0}
					/>

					{/* Tag Suggestions Popover */}
					{tagSuggestions.length > 0 && caretCoords && (
						<div
							className="absolute w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden z-20"
							style={{
								top: caretCoords.top,
								left: caretCoords.left,
							}}
						>
							{tagSuggestions.map((tag) => (
								<button
									key={tag}
									type="button"
									onClick={() => insertTag(tag)}
									className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium text-blue-500"
								>
									#{tag}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Image Previews */}
				{previewUrls.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-2">
						{previewUrls.map((url, index) => (
							<div key={index} className="relative group">
								<img
									src={url}
									alt={`Preview ${index}`}
									className="w-24 h-24 object-cover rounded-md border border-zinc-200 dark:border-zinc-700"
								/>
								<button
									type="button"
									onClick={() => removeImage(index)}
									className="absolute -top-2 -right-2 bg-zinc-800 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										className="w-4 h-4"
									>
										<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
									</svg>
								</button>
							</div>
						))}
					</div>
				)}

				{parentId && <input type="hidden" name="parentId" value={parentId} />}

				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					accept="image/*"
					multiple
					onChange={handleFileSelect}
				/>

				<div className="flex justify-between items-center">
					<div
						className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-full transition-colors cursor-pointer"
						onClick={() => fileInputRef.current?.click()}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-6 h-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
							/>
						</svg>
					</div>
					<button
						type="submit"
						disabled={
							isPending ||
							isSessionPending ||
							(selectedFiles.length === 0 && !content.trim())
						}
						className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						{isPending && (
							<svg
								className="animate-spin h-4 w-4 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						)}
						{parentId ? "返信" : "ポスト"}
					</button>
				</div>
			</form>
		</div>
	);
}
