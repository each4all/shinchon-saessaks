export type IdeologyPillar = {
	title: string;
	description: string;
	imageSrc: string;
	imageAlt: string;
};

export type MottoContent = {
	title: string;
	description: string;
	imageSrc: string;
	imageAlt: string;
};

export type IdeologyContent = {
	motto: MottoContent;
	pillars: IdeologyPillar[];
};

export const ideologyContent: IdeologyContent = {
	motto: {
		title: "원훈",
		description: "사랑하고 지혜롭고 건강한 어린이",
		imageSrc: "/images/ideology/logo.jpg",
		imageAlt: "신촌몬테소리유치원 로고",
	},
	pillars: [
		{
			title: "하나님의 넓고 따뜻한 사랑 안에서 사랑을 키워나가는 어린이",
			description: "해처럼 따뜻한 사랑의 빛을 받고 서로를 품는 아이를 상징합니다.",
			imageSrc: "/images/ideology/sun.jpg",
			imageAlt: "해를 형상화한 아이콘",
		},
		{
			title: "유아에게 적합한 준비된 환경 안에서 지혜를 키워 나가는 어린이",
			description: "집과 같은 안전한 교실 환경에서 탐구하며 자라는 모습을 담았습니다.",
			imageSrc: "/images/ideology/house.jpg",
			imageAlt: "집을 형상화한 아이콘",
		},
		{
			title: "창조주 하나님이 지으신 자연 속에서 사랑하고 누리는 건강한 어린이",
			description: "지구를 끌어안는 모습으로 자연과 이웃을 사랑하는 마음을 표현했습니다.",
			imageSrc: "/images/ideology/earth.jpg",
			imageAlt: "지구를 형상화한 아이콘",
		},
		{
			title: "세계 속의 리더로 점점 자라나는 신촌유치원 어린이를 상징",
			description: "아이들이 손을 맞잡고 세상으로 나아가는 로고 해석을 아이들 실루엣으로 풀었습니다.",
			imageSrc: "/images/ideology/children.jpg",
			imageAlt: "아이들을 형상화한 아이콘",
		},
	],
};
