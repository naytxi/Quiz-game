//Este Domcontentloaded se encarga de cargar el DOM y ejecutar el código una vez que el DOM está completamente cargado

document.addEventListener('DOMContentLoaded', function () {

 //Capturamos todo lo que necesitamos
  const startButton = document.getElementById('start-btn');
  const nextButton = document.getElementById('next-btn');
  const questionContainerElement = document.getElementById('question-container');
  const questionElement = document.getElementById('question');
  const answerButtonsElement = document.getElementById('answer-buttons');
  
//Aqui se comprueba si los elementos existen en el DOM antes de ejecutar el código
  if (startButton && nextButton && questionContainerElement) {
    let questionList = [];
    let currentQuestionIndex = 0;
    let correctAnswersCount = 0;

//Esta función se encarga de iniciar el juego, ocultando el botón de inicio y mostrando las preguntas
    async function startGame() {
      startButton.classList.add('hide');
      currentQuestionIndex = 0;
      correctAnswersCount = 0;
      questionContainerElement.classList.remove('hide');
      questionList = await getQuestions();
      setNextQuestion();
    }
//Esta en cambio se encarga de obtener las preguntas de la API y formatearlas para que sean más fáciles de usar
    async function getQuestions() {
      const res = await fetch('https://quizapi.io/api/v1/questions?limit=10', {
        headers: {
          'X-Api-Key': 'VqCrxdX2mo4HsoTysxcRjIi9qFIgh52OqSvn8lEs'
        }
      });

      const data = await res.json();
//este map se encarga de recorrer las preguntas y formatearlas para que sean más fáciles de usar
      // y devuelve un array de objetos con las preguntas y respuestas
      return data.map(q => {
        const answers = [];
        for (let key in q.answers) {
          if (q.answers[key]) {
            const letter = key.split('_')[1];
            const correct = q.correct_answers[`answer_${letter}_correct`] === 'true';
            answers.push({ text: q.answers[key], correct: correct });
          }
        }
        return {
          question: q.question,
          answers: answers
        };
      });
    }
//Aqui se encarga de mostrar la siguiente pregunta, reseteando el estado anterior y mostrando la nueva pregunta
    function setNextQuestion() {
      resetState();
      showQuestion(questionList[currentQuestionIndex]);
    }
//ShowQuestion se encarga de mostrar la pregunta y las respuestas en el DOM, creando los botones para cada respuesta
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
//Esta función se encarga de resetear el estado anterior, ocultando el botón de siguiente y limpiando las respuestas
    function resetState() {
      clearStatusClass(document.body);
      nextButton.classList.add('hide');
      answerButtonsElement.innerHTML = '';
    }
//SelectAnswer se encarga de comprobar si la respuesta es correcta o incorrecta, y deshabilitar los botones de respuesta
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
      } else {
        localStorage.setItem('usuarioQuiz', JSON.stringify({
          correctas: correctAnswersCount,
          total: questionList.length
        }));
        window.location.href = 'results.html';
      }
    }
//Aqui se encarga de añadir la clase correcta o incorrecta a los botones de respuesta, y limpiar el estado anterior
    function setStatusClass(element, correct) {
      clearStatusClass(element);
      if (correct) {
        element.classList.add('color-correct');
      } else {
        element.classList.add('color-wrong');
      }
    }
//Limpia el estado anterior de los botones de respuesta, eliminando las clases correctas e incorrectas
    function clearStatusClass(element) {
      element.classList.remove('color-correct');
      element.classList.remove('color-wrong');
    }
//Cambia el texto de las respuestas a su formato original, ya que la API devuelve el texto en formato HTML
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
  }

  // --- BLOQUE PARA results.html ---
  const scoreSpan = document.getElementById('score');
  const totalSpan = document.getElementById('total');
  const messageParagraph = document.getElementById('result-message');

  if (scoreSpan && totalSpan && messageParagraph) {
    const datos = JSON.parse(localStorage.getItem('usuarioQuiz'));

    if (datos) {
      const correctas = datos.correctas;
      const total = datos.total;

      scoreSpan.textContent = correctas;
      totalSpan.textContent = '/' + total;

      const porcentaje = (correctas / total) * 100;
      let mensaje = "";

      if (porcentaje === 100) {
        mensaje = "¡Perfecto! ¡Excelente trabajo!";
      } else if (porcentaje >= 70) {
        mensaje = "¡Buen trabajo!";
      } else if (porcentaje >= 50) {
        mensaje = "No está mal, pero puedes mejorar.";
      } else {
        mensaje = "Necesitas practicar más. ¡Ánimo!";
      }

      messageParagraph.textContent = mensaje;
    } else {
      scoreSpan.textContent = '0';
      totalSpan.textContent = '/0';
      messageParagraph.textContent = 'No se encontraron resultados. ¿Jugamos una partida?';
    }
  }
});

//bloque para la gráfica de Chart
const ctx = document.getElementById('myChart')
const labels = ['Correctas', 'Incorrectas',]
const datos = JSON.parse(localStorage.getItem('usuarioQuiz'));
const correctas = datos.correctas;
const total = datos.total;
const data = {
 type: 'polarArea',
 data: {
   labels: labels,
   datasets: [
     {
       label: 'Quiz Results',
       backgroundColor: ['rgb(31, 250, 42)','rgb(255, 50, 50)'],
       data: [correctas, total - correctas],
     },
   ],
 },
 options: {
   scales: {
     y: {
       beginAtZero: true,
     },
   },
 },
}

new Chart(ctx, data)