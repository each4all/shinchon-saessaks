export interface MontessoriArea {
	id: string;
	title: string;
	highlightLabel: string;
	description: string;
}

export const montessoriIntro = {
	tagline: "마리아 몬테소리(1870~1952)에 의해 창안된 교육프로그램",
	headline: "일상, 감각, 수, 언어, 문화 5개의 교육 영역",
	description:
		"준비된 환경 속에서 스스로 탐색하고 선택하며 자율적이고 성취감 있는 어린이가 되도록 돕고, 집중력과 독립심, 질서감을 키워 자신의 능력을 최대한 발휘할 수 있도록 안내합니다.",
};

export const montessoriAreas: MontessoriArea[] = [
	{
		id: "practical-life",
		title: "아이들이 올바르게 성장할 수 있는 일상생활 영역",
		highlightLabel: "일상생활 영역",
		description:
			"유아가 자기 자신과 환경을 가꾸는 법을 배우는 영역으로 학습에 필요한 전반적인 자질을 연마합니다. 집중력, 자립심, 질서감, 근육 발달, 자기조절 능력과 협동심을 익혀 건강한 생활과 올바른 인격 형성을 이룰 수 있게 합니다.",
	},
	{
		id: "sensorial",
		title: "오감을 발달시켜주는 감각 영역",
		highlightLabel: "감각 영역",
		description:
			"구체적이고 과학적인 감각 교구를 가지고 활동하며 시각·청각·촉각·후각·미각 등 오감을 통해 크기, 높이, 길이, 무게, 색, 소리, 모양, 질감 등을 구별합니다. 사물의 분석·기록·적용 능력을 기르고 수 영역과 문화 영역의 기초가 되는 몬테소리 교육의 중심 영역입니다.",
	},
	{
		id: "mathematics",
		title: "수학적 두뇌를 발달시키는 수 영역",
		highlightLabel: "수 영역",
		description:
			"‘수’라는 추상 세계를 교구라는 구체물을 통해 배웁니다. 0~10의 숫자와 양의 개념 형성, 십진법 체계, 연속수, 가감승제 개념 및 계산, 분수 등 수에 대한 정확한 개념을 파악해 수학적 두뇌와 논리적 사고를 발달시킵니다.",
	},
	{
		id: "language",
		title: "감각적이고 체계적인 언어 영역",
		highlightLabel: "언어 영역",
		description:
			"유치원에 들어오면서부터 시작되는 언어 교육은 교구를 통해 감각적이고 체계적으로 접근하여 말하기, 듣기, 쓰기, 읽기 등이 총체적으로 발달하도록 돕습니다.",
	},
	{
		id: "culture",
		title: "새로운 지식과 환경을 익히는 문화 영역",
		highlightLabel: "문화 영역",
		description:
			"4~7세 연령에 적합한 다양한 교구로 세계의 지리·역사·문화·지질·동식물학 등을 탐구합니다. 급격하게 변하는 세계에 대응하여 새로운 체계의 지식과 환경을 익히고, 자신을 둘러싼 자연과 생명을 발전시키며 전개해 나갑니다.",
	},
];
