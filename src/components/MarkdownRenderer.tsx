"use client";

import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
	content: string;
	className?: string;
}

export default function MarkdownRenderer({
	content,
	className = "",
}: MarkdownRendererProps) {
	// ... (hashtags logic remains same)
	// Replace hashtags with markdown links
	const contentWithLinks = content.replace(
		/(^|\s)(#[\w\u0590-\u05ff]+)/g,
		(match, p1, p2) => {
			return `${p1}[${p2}](/tags/${p2.slice(1)})`;
		},
	);

	return (
		<div className={className}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkBreaks]}
				components={{
					a: ({ href, children, ...props }) => {
						const isInternal = href?.startsWith("/");
						const Component = isInternal ? Link : "a";
						return (
							// @ts-ignore
							<Component
								href={href || "#"}
								{...(!isInternal && {
									target: "_blank",
									rel: "noopener noreferrer",
									onClick: (e: React.MouseEvent) => e.stopPropagation(),
								})}
								className="text-blue-500 hover:underline"
								{...props}
							>
								{children}
							</Component>
						);
					},
					p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
					code({ className, children, ...props }) {
						const match = /language-(\w+)/.exec(className || "");
						// @ts-ignore
						const isInline = !match && !String(children).includes("\n");

						if (isInline) {
							return (
								<code
									className="bg-zinc-100 dark:bg-zinc-800 rounded px-1 py-0.5 text-sm font-mono text-zinc-900 dark:text-zinc-100"
									{...props}
								>
									{children}
								</code>
							);
						}

						return (
							<CodeBlock
								language={match ? match[1] : ""}
								value={String(children).replace(/\n$/, "")}
							/>
						);
					},
				}}
			>
				{contentWithLinks}
			</ReactMarkdown>
		</div>
	);
}

function CodeBlock({ language, value }: { language: string; value: string }) {
	const [isCopied, setIsCopied] = useState(false);

	const copyToClipboard = async () => {
		if (!value) return;
		await navigator.clipboard.writeText(value);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	return (
		<div className="relative group my-4 rounded-lg overflow-hidden border border-zinc-700 bg-[#1e1e1e]">
			<div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
				{language && (
					<span className="text-xs text-zinc-400 font-mono px-2 py-1 select-none bg-black/50 backdrop-blur rounded border border-zinc-700">
						{language}
					</span>
				)}
				<button
					onClick={(e) => {
						e.stopPropagation();
						copyToClipboard();
					}}
					className="p-1.5 rounded bg-black/50 backdrop-blur border border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
					title="Copy code"
				>
					{isCopied ? (
						<CheckIcon className="w-4 h-4 text-green-500" />
					) : (
						<ClipboardDocumentIcon className="w-4 h-4" />
					)}
				</button>
			</div>
			<div className="text-sm font-mono overflow-x-auto">
				{/* Always use Dark Mode Syntax Highlighting with dark background */}
				<SyntaxHighlighter
					language={language}
					style={vscDarkPlus}
					customStyle={{
						margin: 0,
						padding: "1rem",
						background: "transparent",
						fontSize: "0.875rem",
						lineHeight: "1.6",
					}}
					wrapLongLines={true}
				>
					{value}
				</SyntaxHighlighter>
			</div>
		</div>
	);
}
