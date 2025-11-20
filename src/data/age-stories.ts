export type AgeStoryTab = {
  key: string;
  label: string;
  classroomName: string;
  description: string;
};

export const ageStoryTabs: AgeStoryTab[] = [
  {
    key: "age-a",
    label: "A그룹",
    classroomName: "A그룹",
    description: "탐색·감각 활동을 중심으로 호기심을 키우는 연령 그룹입니다.",
  },
  {
    key: "age-b",
    label: "B그룹",
    classroomName: "B그룹",
    description: "문화·예술·생태 프로젝트로 사고력과 공감력을 기르는 친구들입니다.",
  },
  {
    key: "age-c",
    label: "C그룹",
    classroomName: "C그룹",
    description: "졸업 준비 및 리더십 경험을 쌓는 연령 그룹입니다.",
  },
];
