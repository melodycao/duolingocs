import type { LessonDefinition } from "./types";

export const lesson_4_2: LessonDefinition = {
  id: "4-2",
  title: "Keep Going Until... (While Loops)",
  questions: [
    {
      kind: "singleChoice",
      id: "4-2-q1",
      prompt:
        "Unlike a for loop (which runs a set number of times), a while loop runs as long as a condition is...",
      options: ["True", "False", "Finished"],
      correctAnswer: "True",
    },
    {
      kind: "singleChoice",
      id: "4-2-q2",
      prompt: "How long will this loop keep spinning the loading icon?",
      contextLines: ["1. while is_loading:", "2.     show_spinner()"],
      options: [
        "Exactly 10 times.",
        "Until is_loading becomes False.",
        "Forever, no matter what.",
      ],
      correctAnswer: "Until is_loading becomes False.",
    },
    {
      kind: "tokenAssemble",
      id: "4-2-q3",
      prompt: "Duo wants to walk as long as the path is clear. Assemble the loop!",
      contextLines: ["Tap tokens to fill boxes from left to right. Tap a filled box to remove it."],
      slotCount: 3,
      tokens: [":", "while", "path_is_clear"],
      correctOrder: ["while", "path_is_clear", ":"],
    },
    {
      kind: "multiSelect",
      id: "4-2-q4",
      prompt: "Which of these are real-life examples of a while loop?",
      contextLines: ["Select 2 choices, then press Submit."],
      options: [
        "Scrubbing a dish until it is clean.",
        "Running exactly 4 laps.",
        "Waiting at a red light until it turns green.",
        "Putting 2 sugars in your coffee.",
      ],
      correctAnswers: [
        "Scrubbing a dish until it is clean.",
        "Waiting at a red light until it turns green.",
      ],
      requiredSelectionCount: 2,
    },
    {
      kind: "singleChoice",
      id: "4-2-q5",
      prompt: "This code will never stop (an infinite loop). Why?",
      contextLines: [
        "1. is_hungry = True",
        "2. while is_hungry == True:",
        "3.     print(\"Eat a snack\")",
      ],
      options: [
        "There is no snack.",
        "is_hungry is never changed to False.",
        "The word while is lowercase.",
      ],
      correctAnswer: "is_hungry is never changed to False.",
    },
    {
      kind: "singleChoice",
      id: "4-2-q6",
      prompt: "What is the last number the robot says?",
      contextLines: [
        "1. count = 3",
        "2. while count > 0:",
        "3.     print(count)",
        "4.     count = count - 1",
      ],
      options: ["3", "0", "1"],
      correctAnswer: "1",
      explanationOnCorrect:
        "Once count hits 0, the condition 0 > 0 is False, so the loop stops.",
    },
    {
      kind: "shortAnswer",
      id: "4-2-q7",
      prompt: "In the code while energy > 0:, the loop will stop when energy reaches ___.",
      placeholder: "Type your answer",
      acceptableAnswers: ["0"],
      caseSensitive: true,
    },
    {
      kind: "singleChoice",
      id: "4-2-q8",
      prompt: "What happens if the condition in a while loop is False before the loop starts?",
      options: [
        "The code inside the loop is skipped entirely.",
        "The computer crashes.",
        "It runs exactly one time.",
      ],
      correctAnswer: "The code inside the loop is skipped entirely.",
    },
    {
      kind: "matchDrag",
      id: "4-2-q9",
      prompt: "Match the game event to the loop condition!",
      leftItems: [
        "while health > 0:",
        "while enemy_near == True:",
        "while button_pressed == False:",
      ],
      draggableValues: [
        "Keep playing the game.",
        "Play battle music.",
        "Wait for the player to start.",
      ],
      correctValues: [
        "Keep playing the game.",
        "Play battle music.",
        "Wait for the player to start.",
      ],
      appendEqualsToLeftItems: false,
    },
    {
      kind: "singleChoice",
      id: "4-2-q10",
      prompt: "Will the Low Battery warning keep showing?",
      contextLines: [
        "1. battery = 5",
        "2. while battery < 10:",
        "3.     print(\"Low Battery!\")",
        "4.     battery = battery + 10",
      ],
      options: ["Yes, forever.", "No, it runs once and then stops."],
      correctAnswer: "No, it runs once and then stops.",
      hintText: "After the first run, battery becomes 15, which is not < 10.",
    },
  ],
};
