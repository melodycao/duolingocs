import type { LessonDefinition } from "./types";

export const lesson_1_1: LessonDefinition = {
  id: "1-1",
  title: "Step-by-Step (Algorithms)",
  questions: [
    {
      kind: "order",
      id: "1-1-q1",
      prompt: "Help Duo get ready for his coding session! Put the steps in the correct order.",
      options: [
        "Log into the computer.",
        "Sit in the chair.",
        "Open the coding app.",
        "Turn on the monitor.",
      ],
      correctOrders: [[
        "Sit in the chair.",
        "Turn on the monitor.",
        "Log into the computer.",
        "Open the coding app.",
      ]],
    },
    {
      kind: "singleChoice",
      id: "1-1-q2",
      prompt: "Move the Robot to the Star in the fewest steps possible!",
      contextLines: [
        "Interface: 3x3 Grid. Robot at (1,1). Star at (1,3).",
      ],
      options: [
        "A) Right, Right",
        "B) Down, Down",
        "C) Right, Down",
      ],
      correctAnswer: "A) Right, Right",
    },
    {
      kind: "singleChoice",
      id: "1-1-q3",
      prompt: "Duo is making a sequence to plant a flower. One step is missing!",
      contextLines: [
        "1. Dig a hole.",
        "2. Drop the seed.",
        "3. [ ? ]",
        "4. Water the soil.",
      ],
      options: ["Buy a pot", "Cover with dirt", "Pick the flower"],
      correctAnswer: "Cover with dirt",
    },
    {
      kind: "order",
      id: "1-1-q4",
      prompt: "Order the steps to make a PB&J sandwich!",
      options: [
        "Put the slices together.",
        "Spread peanut butter on one slice.",
        "Get two slices of bread.",
        "Spread jelly on the other slice.",
      ],
      correctOrders: [[
        "Get two slices of bread.",
        "Spread peanut butter on one slice.",
        "Spread jelly on the other slice.",
        "Put the slices together.",
      ]],
    },
    {
      kind: "order",
      id: "1-1-q5",
      prompt: "There is a wall at (2,2). Get to the Star at (3,3)!",
      options: ["Down", "Down", "Right", "Right"],
      correctOrders: [
        ["Down", "Down", "Right", "Right"],
        ["Right", "Right", "Down", "Down"],
      ],
    },
    {
      kind: "singleChoice",
      id: "1-1-q6",
      prompt: "If the Robot is at (1,1) and wants to go to (2,1), which command is wrong?",
      options: ["A) Move Down", "B) Move Right"],
      correctAnswer: "B) Move Right",
    },
    {
      kind: "order",
      id: "1-1-q7",
      prompt: "Duo is painting a stripe. Order the commands.",
      options: [
        "Move brush to the right.",
        "Dip brush in paint.",
        "Lift brush up.",
        "Touch brush to paper.",
      ],
      correctOrders: [[
        "Dip brush in paint.",
        "Touch brush to paper.",
        "Move brush to the right.",
        "Lift brush up.",
      ]],
    },
    {
      kind: "order",
      id: "1-1-q8",
      prompt: "Navigate the Robot to the Star!",
      contextLines: [
        "Interface: 4x4 Grid. Robot at (1,1). Star at (4,1).",
      ],
      options: ["Down", "Down", "Down"],
      correctOrders: [["Down", "Down", "Down"]],
    },
    {
      kind: "order",
      id: "1-1-q9",
      prompt: "Time to celebrate! Order the steps to light the cake.",
      options: [
        "Blow out the candles.",
        "Strike a match.",
        "Light the candles.",
        "Put candles on the cake.",
      ],
      correctOrders: [[
        "Put candles on the cake.",
        "Strike a match.",
        "Light the candles.",
        "Blow out the candles.",
      ]],
    },
    {
      kind: "singleChoice",
      id: "1-1-q10",
      prompt: "Duo needs to move 3 spaces Right. Which sequence is correct?",
      options: [
        "A) Right, Down, Right",
        "B) Right, Right, Right",
        "C) Move, Move, Move",
      ],
      correctAnswer: "B) Right, Right, Right",
    },
  ],
};

