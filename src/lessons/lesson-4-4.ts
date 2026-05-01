import type { LessonDefinition } from "./types";

export const lesson_4_4: LessonDefinition = {
  id: "4-4",
  title: "Lists of Things (Arrays)",
  questions: [
    {
      kind: "singleChoice",
      id: "4-4-q1",
      prompt:
        "A List (or Array) allows you to store multiple pieces of data in a single variable. Which of these looks like a List?",
      options: [
        "items = \"Apple, Banana, Cherry\"",
        "items = [\"Apple\", \"Banana\", \"Cherry\"]",
        "items = 3",
      ],
      correctAnswer: "items = [\"Apple\", \"Banana\", \"Cherry\"]",
    },
    {
      kind: "singleChoice",
      id: "4-4-q2",
      prompt: "Most coding languages use [ ] to create a list. Which list is written correctly?",
      options: [
        "colors = [\"Red\", \"Blue\"]",
        "colors = (Red, Blue)",
        "colors = \"Red, Blue\"",
      ],
      correctAnswer: "colors = [\"Red\", \"Blue\"]",
    },
    {
      kind: "singleChoice",
      id: "4-4-q3",
      prompt:
        "In coding, we start counting list positions (indexes) at 0. In the list pets = [\"Dog\", \"Cat\", \"Bird\"], what is at position 0?",
      options: ["\"Dog\"", "\"Cat\"", "\"Bird\""],
      correctAnswer: "\"Dog\"",
    },
    {
      kind: "matchDrag",
      id: "4-4-q4",
      prompt: "Match the index number to the item in this list: tools = [\"Hammer\", \"Saw\", \"Drill\"]!",
      leftItems: ["tools[2]", "tools[0]", "tools[1]"],
      draggableValues: ["Drill", "Hammer", "Saw"],
      correctValues: ["Drill", "Hammer", "Saw"],
      appendEqualsToLeftItems: false,
    },
    {
      kind: "shortAnswer",
      id: "4-4-q5",
      prompt: "The length of a list is how many items are inside. What is the length of [10, 20, 30, 40]?",
      placeholder: "Type your answer",
      acceptableAnswers: ["4"],
      caseSensitive: true,
    },
    {
      kind: "tokenAssemble",
      id: "4-4-q6",
      prompt: "Duo found a Shield. Add it to the end of his inventory list!",
      contextLines: ["Tap tokens to fill boxes from left to right. Tap a filled box to remove it."],
      slotCount: 3,
      tokens: [".append", "(\"Shield\")", "inventory"],
      correctOrder: ["inventory", ".append", "(\"Shield\")"],
    },
    {
      kind: "singleChoice",
      id: "4-4-q7",
      prompt:
        "If we loop through a list of 5 names and print each one, how many names will appear on the screen?",
      options: ["1", "5", "0"],
      correctAnswer: "5",
    },
    {
      kind: "multiSelect",
      id: "4-4-q8",
      prompt: "Which of these would a programmer store in a List?",
      contextLines: ["Select 3 choices, then press Submit."],
      options: [
        "A high score leaderboard (top 10 players).",
        "The items currently in a shopping cart.",
        "The player's current on/off music setting.",
        "A deck of 52 playing cards.",
      ],
      correctAnswers: [
        "A high score leaderboard (top 10 players).",
        "The items currently in a shopping cart.",
        "A deck of 52 playing cards.",
      ],
      requiredSelectionCount: 3,
    },
    {
      kind: "singleChoice",
      id: "4-4-q9",
      prompt: "What do we call a list that looks like this: my_list = []?",
      options: ["A broken list.", "An empty list.", "A ghost list."],
      correctAnswer: "An empty list.",
    },
    {
      kind: "shortAnswer",
      id: "4-4-q10",
      prompt: "What does this code print?",
      contextLines: [
        "1. fruits = [\"Apple\", \"Banana\"]",
        "2. fruits[0] = \"Orange\"",
        "3. print(fruits[0])",
      ],
      placeholder: "Type your answer",
      acceptableAnswers: ["Orange", "\"Orange\""],
      caseSensitive: true,
      hintText: "You can change an item in a list by assigning a new value to its position!",
    },
  ],
};
