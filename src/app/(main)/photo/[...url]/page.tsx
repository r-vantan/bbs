import Image from "next/image";

export default async function PhotoPage({
	params,
}: {
	params: Promise<{ url: string[] }>;
}) {
	const { url } = await params;

	let decodedUrl = url.map((segment) => decodeURIComponent(segment)).join("/");

	// Fix protocol double slash if needed (e.g. https:/example.com -> https://example.com)
	decodedUrl = decodedUrl.replace(/^(https?):\/(?!\/)/, "$1://");

	// Basic validation to ensure it's a valid URL or path
	// In a real app, you might want to validate against your R2 bucket domain
	if (!decodedUrl) {
		return null;
	}

	return (
		<div className="flex items-center justify-center min-h-[50vh]">
			<div className="relative w-full max-w-4xl max-h-[90vh] aspect-auto">
				<img
					src={decodedUrl}
					alt="Full size"
					className="max-w-full max-h-[90vh] object-contain mx-auto"
				/>
			</div>
		</div>
	);
}
