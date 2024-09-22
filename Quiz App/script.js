const questions = [
    {
        question: "The islands with coral-covered surfaces in the Bay of Bengal are?",
        answers: [
            { text: "Andaman Islands", correct: false },
            { text: "Nicobar Islands", correct: false },
            { text: "Both (A) and (B)", correct: true },
            { text: "None of the above", correct: false }
        ]
    },
    {
        question: "Which is the largest ocean in the world?",
        answers: [
            { text: "Indian Ocean", correct: false },
            { text: "Pacific Ocean", correct: true },
            { text: "Atlantic Ocean", correct: false },
            { text: "Arctic Ocean", correct: false }
        ]
    },
    {
        question: "Which planet is known as the Red Planet?",
        answers: [
            { text: "Earth", correct: false },
            { text: "Jupiter", correct: false },
            { text: "Mars", correct: true },
            { text: "Saturn", correct: false }
        ]
    },
    {
        question: "Which is the longest river in the world?",
        answers: [
            { text: "Amazon", correct: false },
            { text: "Nile", correct: true },
            { text: "Yangtze", correct: false },
            { text: "Mississippi", correct: false }
        ]
    },
    {
        question: "Which is the largest desert in the world?",
        answers: [
            { text: "Sahara Desert", correct: true },
            { text: "Arabian Desert", correct: false },
            { text: "Gobi Desert", correct: false },
            { text: "Kalahari Desert", correct: false }
        ]
    },
    {
        question: "Which country is the origin of the cocktail Mojito?",
        answers: [
            { text: "Mexico", correct: false },
            { text: "Cuba", correct: true },
            { text: "Spain", correct: false },
            { text: "Brazil", correct: false }
        ]
    },
    {
        question: "Which is the largest continent by area?",
        answers: [
            { text: "Africa", correct: false },
            { text: "Asia", correct: true },
            { text: "North America", correct: false },
            { text: "Europe", correct: false }
        ]
    },
    {
        question: "Which is the smallest country in the world?",
        answers: [
            { text: "Monaco", correct: false },
            { text: "Vatican City", correct: true },
            { text: "San Marino", correct: false },
            { text: "Malta", correct: false }
        ]
    },
    {
        question: "Which is the largest mammal in the world?",
        answers: [
            { text: "Elephant", correct: false },
            { text: "Blue Whale", correct: true },
            { text: "Giraffe", correct: false },
            { text: "Polar Bear", correct: false }
        ]
    },
    {
        question: "Which country has the largest population?",
        answers: [
            { text: "India", correct: false },
            { text: "China", correct: true },
            { text: "United States", correct: false },
            { text: "Indonesia", correct: false }
        ]
    }
];

let currentQuestionIndex = 0;
let score = 0;
let correctCount = 0;  // Track correct answers
let incorrectCount = 0; // Track incorrect answers
let selectedAnswer = null; // Track the selected answer
let countdownInterval;
let timeLeft = 30;

const questionTitle = document.getElementById('question-title');
const answerButtonsElement = document.getElementById('answer-buttons');
const submitButton = document.getElementById('submit-btn');
const nextButton = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const finalScoreElement = document.getElementById('final-score');
const resultContainer = document.getElementById('result-container');
const quizContainer = document.querySelector('.quiz-container');
const countdownElement = document.getElementById('countdown');
const scoreDisplay = document.getElementById('score-display'); // Element to display scores

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    correctCount = 0; // Reset correct count
    incorrectCount = 0; // Reset incorrect count
    quizContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    showQuestion();
}

function startTimer() {
    timeLeft = 30; // Reset to 30 seconds for each question
    countdownElement.textContent = timeLeft; // Display the initial time

    countdownInterval = setInterval(() => {
        timeLeft--;
        countdownElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval); // Stop the timer
            if (!selectedAnswer) {
                // If no answer was selected, mark as incorrect
                markIncorrectAndTimeout();
            } else {
                // If an answer was selected, submit it
                submitAnswer();
            }
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(countdownInterval); // Clear the old timer
    startTimer(); // Start a new timer
}

function showQuestion() {
    resetState();
    selectedAnswer = null; // Reset selected answer for the new question
    const currentQuestion = questions[currentQuestionIndex];
    questionTitle.textContent = currentQuestion.question;

    // Update question number
    const currentQuestionElement = document.getElementById('current-question');
    currentQuestionElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    // Update progress bar with percentage label
    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.innerHTML = `<span>${Math.round(progressPercentage)}%</span>`; // Display percentage

    // Show answer buttons
    currentQuestion.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.textContent = answer.text;
        button.classList.add('answer-btn');
        button.setAttribute('data-letter', String.fromCharCode(65 + index)); // A, B, C, D dynamically
        button.addEventListener('click', () => selectAnswer(button, answer));
        answerButtonsElement.appendChild(button);
    });

    submitButton.classList.remove('hidden'); // Show the submit button
    resetTimer();
}

function selectAnswer(button, answer) {
    // Allow the user to change their selected answer before submitting
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Mark the clicked button as active
    button.classList.add('active');
    selectedAnswer = answer;
}

function submitAnswer() {
    clearInterval(countdownInterval); // Stop the timer on submit

    // Disable all buttons and show feedback (correct/incorrect)
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => {
        const answerText = btn.textContent.trim();
        const answer = questions[currentQuestionIndex].answers.find(a => a.text === answerText);
        btn.disabled = true; // Disable button after answer submission
        
        if (answer.correct) {
            btn.classList.add('correct'); // Highlight correct answer
        }
        if (!answer.correct && btn.classList.contains('active')) {
            btn.classList.add('incorrect'); // Highlight incorrect answer
        }
    });

    if (selectedAnswer && selectedAnswer.correct) {
        score++; // Increase score if correct answer was selected
        correctCount++; // Increment correct count
    } else {
        incorrectCount++; // Increment incorrect count
    }

    updateScoreDisplay(); // Update score display
    submitButton.classList.add('hidden'); // Hide the submit button after submission
    nextButton.classList.remove('hidden'); // Show the next button after submission
}

function markIncorrectAndTimeout() {
    // If time runs out and no answer was selected, mark as incorrect
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => {
        const answerText = btn.textContent.trim();
        const answer = questions[currentQuestionIndex].answers.find(a => a.text === answerText);
        btn.disabled = true; // Disable button when time runs out

        if (answer.correct) {
            btn.classList.add('correct'); // Highlight correct answer
        }
    });

    incorrectCount++; // Increment incorrect count if time runs out without selection
    updateScoreDisplay(); // Update score display

    submitButton.classList.add('hidden'); // Hide the submit button when time runs out
    nextButton.classList.remove('hidden'); // Show the next button after time runs out
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `Correct: ${correctCount} | Incorrect: ${incorrectCount}`; // Update score display
}

function resetState() {
    submitButton.classList.add('hidden'); // Hide the Submit button initially
    nextButton.classList.add('hidden'); // Hide the Next button initially
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

submitButton.addEventListener('click', () => {
    if (!selectedAnswer) {
        // Display a warning if no answer is selected
        alert("Please select an answer before submitting!");
        return;
    }
    submitAnswer(); // Submit the selected answer if present
});

nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion(); // Proceed to the next question
    } else {
        showScore(); // Display the score after the last question
    }
});

function showScore() {
    quizContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    finalScoreElement.textContent = `${correctCount} / ${questions.length}`;
}

document.getElementById('restart-btn').addEventListener('click', startQuiz);

startQuiz();
