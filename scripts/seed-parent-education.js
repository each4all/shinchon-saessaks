const { sql } = require("@vercel/postgres");

async function seed() {
  const entries = [
    {
      slug: "parent-recipe-15",
      title: "부모레시피15-아이 마음을 읽는 경청",
      summary: "아이 마음을 열어 주는 경청법을 정리했습니다.",
      content:
        "아이에게 집중해 듣는 연습을 5단계로 나눠 소개합니다.\n1) 눈높이를 맞추고, 2) 반복해 확인하고, 3) 느낌을 함께 말해주고, 4) 해결책은 조금 뒤에 제안하고, 5) 기도로 마무리합니다.",
      category: "parent_recipe",
    },
    {
      slug: "parent-class-habit",
      title: "학부모교실-가정에서 생활습관 세우기",
      summary: "생활 습관 훈련 워크숍 요약입니다.",
      content: "아침·식사·놀이·잠자리 루틴을 가정에서도 동일한 언어로 연결하는 체크리스트를 공유합니다.",
      category: "parent_class",
    },
    {
      slug: "seminar-joyful-discipline",
      title: "세미나-기쁨으로 징계하기",
      summary: "11월 부모세미나 노트",
      content: "성경적 훈육 키워드 3가지를 정리했습니다.",
      category: "seminar",
    },
  ];

  for (const entry of entries) {
    await sql`
      INSERT INTO parent_education_posts (slug, title, summary, content, category, audience_scope, is_published, publish_at, view_count)
      VALUES (${entry.slug}, ${entry.title}, ${entry.summary}, ${entry.content}, ${entry.category}, 'parents', true, NOW(), 0)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        content = EXCLUDED.content,
        category = EXCLUDED.category,
        is_published = true,
        publish_at = NOW(),
        updated_at = NOW();
    `;
  }
}

seed()
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
