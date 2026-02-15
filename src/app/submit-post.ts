"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createPost } from "@/app/actions";
import { auth } from "@/lib/auth";
import { uploadFileToR2 } from "@/lib/r2";

export async function submitPost(formData: FormData) {
	const content = formData.get("content") as string;
	const parentIdStr = formData.get("parentId") as string;
	const parentId = parentIdStr ? Number(parentIdStr) : undefined;
	const files = formData.getAll("images") as File[];

	if (!content || !content.trim()) {
		throw new Error("Content cannot be empty");
	}

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new Error("Unauthorized");
	}

	const userId = session.user.id;
	const imageUrls: string[] = [];

	if (files.length > 0) {
		// Filter out empty files (if any)
		const validFiles = files.filter((file) => file.size > 0);

		// Upload images in parallel
		try {
			const uploadPromises = validFiles.map((file) =>
				uploadFileToR2(file, "posts"),
			);
			const uploadedUrls = await Promise.all(uploadPromises);
			imageUrls.push(...uploadedUrls);
		} catch (error) {
			console.error("Failed to upload images:", error);
			throw new Error("Failed to upload images");
		}
	}

	await createPost(userId, content, parentId, imageUrls);
	revalidatePath("/");
}
