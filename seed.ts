import { db } from "./src/db";
import { user } from "./src/db/schema/auth";

async function main() {
	console.log("Seeding test user...");
	try {
		await db
			.insert(user)
			.values({
				id: "test-user-id",
				name: "Test User",
				email: "test@example.com",
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.onConflictDoNothing();
		console.log("Test user created or already exists.");
	} catch (error) {
		console.error("Error creating test user:", error);
	}
	process.exit(0);
}

main();
