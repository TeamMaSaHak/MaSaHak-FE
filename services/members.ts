import { get } from "./api-client";

export interface MemberProfile {
  profileImage: string;
  nickname: string;
  studentNo: string;
  grade: number;
  gradeName: string;
  dormitory: string;
  totalSeconds: number;
  level: number;
  levelName: string;
  joinedAt: string;
}

export function getProfile() {
  return get<MemberProfile>("/api/members/profile");
}
