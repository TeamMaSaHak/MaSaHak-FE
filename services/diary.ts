import { get, put } from "./api-client";

export interface DiaryReply {
  replyId: number;
  content: string;
  createdAt: string;
}

export interface DiaryEntry {
  diaryId: number | null;
  date: string;
  content: string | null;
  isLocked: boolean;
  canEdit: boolean;
  reply: DiaryReply | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface DiarySaveResult {
  diaryId: number;
  date: string;
  content: string;
  isCreated: boolean;
  savedAt: string;
}

export function getDiary(date: string) {
  return get<DiaryEntry>(`/api/diary/${date}`);
}

export function saveDiary(date: string, content: string) {
  return put<DiarySaveResult>(`/api/diary/${date}`, { content });
}
