import type { LessonDefinition } from "./types";
import { lesson_1_1 } from "./lesson-1-1";
import { lesson_1_2 } from "./lesson-1-2";
import { lesson_1_3 } from "./lesson-1-3";
import { lesson_2_1 } from "./lesson-2-1";
import { lesson_2_2 } from "./lesson-2-2";
import { lesson_2_3 } from "./lesson-2-3";
import { lesson_3_1 } from "./lesson-3-1";
import { lesson_3_2 } from "./lesson-3-2";
import { lesson_3_3 } from "./lesson-3-3";
import { lesson_3_4 } from "./lesson-3-4";
import { lesson_4_1 } from "./lesson-4-1";
import { lesson_4_2 } from "./lesson-4-2";
import { lesson_4_4 } from "./lesson-4-4";

const LESSONS: Record<string, LessonDefinition> = {
  [lesson_1_1.id]: lesson_1_1,
  [lesson_1_2.id]: lesson_1_2,
  [lesson_1_3.id]: lesson_1_3,
  [lesson_2_1.id]: lesson_2_1,
  [lesson_2_2.id]: lesson_2_2,
  [lesson_2_3.id]: lesson_2_3,
  [lesson_3_1.id]: lesson_3_1,
  [lesson_3_2.id]: lesson_3_2,
  [lesson_3_3.id]: lesson_3_3,
  [lesson_3_4.id]: lesson_3_4,
  [lesson_4_1.id]: lesson_4_1,
  [lesson_4_2.id]: lesson_4_2,
  [lesson_4_4.id]: lesson_4_4,
};

export function getLessonDefinition(lessonId: string | undefined) {
  if (!lessonId) return null;
  return LESSONS[lessonId] ?? null;
}

