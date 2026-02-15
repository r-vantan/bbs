import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	user: {
		additionalFields: {
			bio: {
				type: "string",
			},
			isAnonymous: {
				type: "boolean",
			},
		},
	},
	plugins: [anonymous()],
});
