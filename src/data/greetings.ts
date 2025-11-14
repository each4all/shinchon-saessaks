export type GreetingImage = {
	id: string;
	src: string;
	alt: string;
	captionTitle?: string;
	captionDetail?: string;
	priority?: boolean;
};

export type GreetingProfile = {
	id: string;
	slug: string;
	label: string;
	title: string;
	greetingHeading?: string | null;
	greetingSubheading?: string | null;
	leadText?: string | null;
	credentialHeading?: string | null;
	images: GreetingImage[];
	people: { name: string; role?: string | null }[];
	highlights: { text: string; source?: string | null }[];
	credentials: string[];
	body?: string | null;
	closing?: string | null;
	orderIndex: number;
};

export const greetingProfiles: GreetingProfile[] = [
	{
		id: "chair",
		slug: "chair",
		label: "이사장",
		title: "",
		greetingHeading: null,
		greetingSubheading: null,
		leadText: null,
		credentialHeading: null,
		images: [
			{
				id: "chair-photo-1",
				src: "/images/greetings/chair-1.png",
				alt: "오창학 목사",
				captionTitle: "이사장 오창학 목사",
				captionDetail: "목회학박사",
				priority: false,
			},
			{
				id: "chair-photo-2",
				src: "/images/greetings/chair-2.png",
				alt: "이하준 담임목",
				captionTitle: "이하준 담임목",
				captionDetail: "목회학박사",
				priority: false,
			},
		],
		people: [
			{ name: "오창학 목사", role: "이사장" },
			{ name: "이하준 담임목사", role: "담임목사" },
		],
		highlights: [
			{ text: "마땅히 행할 길을 아이에게 가르치라 그리하면 늙어도 그것을 떠나지 아니하리라", source: "잠언 22장 6절" },
			{ text: "예수께서 가라사대 내가 곧 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라", source: "요한복음 14장 6절" },
		],
		credentials: [],
		body:
			"본원은 1964년 신촌장로교회에서 어린 새싹들에게 길과 진리와 생명이 되시는 예수그리스도를 가르쳐 가정과 교회와 국가, 민족과 하나님 앞에 요긴한 인재가 될 수 있도록 교육하는 것을 목적으로 설립하였습니다. 이 지역사회와 국가와 세계에 필요한 유아교육기관이 되도록 최선을 다하겠습니다.",
		closing: null,
		orderIndex: 0,
	},
	{
		id: "principal",
		slug: "principal",
		label: "원장",
		title: "",
		greetingHeading: "안녕하세요. 신촌유치원 원장 최병기입니다.",
		greetingSubheading: null,
		leadText: null,
		credentialHeading: "원장 약력",
		images: [
			{
				id: "principal-photo",
				src: "/images/greetings/principal-1.jpg",
				alt: "최병기 원장",
				captionTitle: "최병기 원장",
				captionDetail: "원장",
				priority: true,
			},
		],
		highlights: [],
		credentials: [
			"총신대학교 교육학 석사",
			"일본 국제 몬테소리 교육연구 회원",
			"3-6세 몬테소리 국제 자격 (JAM, MIA)",
			"6-9세·0-3세 몬테소리 국제 자격 (AMS)",
			"해외 Pacific Rim Montessori Education 세미나 참석",
			"독일 · 이탈리아 국제 연수",
			"재능대 · 성결대 · 대구가톨릭대 몬테소리 강사",
			"현 숙명여대 평생교육원 몬테소리 강사",
		],
		body: `유아기는 인생에서 가장 중요한 시기입니다. 유아기 정신은 스폰지 같아서 자신이 주위환경을 흡수하여 자신을 발달시켜 미래의 "나"를 만들어 갑니다. 따라서 주위환경을 어떻게 만들어 주느냐에 따라 아이들이 자신의 잠재력 및 능력을 발휘해서 내 것으로 만드느냐 못 만드느냐가 결정됩니다. 아름다운 꽃의 씨앗을 자갈밭이나 음지에 심으면 제대로 자라지 못하는 것과 비유할 수 있습니다. 하나님이 인간을 창조하시기 전에 천지만물을 창조하심으로 인간이 살아가기에 부족함이 없도록 배려하신 것처럼 신촌유치원은 생태공원 창조의 뜰, 숲속놀이터 등의 좋은 자연환경과 구석구석을 과학적이며 풍성한 교재교구로 채워 준비된 교실 환경을 만들고 선생님들의 사랑과 세밀한 관찰과 개별지도로 체계적인 교육을 실시합니다. 신촌유치원은 하나님의 꿈과 기대를 가진 유치원입니다. 기독교 유아교육과정을 통하여 하나님을 알아가고 예수님을 닮아가는 어린이가 되도록 매일매일 진심을 다해 기도하고 연구하며 노력하고 있습니다.

사랑스런 우리 아이들이 신촌 동산에서 그 키와 지혜가 자라나고, 하나님과 사람에게 사랑스러워져 가기를 원하여 신촌유치원의 모든 교직원은 한 마음으로 준비합니다.`,
		closing: "전 교직원들은 우리에게 맡겨진 귀한 유아들을 자율적이며 집중력 있고 창의적이며 자신감 있는 멋진 세계 속의 바른 리더로 키워내는 데 협력을 다할 것을 약속드립니다.",
		people: [],
		orderIndex: 1,
	},
	{
		id: "teachers",
		slug: "teachers",
		label: "교사",
		title: "신촌유치원은 유아교육을 전공하고 교육경력이 풍부한 최고의 교사들이 함께합니다.",
		leadText: null,
		credentialHeading: null,
		images: [
			{
				id: "teachers-photo",
				src: "/images/greetings/teachers-1.jpg",
				alt: "신촌몬테소리 교사진",
				captionTitle: "신촌몬테소리 교사진",
				captionDetail: "담임·전담 교사",
				priority: false,
			},
		],
		people: [],
		highlights: [],
		credentials: [],
		body:
			"신촌유치원 교사는 하나님을 사랑하고 하나님이 맡겨주신 어린이들을 사랑하며 아이들을 가장 귀하게 여깁니다. 아이들을 위해 늘 기도하고 끊임없이 연구하며 아이들이 신촌유치원에서 행복하고 평안함을 느낄 수 있도록 하기 위해 노력하고 있습니다.",
		closing: null,
		orderIndex: 2,
	},
];
