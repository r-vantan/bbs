export default function DetailSkeleton() {
	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950 p-4 overflow-y-auto animate-pulse">
			<div className="mx-0 w-full">
				<div className="mb-8">
					<div className="flex items-start justify-between mb-6">
						<div className="flex items-center gap-4">
							<div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
							<div>
								<div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
								<div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
							</div>
						</div>
					</div>

					<div className="space-y-3 mb-6">
						<div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
						<div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
						<div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
					</div>

					<div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-4">
						<div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
						<div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
					</div>
				</div>

				<div className="mb-8">
					<div className="h-24 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
				</div>

				<div className="space-y-4 pt-8">
					<div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 space-y-2"
						>
							<div className="flex items-center gap-2 mb-2">
								<div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
							</div>
							<div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
							<div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
