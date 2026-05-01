export type ComparisonOp = ">" | ">=" | "<" | "<=" | "==" | "!=";

export type BinaryChoiceQuestion = {
  kind: "binary";
  id: string;
  prompt: string;
  signTitle: string;
  signSubtitle: string;
  options: readonly ["YES", "NO"];
  correctAnswer: "YES" | "NO";
};

export type SingleChoiceQuestion = {
  kind: "singleChoice";
  id: string;
  prompt: string;
  contextLines?: string[];
  options: string[];
  correctAnswer: string;
  hintText?: string;
  explanationOnCorrect?: string;
};

export type MultiSelectQuestion = {
  kind: "multiSelect";
  id: string;
  prompt: string;
  contextLines?: string[];
  options: string[];
  correctAnswers: string[];
  requiredSelectionCount: number;
  layoutColumns?: number;
};

export type MatchDragQuestion = {
  kind: "matchDrag";
  id: string;
  prompt: string;
  contextLines?: string[];
  leftItems: string[];
  draggableValues: string[];
  correctValues: string[];
  appendEqualsToLeftItems?: boolean;
};

export type TokenAssembleQuestion = {
  kind: "tokenAssemble";
  id: string;
  prompt: string;
  contextLines?: string[];
  slotCount: number;
  slotRows?: number;
  tokens: string[];
  correctOrder: string[];
  correctOrders?: string[][];
  allowPartialFill?: boolean;
  codePrefix?: string;
  codeSuffix?: string;
};

export type OrderQuestion = {
  kind: "order";
  id: string;
  prompt: string;
  contextLines?: string[];
  options: string[];
  correctOrders: string[][];
};

export type CounterQuestion = {
  kind: "counter";
  id: string;
  prompt: string;
  goal: "TRUE" | "FALSE";
  statement: {
    variable: "x";
    op: ComparisonOp;
    value: number;
  };
  initialValue?: number;
};

export type TypingQuestion = {
  kind: "typing";
  id: string;
  prompt: string;
  code: string;
};

export type ShortAnswerQuestion = {
  kind: "shortAnswer";
  id: string;
  prompt: string;
  contextLines?: string[];
  placeholder?: string;
  acceptableAnswers: string[];
  caseSensitive?: boolean;
  inputPrefix?: string;
  statusEmoji?: string;
  statusEmojiCrossOnCorrect?: boolean;
  hintText?: string;
};

export type LessonQuestion =
  | BinaryChoiceQuestion
  | SingleChoiceQuestion
  | MultiSelectQuestion
  | MatchDragQuestion
  | TokenAssembleQuestion
  | OrderQuestion
  | CounterQuestion
  | TypingQuestion
  | ShortAnswerQuestion;

export type LessonDefinition = {
  id: string;
  title: string;
  questions: LessonQuestion[];
};

