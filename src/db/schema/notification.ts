import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { posts } from "./post";

export const notifications = pgTable("notifications", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	userId: text("user_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	actorId: text("actor_id")
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	type: text("type", { enum: ["like", "reply", "follow"] }).notNull(),
	postId: integer("post_id").references(() => posts.id, {
		onDelete: "cascade",
	}),
	read: boolean("read").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
