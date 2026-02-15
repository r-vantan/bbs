"use server";

import { and, desc, eq, ilike, inArray, or, SQL, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { notifications } from "@/db/schema/notification";
import { likePosts, posts } from "@/db/schema/post";
import { tagPosts, tags } from "@/db/schema/tags";
import { auth } from "@/lib/auth";

export interface PostData {
	id: number;
	content: string;
	author: string;
	timestamp: string;
	likeCount: number;
	replyCount: number;
	userId: string;
	isLiked: boolean;
	images: string[];
}

export interface UserProfile {
	id: string;
	name: string;
	bio?: string | null;
	image?: string | null;
}

export async function createPost(
	userId: string,
	content: string,
	parentId?: number,
	imageUrls: string[] = [],
) {
	if (!content.trim()) {
		throw new Error("Content cannot be empty");
	}

	// Get user name for the post
	const userData = await db
		.select({ name: user.name })
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);
	const userName = userData[0]?.name || "Anonymous";

	const [newPost] = await db
		.insert(posts)
		.values({
			userId,
			name: userName, // Storing name directly as requested, though redundant with relation
			body: content,
			images: imageUrls,
			parentId: parentId || null,
			type: parentId ? "reply" : "thread",
		})
		.returning();

	// If it's a reply, create a notification for the parent post author
	if (parentId) {
		const parentPost = await db
			.select()
			.from(posts)
			.where(eq(posts.id, parentId))
			.limit(1);
		if (parentPost[0] && parentPost[0].userId !== userId) {
			await db.insert(notifications).values({
				userId: parentPost[0].userId,
				actorId: userId,
				type: "reply",
				postId: newPost.id,
			});
		}
	}

	// Extract hashtags and save them
	const hashtagRegex = /(?:^|\s)(#[\w\u0590-\u05ff]+)/g;
	const matches = content.matchAll(hashtagRegex);
	const foundTags = Array.from(matches).map((m) => m[1]);

	if (foundTags.length > 0) {
		for (const tagText of foundTags) {
			const tagName = tagText.slice(1).toLowerCase(); // remove #

			// Upsert tag
			let tagId: number;
			const existingTag = await db
				.select()
				.from(tags)
				.where(eq(tags.name, tagName))
				.limit(1);

			if (existingTag.length > 0) {
				tagId = existingTag[0].id;
			} else {
				const [newTag] = await db
					.insert(tags)
					.values({ name: tagName })
					.returning();
				tagId = newTag.id;
			}

			// Link tag to post
			await db.insert(tagPosts).values({
				tagId,
				postId: newPost.id,
			});
		}
	}

	revalidatePath("/");
	return newPost;
}

export async function deletePost(postId: number, userId: string) {
	// Verify ownership
	const post = await db
		.select()
		.from(posts)
		.where(eq(posts.id, postId))
		.limit(1);
	if (!post[0] || post[0].userId !== userId) {
		throw new Error("Unauthorized");
	}

	await db.delete(posts).where(eq(posts.id, postId));
	revalidatePath("/");
}

export async function toggleLike(postId: number, userId: string) {
	const existingLike = await db
		.select()
		.from(likePosts)
		.where(and(eq(likePosts.postId, postId), eq(likePosts.userId, userId)))
		.limit(1);

	if (existingLike.length > 0) {
		await db
			.delete(likePosts)
			.where(and(eq(likePosts.postId, postId), eq(likePosts.userId, userId)));
	} else {
		await db.insert(likePosts).values({
			userId,
			postId,
		});

		// Create notification
		const post = await db
			.select()
			.from(posts)
			.where(eq(posts.id, postId))
			.limit(1);
		if (post[0] && post[0].userId !== userId) {
			await db.insert(notifications).values({
				userId: post[0].userId,
				actorId: userId,
				type: "like",
				postId,
			});
		}
	}
	revalidatePath("/");
}

export async function getPosts(
	query?: string,
	userId?: string,
	tag?: string,
	offset = 0,
	limit = 10,
): Promise<PostData[]> {
	// Simulate network delay
	// await new Promise((resolve) => setTimeout(resolve, 500));
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const currentUserId = session?.user.id;

	// Create an alias for the replies table to avoid conflict
	const replies = db.$with("replies").as(
		db
			.select({
				parentId: posts.parentId,
				count: sql<number>`count(*)`.as("count"),
			})
			.from(posts)
			.where(eq(posts.type, "reply"))
			.groupBy(posts.parentId),
	);

	let queryBuilder = db
		.with(replies)
		.select({
			id: posts.id,
			body: posts.body,
			images: posts.images,
			createdAt: posts.createdAt,
			authorName: user.name,
			userId: posts.userId,
			likeCount: sql<number>`count(distinct ${likePosts.id})`.mapWith(Number),
			replyCount: sql<number>`coalesce(${replies.count}, 0)`.mapWith(Number),
		})
		.from(posts)
		.leftJoin(user, eq(posts.userId, user.id))
		.leftJoin(likePosts, eq(posts.id, likePosts.postId))
		.leftJoin(replies, eq(posts.id, replies.parentId))
		.groupBy(posts.id, user.name, posts.userId, replies.count, posts.images)
		.$dynamic();

	// Join with tags if tag filter is present
	if (tag) {
		queryBuilder = queryBuilder
			.innerJoin(tagPosts, eq(posts.id, tagPosts.postId))
			.innerJoin(tags, eq(tagPosts.tagId, tags.id));
	}

	// Build conditions
	const conditions: (SQL | undefined)[] = [eq(posts.type, "thread")];

	if (userId) {
		conditions.push(eq(posts.userId, userId));
	}

	if (tag) {
		conditions.push(eq(tags.name, tag));
	}

	if (query) {
		const searchPattern = `%${query}%`;
		conditions.push(
			or(ilike(posts.body, searchPattern), ilike(user.name, searchPattern)),
		);
	}

	queryBuilder = queryBuilder.where(
		and(...conditions.filter((c): c is SQL => c !== undefined)),
	);

	const result = await queryBuilder
		.orderBy(desc(posts.createdAt))
		.limit(limit)
		.offset(offset);

	// Efficiently fetch "isLiked" for all posts for the current user
	const likedPostIds = new Set<number>();
	if (currentUserId && result.length > 0) {
		const postIds = result.map((p) => p.id);
		const userLikes = await db
			.select({ postId: likePosts.postId })
			.from(likePosts)
			.where(
				and(
					eq(likePosts.userId, currentUserId),
					inArray(likePosts.postId, postIds),
				),
			);

		for (const l of userLikes) {
			likedPostIds.add(l.postId);
		}
	}

	return result.map((post) => ({
		id: post.id,
		content: post.body,
		author: post.authorName ?? "Unknown",
		timestamp: formatDate(post.createdAt),
		likeCount: post.likeCount,
		replyCount: post.replyCount,
		userId: post.userId,
		isLiked: likedPostIds.has(post.id),
		images: post.images || [],
	}));
}

export async function getPost(id: number) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const currentUserId = session?.user.id;

	const postResult = await db
		.select({
			id: posts.id,
			body: posts.body,
			images: posts.images,
			createdAt: posts.createdAt,
			authorName: user.name,
			userId: posts.userId,
			likeCount: sql<number>`count(${likePosts.id})`.mapWith(Number),
		})
		.from(posts)
		.leftJoin(user, eq(posts.userId, user.id))
		.leftJoin(likePosts, eq(posts.id, likePosts.postId))
		.where(eq(posts.id, id))
		.groupBy(posts.id, user.name, posts.userId, posts.images)
		.limit(1);

	const post = postResult[0];

	if (!post) return null;

	// Check if liked by current user
	let isLiked = false;
	if (currentUserId) {
		const existingLike = await db
			.select()
			.from(likePosts)
			.where(and(eq(likePosts.postId, id), eq(likePosts.userId, currentUserId)))
			.limit(1);
		if (existingLike.length > 0) {
			isLiked = true;
		}
	}

	// Fetch replies
	const replies = await db
		.select({
			id: posts.id,
			body: posts.body,
			images: posts.images,
			createdAt: posts.createdAt,
			authorName: user.name,
			userId: posts.userId,
		})
		.from(posts)
		.leftJoin(user, eq(posts.userId, user.id))
		.where(eq(posts.parentId, id))
		.orderBy(desc(posts.createdAt));

	return {
		...post,
		images: post.images || [],
		author: post.authorName ?? "Unknown",
		timestamp: formatDate(post.createdAt),
		isLiked,
		replies: replies.map((r) => ({
			...r,
			images: r.images || [],
			author: r.authorName ?? "Unknown",
			timestamp: formatDate(r.createdAt),
		})),
	};
}

