"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserProfile, updateUserProfile } from "@/app/actions";
import { auth } from "@/lib/auth";
import { uploadFileToR2 } from "@/lib/r2";

export async function submitProfileUpdate(formData: FormData) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const userId = session?.user.id;

	if (!userId) {
		throw new Error("Unauthorized");
	}

	const name = formData.get("name") as string;
	const bio = formData.get("bio") as string;
	const imageFile = formData.get("image") as File;

	let imageUrl = undefined;

	if (imageFile && imageFile.size > 0) {
		try {
			imageUrl = await uploadFileToR2(imageFile, "profiles");
		} catch (error) {
			console.error("Failed to upload profile image:", error);
			// Continue without updating image if upload fails
		}
	}

	await updateUserProfile(userId, { name, bio, image: imageUrl });
	redirect(`/profile/${userId}`);
}
