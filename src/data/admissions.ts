export type AdmissionStep = {
	label: string;
	description: string;
};

export type ProgramInfo = {
	title: string;
	details: string[];
	tag: string;
	groupsLabel?: string;
	groups?: string[];
};

export type AdmissionsContent = {
	steps: AdmissionStep[];
	programs: ProgramInfo[];
};

export const admissionsContent: AdmissionsContent = {
	steps: [
		{
			label: "방문 및 면담",
			description:
				"입학 절차는 학부모와 아동이 함께 방문하시어 인터뷰를 마친 뒤 입학 접수를 진행합니다.",
		},
		{
			label: "관찰 및 리포트",
			description: "관찰을 통해 아동 발달 상황을 리포트하며 가정과 유기적인 관계를 유지합니다.",
		},
		{
			label: "상담과 워크숍",
			description:
				"유아의 학습·정서·심리 문제를 함께 상담하며 Workshop, Conference를 통해 전문가 의견을 듣습니다.",
		},
		{
			label: "부모 교육",
			description:
				"부모교육 강좌와 몬테소리 Workshop을 월 1회 체계적으로 실시해 자녀 양육 실천을 돕습니다.",
		},
	],
	programs: [
		{
			title: "기본 교육과정",
			details: [
				"3년 과정으로 구성된 정통 몬테소리 교육이며 혼합 연령·시차제 수업으로 환경을 구성합니다.",
				"준비된 교실에서 개나리·민들레·백합·장미반으로 편성해 집중 작업을 이어갑니다.",
			],
			tag: "정규반",
			groupsLabel: "구분",
			groups: ["개나리반", "민들레반", "백합반", "장미반"],
		},
		{
			title: "방과후 과정",
			details: [
				"정규 수업을 마친 후 가정과 같은 안정된 환경에서 생활과 교육이 함께 진행되도록 운영합니다.",
				"연간 요리 활동과 자연친화 교육을 직접 체험해 공동체 속에서 행복한 일상을 돕습니다.",
			],
			tag: "방과후",
			groupsLabel: "구분",
			groups: ["기쁨반", "행복반", "사랑반"],
		},
	],
};