export async function getUserProfile(
	userId: string,
): Promise<UserProfile | null> {
	const result = await db
		.select({
			id: user.id,
			name: user.name,
			bio: user.bio,
			image: user.image,
		})
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	return result[0] || null;
}

export async function updateUserProfile(
	userId: string,
	data: { name: string; bio?: string },
) {
	await db
		.update(user)
		.set({
			name: data.name,
			bio: data.bio,
			updatedAt: new Date(),
		})
		.where(eq(user.id, userId));

	revalidatePath(`/profile/${userId}`);
	revalidatePath("/");
}

export async function getNotifications(userId: string) {
	return await db
		.select({
			id: notifications.id,
			type: notifications.type,
			read: notifications.read,
			createdAt: notifications.createdAt,
			actorName: user.name,
			postContent: posts.body,
			postId: notifications.postId,
		})
		.from(notifications)
		.leftJoin(user, eq(notifications.actorId, user.id))
		.leftJoin(posts, eq(notifications.postId, posts.id))
		.where(eq(notifications.userId, userId))
		.orderBy(desc(notifications.createdAt));
}

export async function searchTags(query: string) {
	if (!query.trim()) return [];

	const results = await db
		.select({ name: tags.name })
		.from(tags)
		.where(ilike(tags.name, `${query}%`))
		.limit(5);

	return results.map((r) => r.name);
}

export async function searchUsers(query: string) {
	if (!query.trim()) return [];

	const results = await db
		.select({
			id: user.id,
			name: user.name,
			image: user.image,
		})
		.from(user)
		.where(ilike(user.name, `%${query}%`))
		.limit(5);

	return results;
}

function formatDate(date: Date) {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const diffInMinutes = Math.floor(diff / (1000 * 60));
	const diffInHours = Math.floor(diff / (1000 * 60 * 60));
	const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));

	if (diffInMinutes < 60) {
		return `${Math.max(0, diffInMinutes)}分前`;
	} else if (diffInHours < 24) {
		return `${diffInHours}時間前`;
	} else if (diffInDays <= 3) {
		return `${diffInDays}日前`;
	} else {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		const h = String(date.getHours()).padStart(2, "0");
		const min = String(date.getMinutes()).padStart(2, "0");
		return `${y}/${m}/${d} ${h}:${min}`;
	}
}
