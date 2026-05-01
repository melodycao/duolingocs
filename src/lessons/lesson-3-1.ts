import type { LessonDefinition } from "./types";

export const lesson_3_1: LessonDefinition = {
  id: "3-1",
  title: "If This Then That (Conditionals)",
  questions: [
    {
      kind: "singleChoice",
      id: "3-1-q1",
      prompt: "An if statement only runs its code if the condition is...",
      options: ["True", "False", "Number 10"],
      correctAnswer: "True",
    },
    {
      kind: "tokenAssemble",
      id: "3-1-q2",
      prompt: "Duo wants to end the game if his health hits 0. Assemble the logic!",
      contextLines: ["Tap tokens to fill boxes from left to right. Tap a filled box to remove it."],
      slotCount: 5,
      tokens: ["0", "if", ":", "health", "=="],
      correctOrder: ["if", "health", "==", "0", ":"],
    },
    {
      kind: "multiSelect",
      id: "3-1-q3",
      prompt: "Which of these are examples of if/then logic you use in real life?",
      contextLines: ["Select 2 choices, then press Submit."],
      options: [
        "If the alarm goes off, wake up.",
        "Walking to the store.",
        "If the light is red, stop the car.",
        "Eating an apple.",
      ],
      correctAnswers: [
        "If the alarm goes off, wake up.",
        "If the light is red, stop the car.",
      ],
      requiredSelectionCount: 2,
    },
    {
      kind: "singleChoice",
      id: "3-1-q4",
      prompt:
        "In many languages (like Python), we use a : to show where the then block starts. Which code is written correctly?",
      options: ["if score > 100", "if score > 100:", "if: score > 100"],
      correctAnswer: "if score > 100:",
    },
    {
      kind: "matchDrag",
      id: "3-1-q5",
      prompt: "Match the symbol to its meaning!",
      contextLines: ["Drag each meaning to the correct symbol, then press Submit."],
      leftItems: [">", "<", "=="],
      draggableValues: ["Greater than", "Less than", "Equal to"],
      correctValues: ["Greater than", "Less than", "Equal to"],
      appendEqualsToLeftItems: false,
    },
    {
      kind: "singleChoice",
      id: "3-1-q6",
      prompt: "Look at the code. Does the character jump?",
      contextLines: [
        "1. is_button_pressed = True",
        "2. if is_button_pressed:",
        "3.     character_jump()",
      ],
      options: ["✓", "✕"],
      correctAnswer: "✓",
      hintText:
        "If the condition after if is a Boolean variable, the code inside runs when that variable is True.",
    },
    {
      kind: "tokenAssemble",
      id: "3-1-q7",
      prompt: "To let a user in, complete the condition.",
      contextLines: ["Choose the correct comparison operator and place it in the blank."],
      slotCount: 1,
      tokens: [">", "<", "=="],
      correctOrder: ["=="],
      codePrefix: "if entered_password",
      codeSuffix: "secret_password:",
    },
    {
      kind: "singleChoice",
      id: "3-1-q8",
      prompt:
        "In code, the instructions inside an if statement are usually indented (pushed to the right). Why?",
      options: [
        "It looks prettier.",
        "To show they only happen if the if is True.",
        "To save space.",
      ],
      correctAnswer: "To show they only happen if the if is True.",
    },
    {
      kind: "singleChoice",
      id: "3-1-q9",
      prompt: "Does Duo buy the ice cream?",
      contextLines: [
        "1. money = 5",
        "2. ice_cream_price = 10",
        "3. if money > ice_cream_price: buy()",
      ],
      options: ["✓", "✕"],
      correctAnswer: "✕",
      explanationOnCorrect: "Correct. 5 is not greater than 10, so buy() does not run.",
    },
    {
      kind: "singleChoice",
      id: "3-1-q10",
      prompt:
        "This code is supposed to celebrate when you win, but it's celebrating even when you lose! What's wrong?",
      contextLines: ["1. if score = 100:", "2.     print(\"You Win!\")"],
      options: [
        "The word score is misspelled.",
        "It uses one = (set value) instead of == (check value).",
        "It needs more exclamation points.",
      ],
      correctAnswer: "It uses one = (set value) instead of == (check value).",
    },
  ],
};
