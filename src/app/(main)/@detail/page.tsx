import { Suspense } from "react";
import DetailSkeleton from "@/components/DetailSkeleton";
import DetailView from "./DetailView";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const idStr = params?.id as string | undefined;
	const id = idStr ? Number(idStr) : null;
	const isValidId = id !== null && Number.isInteger(id) && id > 0;

	return (
		<Suspense
			key={isValidId ? String(id) : "empty"}
			fallback={<DetailSkeleton />}
		>
			<DetailView postId={isValidId ? id : null} />
		</Suspense>
	);
}
