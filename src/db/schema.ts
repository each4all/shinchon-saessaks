import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["parent", "teacher", "nutrition", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["pending", "active"]);
export const classPostStatusEnum = pgEnum("class_post_status", ["draft", "published", "archived"]);
export const classPostAudienceScopeEnum = pgEnum("class_post_audience_scope", ["all", "classroom", "private"]);
export const classPostMediaTypeEnum = pgEnum("class_post_media_type", ["image", "video"]);
export const classScheduleEventTypeEnum = pgEnum("class_schedule_event_type", [
	"field_trip",
	"holiday",
	"notice",
	"workshop",
	"other",
]);
export const classScheduleStatusEnum = pgEnum("class_schedule_status", ["draft", "published", "cancelled"]);
export const classScheduleAudienceScopeEnum = pgEnum("class_schedule_audience_scope", ["all", "parents", "staff"]);
export const mealTypeEnum = pgEnum("meal_type", ["breakfast", "lunch", "dinner", "snack", "other"]);
export const mealPlanAudienceScopeEnum = pgEnum("meal_plan_audience_scope", ["parents", "staff", "all"]);
export const nutritionBulletinCategoryEnum = pgEnum("nutrition_bulletin_category", [
	"bulletin",
	"report",
	"menu_plan",
]);
export const nutritionBulletinStatusEnum = pgEnum("nutrition_bulletin_status", ["draft", "published", "archived"]);

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
	contentBlocks: jsonb("content_blocks"),
	audienceScope: classPostAudienceScopeEnum("audience_scope").notNull().default("classroom"),
	status: classPostStatusEnum("status").notNull().default("draft"),
	publishAt: timestamp("publish_at"),
	publishedAt: timestamp("published_at"),
	publishedBy: uuid("published_by").references(() => users.id, { onDelete: "set null" }),
	updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const classPostMedia = pgTable("class_post_media", {
	id: uuid("id").primaryKey().defaultRandom(),
	postId: uuid("post_id")
		.notNull()
		.references(() => classPosts.id, { onDelete: "cascade" }),
	fileUrl: text("file_url").notNull(),
	thumbnailUrl: text("thumbnail_url"),
	mediaType: classPostMediaTypeEnum("media_type").notNull().default("image"),
	altText: text("alt_text"),
	caption: text("caption"),
	displayOrder: integer("display_order"),
	isCover: boolean("is_cover").notNull().default(false),
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
	eventType: classScheduleEventTypeEnum("event_type").notNull().default("other"),
	audienceScope: classScheduleAudienceScopeEnum("audience_scope").notNull().default("parents"),
	status: classScheduleStatusEnum("status").notNull().default("draft"),
	cancellationReason: text("cancellation_reason"),
	notificationAt: timestamp("notification_at"),
	createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
	updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const classScheduleTargets = pgTable("class_schedule_targets", {
	id: uuid("id").primaryKey().defaultRandom(),
	scheduleId: uuid("schedule_id")
		.notNull()
		.references(() => classSchedules.id, { onDelete: "cascade" }),
	classroomId: uuid("classroom_id").references(() => classrooms.id, { onDelete: "cascade" }),
	groupCode: text("group_code"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const classScheduleResources = pgTable("class_schedule_resources", {
	id: uuid("id").primaryKey().defaultRandom(),
	scheduleId: uuid("schedule_id")
		.notNull()
		.references(() => classSchedules.id, { onDelete: "cascade" }),
	fileUrl: text("file_url").notNull(),
	label: text("label"),
	mediaType: text("media_type"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const classroomTeachers = pgTable("classroom_teachers", {
	id: uuid("id").primaryKey().defaultRandom(),
	classroomId: uuid("classroom_id")
		.notNull()
		.references(() => classrooms.id, { onDelete: "cascade" }),
	teacherId: uuid("teacher_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	role: text("role").notNull().default("lead"),
	assignedAt: timestamp("assigned_at").notNull().defaultNow(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const parentEducationCategoryEnum = pgEnum("parent_education_category", [
	"parent_class",
	"parent_recipe",
	"seminar",
]);

export const parentEducationPosts = pgTable("parent_education_posts", {
	id: uuid("id").primaryKey().defaultRandom(),
	slug: text("slug").notNull().unique(),
	title: text("title").notNull(),
	summary: text("summary"),
	content: text("content"),
	category: parentEducationCategoryEnum("category").notNull().default("parent_recipe"),
	audienceScope: text("audience_scope").notNull().default("parents"),
	isPublished: boolean("is_published").notNull().default(false),
	publishAt: timestamp("publish_at"),
	viewCount: integer("view_count").notNull().default(0),
	createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
	updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const parentEducationAttachments = pgTable("parent_education_attachments", {
	id: uuid("id").primaryKey().defaultRandom(),
	postId: uuid("post_id")
		.notNull()
		.references(() => parentEducationPosts.id, { onDelete: "cascade" }),
	fileUrl: text("file_url").notNull(),
	label: text("label"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
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

export const mealPlans = pgTable("meal_plans", {
	id: uuid("id").primaryKey().defaultRandom(),
	menuDate: timestamp("menu_date").notNull(),
	mealType: mealTypeEnum("meal_type").notNull().default("lunch"),
	menuItems: jsonb("menu_items").notNull(),
	allergens: jsonb("allergens"),
	notes: text("notes"),
	audienceScope: mealPlanAudienceScopeEnum("audience_scope").notNull().default("parents"),
	createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
	updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const mealPlanResources = pgTable("meal_plan_resources", {
	id: uuid("id").primaryKey().defaultRandom(),
	planId: uuid("plan_id")
		.notNull()
		.references(() => mealPlans.id, { onDelete: "cascade" }),
	fileUrl: text("file_url").notNull(),
	label: text("label"),
	mediaType: text("media_type"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const nutritionBulletins = pgTable("nutrition_bulletins", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	content: text("content").notNull(),
	category: nutritionBulletinCategoryEnum("category").notNull().default("bulletin"),
	status: nutritionBulletinStatusEnum("status").notNull().default("draft"),
	publishAt: timestamp("publish_at"),
	createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
	updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
