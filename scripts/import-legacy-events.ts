import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "@vercel/postgres";
import { request as playwrightRequest, type APIRequestContext } from "@playwright/test";
import { parse } from "node-html-parser";

const BASE_URL = "https://www.shinchonkid.com";
const EVENT_LIST_URL = `${BASE_URL}/web/community/event_list.html`;
const EVENT_VIEW_URL = `${BASE_URL}/web/community/event_view.html`;
const MAX_ITEMS = 12;
const MAX_FETCH_RETRIES = 3;
const refreshMode = process.argv.includes("--refresh");

async function main() {
  const requestContext = await playwrightRequest.newContext({
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36",
    },
  });

  const listItems = await fetchEventList(requestContext);
  let inserted = 0;
  let skipped = 0;
  let updated = 0;

  for (const item of listItems) {
    const existingId = await findExistingEvent(item.legacyId);
    if (existingId && !refreshMode) {
      console.log(`• ${item.listTitle} (legacy #${item.legacyId}) 이미 존재하여 건너뜀`);
      skipped += 1;
      continue;
    }

    console.log(
      existingId
        ? `• ${item.listTitle} (legacy #${item.legacyId}) 내용 갱신 중`
        : `• ${item.listTitle} (legacy #${item.legacyId}) 저장 중`,
    );
    const detail = await fetchEventDetail(requestContext, item.legacyId);
    if (existingId) {
      await updateEvent(existingId, detail, item);
      updated += 1;
    } else {
      await insertEvent(detail, item);
      inserted += 1;
    }
  }

  await requestContext.dispose();
  console.table([{ inserted, updated, skipped }]);
}

type LegacyEventListItem = {
  legacyId: string;
  listTitle: string;
  thumbUrl?: string;
};

type LegacyEventDetail = {
  title: string;
  publishDate: Date;
  summary?: string;
  attachments: { url: string; alt?: string }[];
};

const friendlyDescriptionOverrides: Record<string, string> = {
  "176": "운동회 마지막 시상식에서 서로의 노력을 축하하며 메달을 나눠 끼워 주었어요.",
  "174": "알록달록한 판을 뒤집으며 팀을 응원하고, 뒤집힐 때마다 웃음이 터졌어요.",
  "173": "배턴을 이어 달리며 친구에게 응원을 보내고 호흡을 맞추었어요.",
  "172": "아이와 가족이 한 줄로 서서 힘을 모아 줄을 당겼어요.",
  "171": "커다란 공을 머리 위로 조심스럽게 전달하며 협동심을 키웠어요.",
  "170": "조부모님이 경쾌한 음악에 맞춰 달리며 아이들과 하이파이브를 나누었어요.",
  "169": "졸업한 선배들이 동생들과 손잡고 달리며 멋진 본보기가 되어 주었어요.",
  "168": "자동차 모양 핸들을 잡고 출발선에서 신호를 기다리는 모습이 귀여웠어요.",
  "167": "도넛을 물고 결승선을 통과하는 아빠들의 모습에 아이들이 환호했어요.",
  "166": "엄마들이 발을 묶고 호흡을 맞추며 결승선을 향해 달렸어요.",
  "165": "우리 반 친구들이 번호표를 붙이고 씩씩하게 트랙을 달렸어요.",
  "164": "입장식 행진과 깃발 퍼포먼스로 운동회의 문을 활짝 열었어요.",
};

async function fetchEventList(requestContext: APIRequestContext): Promise<LegacyEventListItem[]> {
  const html = await fetchHtml(requestContext, EVENT_LIST_URL);
  const root = parse(html);
  const anchors = root.querySelectorAll("ul.class_list01 li a");
  const items: LegacyEventListItem[] = [];

  for (const anchor of anchors) {
    const href = anchor.getAttribute("href");
    if (!href) continue;
    const urlObj = new URL(href, BASE_URL);
    const legacyId = urlObj.searchParams.get("no");
    if (!legacyId) continue;
    const title = anchor.querySelector("strong")?.text.trim() ?? "제목 미지정";
    const thumb = anchor.querySelector("img")?.getAttribute("src") ?? undefined;
    items.push({ legacyId, listTitle: title, thumbUrl: thumb ? absolutize(thumb) : undefined });
  }

  return items.slice(0, MAX_ITEMS);
}

async function fetchEventDetail(requestContext: APIRequestContext, legacyId: string): Promise<LegacyEventDetail> {
  const html = await fetchHtml(requestContext, `${EVENT_VIEW_URL}?no=${legacyId}`);
  const root = parse(html);
  const title = root.querySelector("th.view_tit01")?.text.trim() ?? "행사";
  const dateMatch = html.match(/등록일<\/strong>\s*<span>([^<]+)<\/span>/);
  const publishDate = dateMatch ? new Date(dateMatch[1]) : new Date();
  const contentCell = root.querySelector("td.view_content");
  const rawText = contentCell?.text.trim().replace(/\s+/g, " ") ?? "";
  const summary = rawText.slice(0, 160);
  const attachments = (contentCell?.querySelectorAll("img") ?? [])
    .map((img) => ({
      url: absolutize(img.getAttribute("src") ?? ""),
      alt: img.getAttribute("alt") ?? title,
    }))
    .filter((item) => Boolean(item.url));

  return {
    title,
    publishDate,
    summary: summary || undefined,
    attachments,
  };
}

