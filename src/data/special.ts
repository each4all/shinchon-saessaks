export type SpecialFeature = {
	title: string;
	description: string;
	badge: string;
};

export type SpecialContent = {
	heroTitle: string;
	heroSubtitle: string;
	heroBody: string[];
	features: SpecialFeature[];
};

export const specialContent: SpecialContent = {
	heroTitle: "기독교 세계관과 몬테소리 철학이 만나는 교육",
	heroSubtitle:
		"정상화(Normalized Child)된 아이를 세우기 위해 준비된 환경과 교구 활동, 그리고 성경적 가치로 하루를 채웁니다.",
	heroBody: [
		"기독교 세계관과 몬테소리 교육 철학에 입각하여 교실과 교구를 준비하고, 매일의 작업을 통해 아이 스스로 집중과 질서를 회복하도록 돕습니다.",
		"성경을 통해 하나님을 아버지로 알고 사랑하며 말씀 안에서 기쁘게 성장하고, 21세기에 필요한 창의성과 책임감을 갖춘 세계 속의 리더로 자라나도록 교육 목적을 두고 있습니다.",
	],
	features: [
		{
			title: "하와이 열방대학교(UofN) 비브리컬 교육 프로그램 운영",
			description: "말씀으로 하루를 여는 비브리컬 커리큘럼을 통해 영성과 가치관을 세웁니다.",
			badge: "성경교육",
		},
		{
			title: "누리과정을 기반으로 한 정통 몬테소리 수업",
			description: "국가 누리과정과 몬테소리 철학을 정교하게 접목해 연간·월간 계획을 세웁니다.",
			badge: "교육과정",
		},
		{
			title: "유치원과 지역사회 공간을 활용한 생태 유아교육",
			description: "숲, 생태 놀이터, 지역 공원으로 나가 자연 속에서 배우고 느끼는 프로그램을 운영합니다.",
			badge: "생태",
		},
		{
			title: "효율적인 몬테소리를 위한 혼합 연령반",
			description: "형·동생이 함께 생활하며 사회성, 배려, 리더십을 기르는 연령 혼합 환경을 유지합니다.",
			badge: "몬테소리",
		},
		{
			title: "성경 중심 인성지도 연구 및 실천",
			description: "사랑·존중·감사의 태도를 생활화하기 위한 교육 방법을 꾸준히 연구하고 현장에 반영합니다.",
			badge: "인성",
		},
		{
			title: "관찰 기반 맞춤형 지도를 위한 시차별 수업",
			description: "교사의 세밀한 관찰로 각 아동의 발달 단계에 맞춘 개별 지도를 제공합니다.",
			badge: "맞춤형",
		},
		{
			title: "국제 몬테소리 교사 자격증을 갖춘 전문 교사진",
			description: "AMI·AMS 등 국제 자격을 보유한 교사가 책임감을 갖고 학급을 이끕니다.",
			badge: "교사진",
		},
		{
			title: "숙명여대 등 유아교육 산학협력 네트워크",
			description: "숙명여자대학교 몬테소리 교사 교육기관과 연계해 연구·실습을 이어갑니다.",
			badge: "협력",
		},
		{
			title: "일본 아케노호시 유치원과 자매 결연",
			description: "국제 자매 유치원과의 교류로 글로벌 감수성과 교육 품질을 넓혀 갑니다.",
			badge: "글로벌",
		},
	],
};
