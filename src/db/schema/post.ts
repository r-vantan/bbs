import {
	foreignKey,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const posts = pgTable(
	"posts",
	{
		id: serial("id").primaryKey(),
		userId: text("user_id")
			.references(() => user.id)
			.notNull(),
		name: text("name").notNull(),
		body: text("body").notNull(),
		images: text("images").array().default([]).notNull(), // URL
		parentId: integer("parent_id"),
		type: text("type", { enum: ["thread", "reply"] }).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		parentFk: foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
		}).onDelete("cascade"),
	}),
);

export const likePosts = pgTable("like_posts", {
	id: serial("id").primaryKey(),
	userId: text("user_id")
		.references(() => user.id)
		.notNull(),
	postId: integer("post_id")
		.references(() => posts.id, { onDelete: "cascade" })
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
