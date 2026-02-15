import { Suspense } from "react";
import DetailSkeleton from "@/components/DetailSkeleton";
import DetailView from "./DetailView";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const params = await searchParams;
	const id = params.id as string | undefined;

	return (
		<Suspense key={id} fallback={<DetailSkeleton />}>
			<DetailView searchParams={searchParams} />
		</Suspense>
	);
}
