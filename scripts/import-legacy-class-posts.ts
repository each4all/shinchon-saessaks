import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "@vercel/postgres";
import { request as playwrightRequest, type APIRequestContext } from "@playwright/test";
import { parse } from "node-html-parser";

const BASE_URL = "https://www.shinchonkid.com";
const CLASS_LIST_URL = `${BASE_URL}/web/community/class_list.html`;
const CLASS_VIEW_URL = `${BASE_URL}/web/community/class_view.html`;
const AGE_LIST_URL = `${BASE_URL}/web/community/age_list.html`;
const AGE_VIEW_URL = `${BASE_URL}/web/community/age_view.html`;
const MAX_ITEMS_PER_CATEGORY = 12;
const MAX_FETCH_RETRIES = 3;

type LegacyClassConfig = {
	key: number;
	name: string;
};

const CLASS_GROUPS: LegacyClassConfig[] = [
	{ key: 1, name: "개나리반" },
	{ key: 2, name: "민들레반" },
	{ key: 3, name: "백합반" },
	{ key: 4, name: "장미반" },
	{ key: 5, name: "방과후 과정" },
];

const AGE_GROUPS: LegacyClassConfig[] = [
	{ key: 1, name: "A그룹" },
	{ key: 2, name: "B그룹" },
	{ key: 3, name: "C그룹" },
];

type LegacyListItem = {
	legacyId: string;
	listTitle: string;
	thumbUrl?: string;
};

type LegacyDetail = {
	title: string;
	publishDate: Date | null;
	attachments: { url: string; alt?: string }[];
};

async function main() {
	const requestContext = await playwrightRequest.newContext({
		ignoreHTTPSErrors: true,
		extraHTTPHeaders: {
			"User-Agent":
				"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36",
		},
	});

	const summary: { group: string; inserted: number; skipped: number }[] = [];

	for (const classroom of CLASS_GROUPS) {
		console.log(`→ ${classroom.name} 목록 수집 중`);
		const classroomId = await ensureClassroom(classroom.name);
		const listItems = await fetchLegacyList({ requestContext, cate: classroom.key });
		let inserted = 0;
		let skipped = 0;

		for (const item of listItems) {
			const exists = await hasExistingPost(item.legacyId);
			if (exists) {
				console.log(`  • ${classroom.name} ${item.listTitle} (legacy #${item.legacyId}) 이미 존재하여 건너뜀`);
				skipped += 1;
				continue;
			}

			console.log(`  • ${classroom.name} ${item.listTitle} (legacy #${item.legacyId}) 저장 중`);
			const detail = await fetchLegacyDetail({ requestContext, legacyId: item.legacyId });
			await insertClassPost({
				classroomId,
				classroomName: classroom.name,
				legacyId: item.legacyId,
				listTitle: item.listTitle,
				thumbUrl: item.thumbUrl,
				detail,
				type: "class",
			});
			inserted += 1;
		}

		summary.push({ group: classroom.name, inserted, skipped });
	}

	for (const ageGroup of AGE_GROUPS) {
		console.log(`→ ${ageGroup.name} 연령 그룹 수집 중`);
		const classroomId = await ensureClassroom(ageGroup.name);
		const listItems = await fetchLegacyAgeList({ requestContext, cate: ageGroup.key });
		let inserted = 0;
		let skipped = 0;

		for (const item of listItems) {
			const exists = await hasExistingPost(item.legacyId);
			if (exists) {
				console.log(`  • ${ageGroup.name} ${item.listTitle} (legacy #${item.legacyId}) 이미 존재하여 건너뜀`);
				skipped += 1;
				continue;
			}

			console.log(`  • ${ageGroup.name} ${item.listTitle} (legacy #${item.legacyId}) 저장 중`);
			const detail = await fetchLegacyAgeDetail({ requestContext, legacyId: item.legacyId });
			await insertClassPost({
				classroomId,
				classroomName: ageGroup.name,
				legacyId: item.legacyId,
				listTitle: item.listTitle,
				thumbUrl: item.thumbUrl,
				detail,
				type: "age",
			});
			inserted += 1;
		}

		summary.push({ group: ageGroup.name, inserted, skipped });
	}

	await requestContext.dispose();
	console.table(summary);
}

