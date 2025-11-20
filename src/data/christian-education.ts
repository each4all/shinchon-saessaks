export type ChristianPillar = {
	id: string;
	title: string;
	description: string;
};

export type ChristianSponsor = {
	id: string;
	classroomLabel: string;
	childName: string;
	englishName?: string;
	photoUrl: string;
	birth: string;
	gender: string;
	country: string;
	story: string[];
	favorites?: string[];
	prayerFocus?: string;
};

export const christianIntro = {
	tagline: "열방대학 기독교 유아교육 과정",
	headline: "말씀과 기도로 성장하는 통합 커리큘럼",
	description: [
		"열방대학 기독교 유아교육 과정은 성경을 중심으로 한 주제를 유아 발달 단계에 맞춘 일반 교육 내용과 연결해 통합한 커리큘럼입니다. 1970년 ‘하나님의 방법으로 어린이를 감동시키는 교육’을 꿈꾸며 시작했고, 15년 이상 현장에서 적용·연구·평가하며 다듬은 실제 프로그램입니다.",
		"성경, 기도, 실천적 적용, 창조 수업을 교육과정의 주제와 연결하여 건강·사회·언어·탐구·표현 생활 영역에서 다양한 창의 활동으로 재구성하고 있습니다.",
	],
};

export const christianPillars: ChristianPillar[] = [
	{
		id: "bible",
		title: "성경",
		description: "성서 원칙을 설명하고 하나님의 성품과 말씀을 함께 나누는 시간입니다.",
	},
	{
		id: "prayer",
		title: "기도",
		description: "어린이들이 하나님과 마음을 나누며 기도의 습관을 세우는 소통의 시간입니다.",
	},
	{
		id: "practice",
		title: "실천적 적용",
		description:
			"성서적 원칙을 이야기·토의·역할극·게임 등으로 풀어 실제 생활 속에 적용해 보는 시간입니다.",
	},
	{
		id: "creation",
		title: "창조",
		description: "주제와 연결된 창조의 관점을 탐구하고 하나님의 창조물을 조사하며 감사함을 배우는 시간입니다.",
	},
];

export const christianSponsors: ChristianSponsor[] = [
	{
		id: "gaenari",
		classroomLabel: "개나리반 후원어린이",
		childName: "제임스",
		englishName: "James",
		photoUrl: "https://www.shinchonkid.com/web/images/txt/education02_img01.jpg",
		birth: "2003.01.18",
		gender: "남자",
		country: "필리핀",
		story: [
			"제임스는 부모님과 함께 살고 있습니다.",
			"아버지는 임시직으로 도축장에서 일을 하시며 어머니는 집안일을 하십니다.",
			"제임스는 집안에서 땔감 모으기, 심부름, 청소, 가축돌보기, 물 길어 나르기를 맡아서 합니다.",
			"이 가정에는 5명의 아이가 있습니다.",
			"컴패션 사역의 일환으로 제임스는 성경학교에 잘 참여하고 있습니다.",
			"제임스의 학업성적은 보통 수준이고 수학 과목을 좋아합니다.",
			"제임스는 농구, 수영, 숨바꼭질, 배구, 달리기, 독서, 그림 그리기, 그룹게임, 노래 부르기, 음악듣기, 공놀이, 산책을 좋아합니다.",
			"원장님의 사랑과 정성이 제임스의 잠재적 능력을 발달시키는 데에 큰 도움이 될 것입니다.",
			"후원자님의 사랑과 기도에 감사드립니다.",
		],
	},
	{
		id: "mindeulle",
		classroomLabel: "민들레반 후원어린이",
		childName: "오호",
		photoUrl: "https://www.shinchonkid.com/web/images/txt/education02_img02.jpg",
		birth: "2010.04.15",
		gender: "여자",
		country: "부르키나파소",
		story: [
			"오호는 아버지와 어머니의 보살핌을 받고 있습니다.",
			"아버지는 임시직 광부로 일하시며 어머니는 집안일을 하십니다.",
			"오호는 집안에서 부엌일 돕기, 심부름을 맡아서 합니다.",
			"이 가정에 다른 아이는 없습니다.",
			"컴패션 사역의 일환으로 오호는 성경공부모임에 잘 참여하고 있습니다.",
			"오호는 인형놀이, 그룹게임, 줄넘기, 노래 부르기를 좋아합니다.",
			"후원자님의 사랑과 정성은 오호가 영육간에 강건하게 잘 성장하는 데에 큰 도움이 될 것입니다.",
			"오호를 위해 기도해 주십시오.",
		],
	},
	{
		id: "baekhap",
		classroomLabel: "백합반 후원어린이",
		childName: "모하이트",
		photoUrl: "https://www.shinchonkid.com/web/images/txt/education02_img03.jpg",
		birth: "2002.04.04",
		gender: "남자",
		country: "인도",
		story: [
			"모하이트는 부모님과 함께 살고 있습니다.",
			"아버지와 어머니는 임시직으로 노동일을 하십니다.",
			"모하이트는 시장에서 물건 사고 팔기, 집안에서 부엌일 돕기, 청소, 물 길어 나르기를 맡아서 합니다.",
			"컴패션 사역의 일환으로 모하이트는 주일학교, 성경학교에 잘 참여하고 있습니다.",
			"모하이트의 학업성적은 보통 수준이고 국어 과목을 좋아합니다.",
			"모하이트는 달리기, 독서, 그림 그리기, 그룹게임, 산책을 좋아합니다.",
			"후원자님의 사랑과 정성은 모하이트가 영육간에 강건하게 잘 성장하는 데에 큰 도움이 될 것입니다.",
			"아이를 위해 기도해 주십시오.",
		],
	},
	{
		id: "jangmi",
		classroomLabel: "장미반 후원어린이",
		childName: "스와폰",
		photoUrl: "https://www.shinchonkid.com/web/images/txt/education02_img04.jpg",
		birth: "2007.12.13",
		gender: "남자",
		country: "방글라데시",
		story: [
			"스와폰은 부모님과 함께 살고 있습니다.",
			"아버지는 운전사로 일하시며 어머니는 집안일을 하십니다.",
			"스와폰은 집안에서 심부름, 동생 돌보기를 맡아서 합니다.",
			"이 가정에는 2명의 아이가 있습니다.",
			"컴패션 사역의 일환으로 스와폰은 성경공부모임에 잘 참여하고 있습니다.",
			"스와폰의 학업성적은 보통 수준이고 국어 과목을 좋아합니다.",
			"스와폰은 구슬놀이, 그룹게임, 축구를 좋아합니다.",
			"스와폰을 기억하고 기도해 주십시오. 후원자님의 사랑과 후원이 아이가 잘 자라고 성장하는 데에 큰 도움이 될 것입니다.",
		],
	},
];

export const compassionCta = {
	heading: "컴패션 후원의 시작, 1:1 어린이 양육",
	description: "한 어린이의 인생에 희망을 줄 수 있는 사랑의 동행을 기다리고 있습니다.",
	buttonLabel: "컴패션 후원 페이지로 이동",
	url: "https://www.compassion.or.kr/",
	bannerUrl: "https://www.shinchonkid.com/web/images/txt/compasion.jpg",
};
