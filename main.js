//Empezamos capturando los elementos 
const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const questionContainerElement = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
//Creamos un array vacio que tendra las preguntas y un index que empiece en 0
let questionList = [];
let currentQuestionIndex = 0;

//Creamos una funcion asincrona que se encargara de iniciar el juego, ocultar el boton de inicio y mostrar las preguntas
async function startGame() {
  startButton.classList.add('hide');
  currentQuestionIndex = 0;
  questionContainerElement.classList.remove('hide');
  questionList = await getQuestions();
  setNextQuestion();
}

//Creamos una funcion asincrona que se encargara de obtener las preguntas de la API, formatearlas y devolverlas
async function getQuestions() {
  const res = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
  const data = await res.json();

  return data.results.map(q => {
    const answers = [...q.incorrect_answers.map(a => ({
      text: a,
      correct: false
    })), { text: q.correct_answer, correct: true }];

    return {
      question: decodeHTML(q.question),
      answers: shuffle(answers)
    };
  });
}

function setNextQuestion() {
  resetState();
  showQuestion(questionList[currentQuestionIndex]);
}

function showQuestion(question) {
  questionElement.innerText = question.question;
  question.answers.forEach(answer => {
    const button = document.createElement('button');
    button.innerText = decodeHTML(answer.text);
    button.classList.add('btn');
    if (answer.correct) button.dataset.correct = true;
    button.addEventListener('click', selectAnswer);
    answerButtonsElement.appendChild(button);
  });
}

function resetState() {
  clearStatusClass(document.body);
  nextButton.classList.add('hide');
  answerButtonsElement.innerHTML = '';
}

function selectAnswer(e) {
  const selectedButton = e.target;
  const correct = selectedButton.dataset.correct;

  setStatusClass(selectedButton, correct);

  // Deshabilitar todos los botones
  Array.from(answerButtonsElement.children).forEach(button => {
    button.disabled = true;
    setStatusClass(button, button.dataset.correct);
  });

  if (currentQuestionIndex < questionList.length - 1) {
    nextButton.classList.remove('hide');
  } else {
    startButton.innerText = 'Reiniciar';
    startButton.classList.remove('hide');
  }
}

function setStatusClass(element, correct) {
  clearStatusClass(element);
  if (correct) {
    element.classList.add('color-correct');
  } else {
    element.classList.add('color-wrong');
  }
}

function clearStatusClass(element) {
  element.classList.remove('color-correct');
  element.classList.remove('color-wrong');
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

startButton.addEventListener('click', startGame);

nextButton.addEventListener('click', () => {
  currentQuestionIndex++;
  setNextQuestion();
});