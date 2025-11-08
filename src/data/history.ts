export type HistoryEvent = {
	date?: string;
	description: string;
};

export type HistoryEntry = {
	year: string;
	events: HistoryEvent[];
};

export type HistoryRange = {
	id: string;
	slug: string;
	label: string;
	period: string;
	description?: string;
	entries: HistoryEntry[];
	orderIndex: number;
};

export const schoolHistories: HistoryRange[] = [
	{
		id: "modern",
		slug: "modern",
		label: "2000~현재",
		period: "2000년대 이후",
		description: "창립 40주년과 50주년을 거치며 교육 품질과 환경을 확장한 기록입니다.",
		entries: [
			{
				year: "2019",
				events: [{ date: "02.19", description: "제54회 수료 및 졸업식" }],
			},
			{
				year: "2016",
				events: [{ date: "02.19", description: "제50회 수료 및 졸업식" }],
			},
			{
				year: "2015",
				events: [
					{ date: "12.31", description: "교육복지 유치원 표창 (서부교육청)" },
					{ date: "03.03", description: "제50회 진급 및 입학식" },
					{ date: "02.13", description: "제49회 수료 및 졸업식" },
				],
			},
			{
				year: "2014",
				events: [
					{ date: "12.31", description: "우수교사 표창 (서부교육청)" },
					{ date: "11.13", description: "창립 50주년 기념 예배 및 축하행사" },
				],
			},
			{
				year: "2013",
				events: [{ date: "11.30", description: "유아 인성교육 우수사례 발표 (서울유아교육진흥원)" }],
			},
			{
				year: "2010",
				events: [{ date: "12.31", description: "우수교사 표창 (교육감상)" }],
			},
			{
				year: "2007",
				events: [
					{ date: "12.31", description: "학교경영 및 교육시책 우수유치원 표창 (교육감상)" },
					{ date: "10.23", description: "기본생활습관 은상 수상 (서부교육청)" },
					{ date: "02.15", description: "숙명여자대학교 교육대학원 몬테소리 협력 유치원" },
				],
			},
			{
				year: "2005",
				events: [
					{ date: "12.29", description: "우수 모범 유치원 표창 (서부교육장상)" },
					{ date: "12.28", description: "우수 교육지도자 표창 (교육감상)" },
					{ date: "05.15", description: "우수 지도자 표창 (부총리 겸 교육인적자원부 장관)" },
					{ date: "03.10", description: "제40회 진급 및 입학식" },
					{ date: "02.01", description: "한국방송통신대학교 협력 유치원 위촉" },
				],
			},
			{
				year: "2004",
				events: [
					{ date: "11.09", description: "창립 40주년 기념 예배 및 축하행사" },
					{ date: "03.12", description: "제39회 진급 및 입학식" },
					{ date: "03.02", description: "원장 최병기 선생 취임 (제8대)" },
					{ date: "02.13", description: "제38회 졸업식" },
				],
			},
		],
		orderIndex: 0,
	},
	{
		id: "legacy",
		slug: "legacy",
		label: "1964~2000",
		period: "창립 초기",
		description: "신촌유치원의 개원과 성장 기반을 다진 시기입니다.",
		entries: [
			{
				year: "1996",
				events: [
					{ date: "12.30", description: "우수 유치원 표창 (서울시 교육감상)" },
					{ date: "02.09", description: "서울유아언어교육연구회 협력 유치원" },
				],
			},
			{
				year: "1995",
				events: [{ date: "02.15", description: "원장 전혜실 선생 취임 (제7대)" }],
			},
			{
				year: "1992",
				events: [
					{ date: "12.29", description: "우수 유치원 표창 (서부교육장상)" },
					{ date: "12.05", description: "우수 교육지도자 표창 (교육부 장관상)" },
					{ date: "03.03", description: "1학급 증설 인가 (총 140명)" },
				],
			},
			{
				year: "1988",
				events: [{ date: "12.30", description: "이사장 오창학 목사 취임" }],
			},
			{
				year: "1985",
				events: [{ date: "09.02", description: "신촌교회 증축" }],
			},
			{
				year: "1965",
				events: [
					{ date: "12.12", description: "이사장 홍종각 목사 취임" },
					{ date: "02.19", description: "제1회 졸업식" },
				],
			},
			{
				year: "1964",
				events: [
					{ date: "11.13", description: "신촌유치원 개원 (교육청 인가)" },
					{ date: "07.19", description: "신촌교회 교육위원회에서 유치원 설립 결의" },
				],
			},
		],
		orderIndex: 1,
	},
];