async function fetchLegacyList({ requestContext, cate }: { requestContext: APIRequestContext; cate: number }) {
	const url = `${CLASS_LIST_URL}?cate=${cate}`;
	const html = await fetchHtml(requestContext, url);
	const root = parse(html);
	const anchors = root.querySelectorAll("ul.class_list01 li a");
	const items: LegacyListItem[] = [];
	for (const anchor of anchors) {
		const href = anchor.getAttribute("href");
		if (!href) continue;
		const urlObj = new URL(href, BASE_URL);
		const legacyId = urlObj.searchParams.get("no");
		if (!legacyId) continue;
		const title = anchor.querySelector("strong")?.text.trim() ?? "";
		const thumb = anchor.querySelector("img")?.getAttribute("src") ?? undefined;
		items.push({
			legacyId,
			listTitle: title,
			thumbUrl: thumb ? absolutize(thumb) : undefined,
		});
	}
	return items.slice(0, MAX_ITEMS_PER_CATEGORY);
}

async function fetchLegacyDetail({
	requestContext,
	legacyId,
}: {
	requestContext: APIRequestContext;
	legacyId: string;
}): Promise<LegacyDetail> {
	const url = `${CLASS_VIEW_URL}?no=${legacyId}`;
	const html = await fetchHtml(requestContext, url);
	const root = parse(html);
	const title = root.querySelector("th.view_tit01")?.text.trim() ?? "제목 미지정";
	const dateMatch = html.match(/등록일<\/strong>\s*<span>([^<]+)<\/span>/);
	const publishDate = dateMatch ? new Date(dateMatch[1]) : null;
	const attachmentNodes = root.querySelectorAll("td.view_content img");
	const attachments = attachmentNodes.map((img) => ({
		url: absolutize(img.getAttribute("src") ?? ""),
		alt: img.getAttribute("alt") ?? title,
	})).filter((item) => Boolean(item.url));
	return { title, publishDate, attachments };
}

async function fetchLegacyAgeList({ requestContext, cate }: { requestContext: APIRequestContext; cate: number }) {
	const url = `${AGE_LIST_URL}?cate=${cate}`;
	const html = await fetchHtml(requestContext, url);
	const root = parse(html);
	const anchors = root.querySelectorAll("ul.class_list01 li a");
	const items: LegacyListItem[] = [];
	for (const anchor of anchors) {
		const href = anchor.getAttribute("href");
		if (!href) continue;
		const urlObj = new URL(href, BASE_URL);
		const legacyId = urlObj.searchParams.get("no");
		if (!legacyId) continue;
		const title = anchor.querySelector("strong")?.text.trim() ?? "";
		const thumb = anchor.querySelector("img")?.getAttribute("src") ?? undefined;
		items.push({
			legacyId,
			listTitle: title,
			thumbUrl: thumb ? absolutize(thumb) : undefined,
		});
	}
	return items.slice(0, MAX_ITEMS_PER_CATEGORY);
}

async function fetchLegacyAgeDetail({
	requestContext,
	legacyId,
}: {
	requestContext: APIRequestContext;
	legacyId: string;
}): Promise<LegacyDetail> {
	const url = `${AGE_VIEW_URL}?no=${legacyId}`;
	const html = await fetchHtml(requestContext, url);
	const root = parse(html);
	const title = root.querySelector("th.view_tit01")?.text.trim() ?? "제목 미지정";
	const dateMatch = html.match(/등록일<\/strong>\s*<span>([^<]+)<\/span>/);
	const publishDate = dateMatch ? new Date(dateMatch[1]) : null;
	const attachmentNodes = root.querySelectorAll("td.view_content img");
	const attachments = attachmentNodes
		.map((img) => ({
			url: absolutize(img.getAttribute("src") ?? ""),
			alt: img.getAttribute("alt") ?? title,
		}))
		.filter((item) => Boolean(item.url));
	return { title, publishDate, attachments };
}

