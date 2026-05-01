import type { LessonDefinition } from "./types";

export const lesson_1_2: LessonDefinition = {
  id: "1-2",
  title: "The Art of Breaking Things (Decomposition)",
  questions: [
    {
      kind: "multiSelect",
      id: "1-2-q1",
      prompt:
        "Duo wants to \"Clean the Room.\" Which three mini-tasks are part of this big goal?",
      contextLines: ["Select 3 choices, then press Submit."],
      options: [
        "Pick up toys off the floor.",
        "Order a pizza.",
        "Make the bed.",
        "Put dirty clothes in the hamper.",
        "Turn on the TV.",
      ],
      correctAnswers: [
        "Pick up toys off the floor.",
        "Make the bed.",
        "Put dirty clothes in the hamper.",
      ],
      requiredSelectionCount: 3,
    },
    {
      kind: "singleChoice",
      id: "1-2-q2",
      prompt:
        "Look at these tasks: Sending an Email, Posting a Tweet, and Sending a Text. What is the common first step?",
      options: ["Plug in the charger.", "Write a subject line.", "Open the app."],
      correctAnswer: "Open the app.",
    },
    {
      kind: "order",
      id: "1-2-q3",
      prompt: "Break down \"Drawing a Face\" into the correct order of sub-tasks!",
      options: [
        "Add details like eyes and a mouth.",
        "Draw a large circle for the head.",
        "Color in the drawing.",
      ],
      correctOrders: [[
        "Draw a large circle for the head.",
        "Add details like eyes and a mouth.",
        "Color in the drawing.",
      ]],
    },
    {
      kind: "singleChoice",
      id: "1-2-q4",
      prompt:
        "Your \"Turn on Flashlight\" function isn't working. Which sub-task should you check first?",
      options: [
        "The color of the flashlight.",
        "If the batteries have power.",
        "The price of the flashlight.",
      ],
      correctAnswer: "If the batteries have power.",
    },
    {
      kind: "singleChoice",
      id: "1-2-q5",
      prompt:
        "You are writing code for a kitchen robot to make Pasta, Boiled Eggs, and Soup. What sub-task do all three share?",
      options: ["Boil water.", "Wash dishes first.", "Set the table."],
      correctAnswer: "Boil water.",
    },
    {
      kind: "multiSelect",
      id: "1-2-q6",
      prompt:
        "Which mini-tasks are required for a \"User Login\" system?",
      contextLines: ["Select 3 choices, then press Submit."],
      options: [
        "Ask for a username.",
        "Check if the password is correct.",
        "Change the website's font to blue.",
        "Show an error if the login fails.",
      ],
      correctAnswers: [
        "Ask for a username.",
        "Check if the password is correct.",
        "Show an error if the login fails.",
      ],
      requiredSelectionCount: 3,
    },
    {
      kind: "singleChoice",
      id: "1-2-q7",
      prompt:
        "Duo is breaking down the task \"Brush Teeth.\" Which of these steps is NOT a necessary sub-task?",
      options: [
        "Put toothpaste on the brush.",
        "Scrub teeth for 2 minutes.",
        "Read a book.",
        "Rinse the brush.",
      ],
      correctAnswer: "Read a book.",
    },
    {
      kind: "singleChoice",
      id: "1-2-q8",
      prompt:
        "To make a character \"Walk Right,\" which two steps are repeated?",
      options: [
        "Move right foot -> Move left foot.",
        "Jump up -> Fall down.",
        "Turn around -> Sit down.",
      ],
      correctAnswer: "Move right foot -> Move left foot.",
    },
    {
      kind: "order",
      id: "1-2-q9",
      prompt: "Decompose the task \"Buy Milk\" into the correct sequence.",
      options: [
        "Pay for the milk at the register.",
        "Drive to the store.",
        "Find the dairy aisle and grab a carton.",
      ],
      correctOrders: [[
        "Drive to the store.",
        "Find the dairy aisle and grab a carton.",
        "Pay for the milk at the register.",
      ]],
    },
    {
      kind: "singleChoice",
      id: "1-2-q10",
      prompt:
        "What is the common final sub-task for Finishing a Game, Leaving a Room, and Ending a Phone Call?",
      options: [
        "Opening a menu.",
        "Disconnecting or closing the connection.",
        "Charging the battery.",
      ],
      correctAnswer: "Disconnecting or closing the connection.",
    },
  ],
};

