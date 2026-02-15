import { Suspense } from "react";
import DetailSkeleton from "@/components/DetailSkeleton";
import DetailView from "./DetailView";

export default function Page({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	return (
		<Suspense fallback={<DetailSkeleton />}>
			<DetailView searchParams={searchParams} />
		</Suspense>
	);
}