async function ensureClassroom(name: string): Promise<string> {
	const existing = await sql`SELECT id FROM classrooms WHERE name = ${name} LIMIT 1`;
	if (existing.rows.length) {
		return existing.rows[0].id as string;
	}
	const inserted = await sql`
		INSERT INTO classrooms (name, description)
		VALUES (${name}, ${"Legacy import"})
		RETURNING id
	`;
	return inserted.rows[0].id as string;
}

async function hasExistingPost(legacyId: string): Promise<boolean> {
	const existing = await sql`
		SELECT id FROM class_posts
		WHERE content_blocks ->> 'legacyId' = ${legacyId}
		LIMIT 1
	`;
	return existing.rows.length > 0;
}

async function insertClassPost(params: {
	classroomId: string;
	classroomName: string;
	legacyId: string;
	listTitle: string;
	thumbUrl?: string;
	detail: LegacyDetail;
 	type: "class" | "age";
}) {
	const { classroomId, legacyId, classroomName, listTitle, thumbUrl, detail, type } = params;
	const publishDate = detail.publishDate ?? new Date();
	const contentBlocks = {
		legacyId,
		legacyUrl: type === "class" ? `${CLASS_VIEW_URL}?no=${legacyId}` : `${AGE_VIEW_URL}?no=${legacyId}`,
		sourceTitle: detail.title,
		classroomName,
		legacyType: type,
	};
	const contentBlocksJson = JSON.stringify(contentBlocks);

	const content = [
		`${classroomName} 친구들의 따뜻한 순간을 옮겨왔어요. 아래 사진으로 현장 분위기를 살펴보세요.`,
		type === "class"
			? `원본 게시글 보기: ${CLASS_VIEW_URL}?no=${legacyId}`
			: `원본 게시글 보기: ${AGE_VIEW_URL}?no=${legacyId}`,
	];

	const normalizedListTitle = listTitle.replace(/\s+/g, " ").trim();
	const summaryValue =
		normalizedListTitle &&
		normalizedListTitle !== detail.title &&
		!normalizedListTitle.endsWith("...")
			? normalizedListTitle
			: null;

	const postResult = await sql`
		INSERT INTO class_posts (
				classroom_id,
				title,
				summary,
				content,
				content_blocks,
				audience_scope,
				status,
				publish_at,
				published_at,
				created_at,
				updated_at
			)
				VALUES (
					${classroomId},
					${detail.title || listTitle},
					${summaryValue},
				${JSON.stringify(content)},
				${contentBlocksJson},
				${"classroom"},
				${"published"},
				${publishDate},
				${publishDate},
				${publishDate},
				${publishDate}
			)
			RETURNING id
	`;

	const postId = postResult.rows[0].id as string;
	const attachments = detail.attachments.length
		? detail.attachments
		: thumbUrl
			? [{ url: thumbUrl, alt: detail.title }]
			: [];

	let order = 0;
	for (const attachment of attachments) {
		await sql`
			INSERT INTO class_post_media (post_id, file_url, thumbnail_url, alt_text, caption, display_order, is_cover)
			VALUES (
				${postId},
				${attachment.url},
				${attachment.url},
				${attachment.alt ?? detail.title},
				${attachment.alt ?? null},
				${order},
				${order === 0}
			)
		`;
		order += 1;
	}
}

function absolutize(url: string) {
	if (!url) return url;
	if (url.startsWith("http://") || url.startsWith("https://")) {
		return url;
	}
	return new URL(url, BASE_URL).toString();
}

async function fetchHtml(requestContext: APIRequestContext, url: string): Promise<string> {
	let lastError: unknown;
	for (let attempt = 1; attempt <= MAX_FETCH_RETRIES; attempt += 1) {
		try {
			const response = await requestContext.get(url, { timeout: 60_000 });
			if (!response.ok()) {
				throw new Error(`Request failed (${response.status()} ${response.statusText()})`);
			}
			return await response.text();
		} catch (error) {
			lastError = error;
			if (attempt === MAX_FETCH_RETRIES) {
				throw error;
			}
			await delay(1_000 * attempt);
		}
	}
	throw lastError ?? new Error(`Unknown error fetching ${url}`);
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
