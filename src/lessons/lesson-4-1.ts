import type { LessonDefinition } from "./types";

export const lesson_4_1: LessonDefinition = {
  id: "4-1",
  title: "The Repeat Button (For Loops)",
  questions: [
    {
      kind: "singleChoice",
      id: "4-1-q1",
      prompt: "Duo wants to print the word Hello 100 times. Why should he use a loop?",
      options: [
        "To make the computer run slower.",
        "To save time and avoid writing 100 lines of code.",
        "Because Hello is a long word.",
      ],
      correctAnswer: "To save time and avoid writing 100 lines of code.",
    },
    {
      kind: "singleChoice",
      id: "4-1-q2",
      prompt: "Look at the code below. How many times will Duo bark?",
      contextLines: ["1. for i in range(3):", "2.     print(\"Woof!\")"],
      options: ["1 time", "3 times", "0 times"],
      correctAnswer: "3 times",
    },
    {
      kind: "tokenAssemble",
      id: "4-1-q3",
      prompt: "Duo wants to repeat an action 5 times. Put the pieces in order!",
      contextLines: ["Tap tokens to fill boxes from left to right. Tap a filled box to remove it."],
      slotCount: 5,
      tokens: [":", "for", "range(5)", "i", "in"],
      correctOrder: ["for", "i", "in", "range(5)", ":"],
    },
    {
      kind: "singleChoice",
      id: "4-1-q4",
      prompt: "Which block of code will actually repeat the jump()?",
      options: [
        "A)\nfor i in range(2):\njump()",
        "B)\nfor i in range(2):\n    jump()",
      ],
      correctAnswer: "A)\nfor i in range(2):\njump()",
    },
    {
      kind: "singleChoice",
      id: "4-1-q5",
      prompt:
        "In the loop for i in range(5):, the letter i tracks which lap the loop is on. What number does it usually start at in coding?",
      options: ["0", "1", "5"],
      correctAnswer: "0",
    },
    {
      kind: "shortAnswer",
      id: "4-1-q6",
      prompt: "To make a loop run exactly 10 times, you should use range(___).",
      placeholder: "Type your answer",
      acceptableAnswers: ["10"],
      caseSensitive: true,
    },
    {
      kind: "multiSelect",
      id: "4-1-q7",
      prompt: "Which of these are real-life examples of a for loop?",
      contextLines: ["Select 3 choices, then press Submit."],
      options: [
        "Doing 10 jumping jacks.",
        "Choosing between cake or pie.",
        "Blinking your eyes 3 times.",
        "Setting the microwave for 30 seconds.",
      ],
      correctAnswers: [
        "Doing 10 jumping jacks.",
        "Blinking your eyes 3 times.",
        "Setting the microwave for 30 seconds.",
      ],
      requiredSelectionCount: 3,
    },
    {
      kind: "singleChoice",
      id: "4-1-q8",
      prompt: "What is the final result of this loop?",
      contextLines: [
        "1. total = 0",
        "2. for i in range(3):",
        "3.     total = total + 1",
      ],
      options: ["1", "2", "3"],
      correctAnswer: "3",
    },
    {
      kind: "singleChoice",
      id: "4-1-q9",
      prompt:
        "A for loop with a range has a clear start and end. What happens if a loop never ends?",
      options: [
        "The computer gets faster.",
        "The program might freeze or crash.",
        "Duo gets a gold medal.",
      ],
      correctAnswer: "The program might freeze or crash.",
    },
    {
      kind: "matchDrag",
      id: "4-1-q10",
      prompt: "Match the loop to the shape it would draw!",
      leftItems: [
        "Repeat 3 times: Draw line, Turn 120°",
        "Repeat 4 times: Draw line, Turn 90°",
        "Repeat 1 time: Draw line",
      ],
      draggableValues: ["Triangle", "Square", "Single Line"],
      correctValues: ["Triangle", "Square", "Single Line"],
      appendEqualsToLeftItems: false,
    },
  ],
};

