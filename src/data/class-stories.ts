export type ClassStoryGalleryItem = {
	src: string;
	caption: string;
};

export type ClassStoryTab = {
	key: string;
	label: string;
	classroomName: string;
	description: string;
	heroImage: string;
	heroAlt: string;
	goals: string[];
	gallery: ClassStoryGalleryItem[];
};

export const classStoryTabs: ClassStoryTab[] = [
	{
		key: "gaenari",
		label: "개나리반",
		classroomName: "개나리반",
		description:
			"3세 아이들이 생활습관을 익히고 감각 놀이로 하루를 여는 반입니다. 스스로 정리하고 친구를 기다릴 줄 아는 연습을 매일 합니다.",
		heroImage: "/images/environment/interior/interior-01.jpg",
		heroAlt: "개나리반 생활 영역",
		goals: ["생활습관", "감각 놀이", "기초 협력"],
		gallery: [
			{ src: "/images/environment/interior/interior-02.jpg", caption: "세숫대야 감각 놀이" },
			{ src: "/images/environment/interior/interior-03.jpg", caption: "정리 정돈 챌린지" },
			{ src: "/images/environment/outside/outside-01.jpg", caption: "마당 햇살 놀이" },
		],
	},
	{
		key: "mindeulle",
		label: "민들레반",
		classroomName: "민들레반",
		description:
			"4세 민들레반은 성경 이야기와 프로젝트 놀이로 이야기 구성력을 키워요. 주 1회 텃밭에서 생태 관찰을 합니다.",
		heroImage: "/images/environment/interior/interior-04.jpg",
		heroAlt: "민들레반 프로젝트 보드",
		goals: ["성경 스토리", "소그룹 프로젝트", "생태 관찰"],
		gallery: [
			{ src: "/images/environment/outside/outside-02.jpg", caption: "창조의 뜰 텃밭" },
			{ src: "/images/environment/interior/interior-05.jpg", caption: "성경 이야기 시간" },
			{ src: "/images/environment/outside/outside-03.jpg", caption: "자연물 미술" },
		],
	},
	{
		key: "baekhap",
		label: "백합반",
		classroomName: "백합반",
		description:
			"5세 백합반은 리더십과 문해력을 키우는 준비반입니다. 글자를 활용한 뉴스 만들기와 친구 인터뷰 활동을 즐겨요.",
		heroImage: "/images/environment/interior/interior-06.jpg",
		heroAlt: "백합반 문해력 활동",
		goals: ["리더십", "문해력", "협동"],
		gallery: [
			{ src: "/images/environment/interior/interior-01.jpg", caption: "뉴스룸 역할놀이" },
			{ src: "/images/environment/outside/outside-04.jpg", caption: "체육 활동" },
			{ src: "/images/environment/outside/outside-05.jpg", caption: "팀 프로젝트" },
		],
	},
	{
		key: "jangmi",
		label: "장미반",
		classroomName: "장미반",
		description:
			"믿음·감사 프로젝트로 하루를 설계하는 장미반입니다. 주제 노래와 말씀 암송을 통해 영성 습관을 세웁니다.",
		heroImage: "/images/environment/interior/interior-03.jpg",
		heroAlt: "장미반 예배 시간",
		goals: ["예배", "감사 일기", "사회성"],
		gallery: [
			{ src: "/images/environment/outside/outside-06.jpg", caption: "감사 산책" },
			{ src: "/images/environment/interior/interior-02.jpg", caption: "찬양 율동" },
			{ src: "/images/environment/interior/interior-05.jpg", caption: "감사 카드 만들기" },
		],
	},
	{
		key: "after-school",
		label: "방과후 과정",
		classroomName: "방과후 과정",
		description:
			"오후 방과후 과정에서는 리듬체조, 영어동화, 과학 탐구 등 선택 프로그램으로 흥미를 확장합니다.",
		heroImage: "/images/environment/outside/outside-03.jpg",
		heroAlt: "방과후 야외 수업",
		goals: ["선택 활동", "특기 개발", "협업"],
		gallery: [
			{ src: "/images/environment/outside/outside-01.jpg", caption: "리듬체조 연습" },
			{ src: "/images/environment/outside/outside-02.jpg", caption: "과학 탐구" },
			{ src: "/images/environment/outside/outside-04.jpg", caption: "영어 동화" },
		],
	},
];
