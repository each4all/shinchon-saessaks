import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["parent", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["pending", "active"]);

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name"),
	email: text("email").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	role: userRoleEnum("role").notNull().default("parent"),
	status: userStatusEnum("status").notNull().default("pending"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const newsPosts = pgTable("news_posts", {
	id: uuid("id").primaryKey().defaultRandom(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	category: text("category").notNull(),
	summary: text("summary"),
	content: text("content").notNull(),
	heroImageUrl: text("hero_image_url"),
	heroImageAlt: text("hero_image_alt"),
	publishAt: timestamp("publish_at"),
	isHighlighted: boolean("is_highlighted").notNull().default(false),
	audienceScope: text("audience_scope").notNull().default("public"),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const newsAttachments = pgTable("news_attachments", {
	id: uuid("id").primaryKey().defaultRandom(),
	postId: uuid("post_id").notNull().references(() => newsPosts.id, { onDelete: "cascade" }),
	fileUrl: text("file_url").notNull(),
	label: text("label"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const classrooms = pgTable("classrooms", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	description: text("description"),
	ageRange: text("age_range"),
	leadTeacher: text("lead_teacher"),
	assistantTeacher: text("assistant_teacher"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const children = pgTable("children", {
	id: uuid("id").primaryKey().defaultRandom(),
	classroomId: uuid("classroom_id").references(() => classrooms.id, { onDelete: "set null" }),
	name: text("name").notNull(),
	birthdate: timestamp("birthdate"),
	enrollmentDate: timestamp("enrollment_date"),
	status: text("status").notNull().default("active"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const childParents = pgTable("child_parents", {
	childId: uuid("child_id").references(() => children.id, { onDelete: "cascade" }),
	parentId: uuid("parent_id").references(() => users.id, { onDelete: "cascade" }),
	relationship: text("relationship"),
	primaryContact: boolean("primary_contact").notNull().default(false),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const classPosts = pgTable("class_posts", {
	id: uuid("id").primaryKey().defaultRandom(),
	classroomId: uuid("classroom_id").references(() => classrooms.id, { onDelete: "cascade" }),
	authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
	title: text("title").notNull(),
	summary: text("summary"),
	content: text("content").notNull(),
	publishAt: timestamp("publish_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const classPostAttachments = pgTable("class_post_attachments", {
	id: uuid("id").primaryKey().defaultRandom(),
	postId: uuid("post_id").references(() => classPosts.id, { onDelete: "cascade" }),
	fileUrl: text("file_url").notNull(),
	label: text("label"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const classSchedules = pgTable("class_schedules", {
	id: uuid("id").primaryKey().defaultRandom(),
	classroomId: uuid("classroom_id").references(() => classrooms.id, { onDelete: "set null" }),
	title: text("title").notNull(),
	description: text("description"),
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date"),
	location: text("location"),
	audienceScope: text("audience_scope").notNull().default("parents"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const parentResources = pgTable("parent_resources", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description"),
	category: text("category"),
	resourceType: text("resource_type").notNull().default("form"),
	fileUrl: text("file_url").notNull(),
	publishedAt: timestamp("published_at"),
	audienceScope: text("audience_scope").notNull().default("parents"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const parentInquiries = pgTable("parent_inquiries", {
	id: uuid("id").primaryKey().defaultRandom(),
	parentId: uuid("parent_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	category: text("category").notNull().default("general"),
	subject: text("subject").notNull(),
	message: text("message").notNull(),
	status: text("status").notNull().default("received"),
	adminReply: text("admin_reply"),
	repliedAt: timestamp("replied_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