async function insertEvent(detail: LegacyEventDetail, item: LegacyEventListItem) {
  const description = buildFriendlyDescription(detail, item);
  const createdAt = detail.publishDate ?? new Date();
  const marker = formatLegacyMarker(item.legacyId);

  const eventResult = await sql`
    INSERT INTO class_schedules (
      title,
      description,
      start_date,
      end_date,
      location,
      event_type,
      status,
      audience_scope,
      cancellation_reason,
      created_at,
      updated_at
    )
    VALUES (
      ${detail.title},
      ${description},
      ${createdAt},
      ${createdAt},
      ${"신촌몬테소리"},
      ${"other"},
      ${"published"},
      ${"all"},
      ${marker},
      ${createdAt},
      ${createdAt}
    )
    RETURNING id
  `;

  const scheduleId = eventResult.rows[0].id as string;
  const resources = detail.attachments.length
    ? detail.attachments
    : item.thumbUrl
    ? [{ url: item.thumbUrl, alt: detail.title }]
    : [];

  for (const resource of resources) {
    await sql`
      INSERT INTO class_schedule_resources (schedule_id, file_url, label, media_type, created_at)
      VALUES (
        ${scheduleId},
        ${resource.url},
        ${resource.alt ?? detail.title},
        ${"image"},
        ${createdAt}
      )
    `;
  }
}

async function updateEvent(eventId: string, detail: LegacyEventDetail, item: LegacyEventListItem) {
  const description = buildFriendlyDescription(detail, item);
  const createdAt = detail.publishDate ?? new Date();
  const marker = formatLegacyMarker(item.legacyId);

  await sql`
    UPDATE class_schedules
    SET
      title = ${detail.title},
      description = ${description},
      start_date = ${createdAt},
      end_date = ${createdAt},
      location = ${"신촌몬테소리"},
      event_type = ${"other"},
      status = ${"published"},
      audience_scope = ${"all"},
      cancellation_reason = ${marker},
      updated_at = ${new Date()}
    WHERE id = ${eventId}
  `;

  await sql`DELETE FROM class_schedule_resources WHERE schedule_id = ${eventId}`;

  const resources = detail.attachments.length
    ? detail.attachments
    : item.thumbUrl
    ? [{ url: item.thumbUrl, alt: detail.title }]
    : [];

  for (const resource of resources) {
    await sql`
      INSERT INTO class_schedule_resources (schedule_id, file_url, label, media_type, created_at)
      VALUES (
        ${eventId},
        ${resource.url},
        ${resource.alt ?? detail.title},
        ${"image"},
        ${createdAt}
      )
    `;
  }
}

async function findExistingEvent(legacyId: string): Promise<string | null> {
  const marker = formatLegacyMarker(legacyId);
  const { rows } = await sql`SELECT id FROM class_schedules WHERE cancellation_reason = ${marker} LIMIT 1`;
  if (rows.length) {
    return rows[0].id as string;
  }

  const fallback = `%[LEGACY_EVENT_ID:${legacyId}]%`;
  const legacyRows = await sql`SELECT id FROM class_schedules WHERE description LIKE ${fallback} LIMIT 1`;
  return legacyRows.length ? (legacyRows[0].id as string) : null;
}

function formatLegacyMarker(legacyId: string) {
  return `LEGACY_EVENT_ID:${legacyId}`;
}

function buildFriendlyDescription(detail: LegacyEventDetail, item: LegacyEventListItem) {
  const override = friendlyDescriptionOverrides[item.legacyId];
  if (override) {
    return override;
  }

  const raw = (detail.summary ?? "").trim();
  if (raw.length >= 24) {
    return raw;
  }

  const cleanedTitle = detail.title.replace(/\s+/g, " ").trim();
  const keyword = cleanedTitle.replace("신촌 한마음 가족 운동회", "").replace(/[-–]/g, " ").trim();

  if (cleanedTitle.includes("운동회")) {
    const activity = keyword.length ? `${keyword} 순서에서 ` : "현장에서 ";
    return `신촌 한마음 가족 운동회 ${activity}아이들과 가족들이 웃음과 응원 속에 함께 뛰었어요.`;
  }

  return `${cleanedTitle} 현장의 생생한 순간을 사진으로 만나보세요.`;
}

function absolutize(url: string) {
  if (!url) return url;
  if (url.startsWith("http")) return url;
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
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw lastError ?? new Error(`Unknown error while fetching ${url}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
