import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function ProfilePlaceholder() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session?.user.id) {
		redirect(`/profile/${session.user.id}`);
	}

	redirect("/login");
}
