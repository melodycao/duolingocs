import type { LessonDefinition } from "./types";

export const lesson_1_3: LessonDefinition = {
  id: "1-3",
  title: "Fixing the Recipe (Debugging)",
  questions: [
    {
      kind: "singleChoice",
      id: "1-3-q1",
      prompt:
        "Duo is trying to draw a 'V' shape, but he only drew one slanted line. What is the missing command?",
      contextLines: [
        "1. Draw slanted line down.",
        "2. [ ? ]",
        "3. Draw slanted line up.",
      ],
      options: ["Turn 135 degrees.", "Draw a circle.", "Erase line."],
      correctAnswer: "Turn 135 degrees.",
    },
    {
      kind: "singleChoice",
      id: "1-3-q2",
      prompt:
        "The robot reached the house but can't get inside. Find the bug in the sequence!",
      contextLines: [
        "1. Walk to front door.",
        "2. Turn the key in the lock.",
        "3. Walk into the house.",
      ],
      options: [
        "The robot walked too fast.",
        "The robot forgot to open the door.",
        "The key is the wrong color.",
      ],
      correctAnswer: "The robot forgot to open the door.",
    },
    {
      kind: "order",
      id: "1-3-q3",
      prompt: "Duo made a mess! Put these steps in the correct order to fix the bug.",
      options: [
        "Pour milk.",
        "Eat cereal.",
        "Get a bowl.",
        "Pour cereal into the bowl.",
      ],
      correctOrders: [[
        "Get a bowl.",
        "Pour cereal into the bowl.",
        "Pour milk.",
        "Eat cereal.",
      ]],
    },
    {
      kind: "singleChoice",
      id: "1-3-q4",
      prompt:
        "The robot is stuck walking against a wall and won't stop! What is the bug?",
      contextLines: [
        "1. Walk forward.",
        "2. If you see a wall, keep walking forward.",
      ],
      options: [
        "The robot needs more power.",
        "The 'If' rule tells it to do the wrong thing.",
        "There is no bug.",
      ],
      correctAnswer: "The 'If' rule tells it to do the wrong thing.",
    },
    {
      kind: "singleChoice",
      id: "1-3-q5",
      prompt:
        "The robot was supposed to move in a square (Right, Down, Left, Up), but it ended up in the wrong place. Find the buggy command.",
      contextLines: [
        "1. Move Right.",
        "2. Move Down.",
        "3. Move Right.",
        "4. Move Up.",
      ],
      options: [
        "Step 1 is buggy.",
        "Step 2 is buggy.",
        "Step 3 is buggy (should be Move Left).",
        "Step 4 is buggy.",
      ],
      correctAnswer: "Step 3 is buggy (should be Move Left).",
    },
    {
      kind: "singleChoice",
      id: "1-3-q6",
      prompt: "Duo tried to mop the floor, but the floor is still dry. Why?",
      contextLines: [
        "1. Put mop in bucket.",
        "2. Scrub the floor with mop.",
        "3. Empty the bucket.",
      ],
      options: [
        "There was no water in the bucket.",
        "The mop is too heavy.",
        "The floor is already clean.",
      ],
      correctAnswer: "There was no water in the bucket.",
    },
    {
      kind: "singleChoice",
      id: "1-3-q7",
      prompt:
        "The printer is moving, but the page is blank! Which sub-task is failing?",
      options: [
        "The paper tray is closed.",
        "The power cord is plugged in.",
        "The ink cartridge is empty.",
      ],
      correctAnswer: "The ink cartridge is empty.",
    },
    {
      kind: "singleChoice",
      id: "1-3-q8",
      prompt:
        "The code says: Right, Right, Right. But the star is at (3,2). Where is the bug?",
      contextLines: ["Interface: 3x3 Grid. Robot starts at (1,1)."],
      options: [
        "It needs one more Right.",
        "It moved too far Right and missed the Down turn.",
        "The robot is facing the wrong way.",
      ],
      correctAnswer: "It moved too far Right and missed the Down turn.",
    },
    {
      kind: "singleChoice",
      id: "1-3-q9",
      prompt:
        "Duo wrote a great email, but nobody received it. What did he forget to do?",
      contextLines: [
        "1. Open email app.",
        "2. Type the recipient's address.",
        "3. Type the message.",
        "4. Close the app.",
      ],
      options: ["Change the font.", "Press Send.", "Restart the computer."],
      correctAnswer: "Press Send.",
    },
    {
      kind: "singleChoice",
      id: "1-3-q10",
      prompt:
        "This code to put on shoes has an extra, unnecessary step (a bug). Which one is it?",
      contextLines: [
        "1. Put on socks.",
        "2. Put on hat.",
        "3. Put on shoes.",
        "4. Tie laces.",
      ],
      options: [
        "Step 1: Put on socks.",
        "Step 2: Put on hat.",
        "Step 3: Put on shoes.",
        "Step 4: Tie laces.",
      ],
      correctAnswer: "Step 2: Put on hat.",
    },
  ],
};
