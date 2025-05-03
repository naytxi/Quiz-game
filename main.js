//Empezamos capturando los elementos 
const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const questionContainerElement = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
//Creamos un array vacio que tendra las preguntas y un index que empiece en 0, ademas de un contador para las preguntas correctas
let questionList = [];
let currentQuestionIndex = 0;
let correctAnswersCount = 0;

//Creamos una funcion asincrona que se encargara de iniciar el juego, ocultar el boton de inicio y mostrar las preguntas

async function startGame() {
  startButton.classList.add('hide');
  currentQuestionIndex = 0;
  questionContainerElement.classList.remove('hide');
  questionList = await getQuestions();
  setNextQuestion();
}

//Esta funcion asincrona que se encargara de obtener las preguntas y sus respuestas de la API con el token generado, formatearlas y devolverlas
async function getQuestions() {
  const res = await fetch('https://quizapi.io/api/v1/questions?limit=10', {
    headers: {
      'X-Api-Key': 'VqCrxdX2mo4HsoTysxcRjIi9qFIgh52OqSvn8lEs'
    }
  });

  const data = await res.json();

  return data.map(q => {
    const answers = [];

    for (let key in q.answers) {
      if (q.answers[key]) {
        const letter = key.split('_')[1]; 
        const correct = q.correct_answers[`answer_${letter}_correct`] === 'true';
        answers.push({
          text: q.answers[key],
          correct: correct
        });
      }
    }

    return {
      question: q.question,
      answers: answers
    };
  });
}

//Creamos una funcion que se encargara de mostrar la siguiente pregunta, reiniciar el estado y mostrar la pregunta actual Y sus respuestas
function setNextQuestion() {
  resetState();
  showQuestion(questionList[currentQuestionIndex]);
}

//Esta funcion se encargara de mostrar la pregunta y sus respuestas en el DOM, creando un boton por cada respuesta y añadiendo un evento click a cada uno de ellos
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

//Esta en cambio se encargara de reiniciar el estado de las preguntas, ocultar el boton de siguiente y limpiar las respuestas anteriores
function resetState() {
  clearStatusClass(document.body);
  nextButton.classList.add('hide');
  answerButtonsElement.innerHTML = '';
}

//Aqui se encargara de seleccionar la respuesta correcta o incorrecta, deshabilitar los botones y mostrar el boton de siguiente si no es la ultima pregunta
function selectAnswer(e) {
  const selectedButton = e.target;
  const correct = selectedButton.dataset.correct;

  setStatusClass(selectedButton, correct);

  Array.from(answerButtonsElement.children).forEach(button => {
    button.disabled = true;
    setStatusClass(button, button.dataset.correct);
    
  });

  if (correct === "true") {
    correctAnswersCount++;
  }

  if (currentQuestionIndex < questionList.length - 1) {
    nextButton.classList.remove('hide');
  } 

  else {
    localStorage.setItem('usuarioQuiz', JSON.stringify({
      correctas: correctAnswersCount,
      total: questionList.length
    }));

    startButton.innerText = 'Reiniciar';
    startButton.classList.remove('hide');
  }

}

//Esta funcion se encargara de añadir la clase correcta o incorrecta a los botones dependiendo de si la respuesta es correcta o no
function setStatusClass(element, correct) {
  clearStatusClass(element);
  if (correct) {
    element.classList.add('color-correct');
  } else {
    element.classList.add('color-wrong');
  }
}
//Esta funcion se encargara de limpiar el estado de los botones, eliminando las clases correctas o incorrectas
function clearStatusClass(element) {
  element.classList.remove('color-correct');
  element.classList.remove('color-wrong');
}

//Aqui decodificamos el HTML de las respuestas, para que se muestre correctamente en el DOM
function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

//Añadimos los eventos
startButton.addEventListener('click', startGame);

nextButton.addEventListener('click', () => {
  currentQuestionIndex++;
  setNextQuestion();
});

// Esperamos a que el DOM se cargue completamente antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', function () {

  // Obtener los datos de localStorage
  const datos = JSON.parse(localStorage.getItem('usuarioQuiz'));

  // Verificar si los datos existen
  if (datos) {
    const { correctas, total } = datos;

    // Mostrar el puntaje en la página
    document.getElementById('score').textContent = correctas;
    document.getElementById('total').textContent = `/${total}`;

    // Calcular el mensaje personalizado
    const porcentaje = (correctas / total) * 100;
    let message = "";

    if (porcentaje === 100) {
      message = "¡Perfecto! ¡Excelente trabajo!";
    } else if (porcentaje >= 70) {
      message = "¡Buen trabajo!";
    } else if (porcentaje >= 50) {
      message = "No está mal, pero puedes mejorar.";
    } else {
      message = "Necesitas practicar más. ¡Ánimo!";
    }

    // Mostrar el mensaje en la página
    document.getElementById('result-message').textContent = message;

    // Mostrar en consola
    console.log("Datos desde localStorage:", datos);
    console.log("Score:", correctas);
    console.log("Total:", total);
    console.log("Message:", message);
  } else {
    // Si no hay datos en localStorage, mostrar mensaje de error
    document.getElementById('score').textContent = "0";
    document.getElementById('total').textContent = "/0";
    document.getElementById('result-message').textContent = "No se encontraron resultados. ¿Jugamos una partida?";
    console.log("No se encontraron datos en localStorage.");
  }
});





/*
document.addEventListener('DOMContentLoaded', () => {
  console.log("¿Se está ejecutando results.js?");

  const datos = JSON.parse(localStorage.getItem('usuarioQuiz'));
  console.log("Datos desde localStorage:", datos);

  if (datos) {
    const { correctas, total } = datos;
    console.log("Score:", correctas);
    console.log("Total:", total);

    // Mostrar en la página
    document.getElementById('score').textContent = correctas;
    document.getElementById('total').textContent = `/${total}`;

    // Calcular porcentaje y mensaje
    const porcentaje = (correctas / total) * 100;
    let message = "";

    if (porcentaje === 100) {
      message = "¡Perfecto! ¡Excelente trabajo!";
    } else if (porcentaje >= 70) {
      message = "¡Buen trabajo!";
    } else if (porcentaje >= 50) {
      message = "No está mal, pero puedes mejorar.";
    } else {
      message = "Necesitas practicar más. ¡Ánimo!";
    }

    console.log("Message:", message);
    document.getElementById('result-message').textContent = message;

  } else {
    console.warn("No se encontraron resultados en localStorage.");
    document.getElementById('score').textContent = "0";
    document.getElementById('total').textContent = "/0";
    document.getElementById('result-message').textContent = "No se encontraron resultados. ¿Jugamos una partida?";
  }
});
*/
    