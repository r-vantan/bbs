ALTER TABLE "like_posts" DROP CONSTRAINT "like_posts_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_parent_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "tag_posts" DROP CONSTRAINT "tag_posts_tag_id_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "tag_posts" DROP CONSTRAINT "tag_posts_post_id_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_anonymous" boolean;--> statement-breakpoint
ALTER TABLE "like_posts" ADD CONSTRAINT "like_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_posts" ADD CONSTRAINT "tag_posts_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_posts" ADD CONSTRAINT "tag_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "likes_post_id_idx" ON "like_posts" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "likes_user_id_idx" ON "like_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "posts_user_id_idx" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_type_idx" ON "posts" USING btree ("type");