const app = document.getElementById('app');

let currentQuestionIndex = 0;
let score = 0;
let questions = [];

async function fetchQuestions() {
  const res = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
  const data = await res.json();
  questions = data.results;
  showQuestion();
}

function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    localStorage.setItem('lastScore', score);
    window.location.href = 'results.html';
    return;
  }

  const q = questions[currentQuestionIndex];
  const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);

  app.innerHTML = `
    <div class="question-card">
      <h2>Pregunta ${currentQuestionIndex + 1} de 10</h2>
      <p>${decodeHTML(q.question)}</p>
      <ul>
        ${answers.map(answer => `
          <li><button class="answer-btn">${decodeHTML(answer)}</button></li>
        `).join('')}
      </ul>
    </div>
  `;

  document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.textContent === decodeHTML(q.correct_answer)) score++;
      currentQuestionIndex++;
      showQuestion();
    });
  });
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

fetchQuestions();
