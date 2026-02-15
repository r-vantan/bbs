import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { posts } from "./post";

export const tags = pgTable("tags", {
	id: serial("id").primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tagPosts = pgTable("tag_posts", {
	id: serial("id").primaryKey(),
	tagId: integer("tag_id")
		.references(() => tags.id)
		.notNull(),
	postId: integer("post_id")
		.references(() => posts.id)
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
