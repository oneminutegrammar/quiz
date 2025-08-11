let quizzes = {};
let currentQuiz = null;          // Initialize as null (no quiz selected yet)
let currentQuestionIndex = 0;    // Start index at 0, but only used after quiz starts
let selectedOption = null;

let correctCount = 0;
let wrongCount = 0;

function showFancyAlert(message) {
  const alertBox = document.getElementById('fancy-alert');
  const alertMessage = document.getElementById('fancy-alert-message');
  alertMessage.textContent = message;
  alertBox.style.display = 'flex';
}

function playSuccessSound() {
  const sound = document.getElementById("ding");
  sound.currentTime = 0;  // rewind to start
  sound.play();

}

// Confetti function
function launchConfetti() {
  const container = document.getElementById("confetti-container");
  const colors = ['#39FF14', '#0f9d0f', '#7cff4c', '#32cd32']; // neon green shades

  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    // Random position within viewport width
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.top = Math.random() * 50 + "px"; // start near top

    // Random delay so confetti falls staggered
    confetti.style.animationDelay = (Math.random() * 0.7) + "s";

    container.appendChild(confetti);

    // Remove confetti after animation finishes (~1.5s)
    setTimeout(() => {
      confetti.remove();
    }, 1500);
  }
}

async function fetchAndParseQuizzes() {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZZAuNqckuPRXMEKR3VD7XUV61wJGxMy2u4W8azcfY3AogNJjVey2Cmmcd4hYc-wA4c3cZkGpiChkY/pub?gid=0&single=true&output=csv';

  const response = await fetch(csvUrl);
  const csvText = await response.text();

  // Parse CSV rows
  const rows = csvText.trim().split('\n').map(row => {
    // This simple split might break if your text contains commas.
    // For more robust parsing, consider using a CSV parser library like PapaParse.
    return row.split(',');
  });

  // Extract headers and remove from rows
  const headers = rows.shift();

  const quizzes = {};

  rows.forEach(row => {
    const [
      quizTitle,
      question,
      option1,
      option2,
      option3,
      option4,
      correctAnswer
    ] = row;

    if (!quizzes[quizTitle]) {
      quizzes[quizTitle] = [];
    }

    quizzes[quizTitle].push({
      question,
      options: [option1, option2, option3, option4],
      answer: Number(correctAnswer) - 1 // zero-based index
    });
  });

  return quizzes; // Object with quiz titles as keys and arrays of questions as values
}



const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZZAuNqckuPRXMEKR3VD7XUV61wJGxMy2u4W8azcfY3AogNJjVey2Cmmcd4hYc-wA4c3cZkGpiChkY/pub?gid=0&single=true&output=csv'; // Replace with your CSV URL

    quizzes = {};
    currentQuiz = null;
    currentQuestionIndex = 0;
    selectedOption = null;

    const quizSelector = document.getElementById('quiz-selector');
    const quizContainer = document.getElementById('quiz-container');
    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const resultEl = document.getElementById('result');

    // Fetch and parse CSV
    async function loadQuizzes() {
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          console.log(results.data[0]); 
          parseQuizzes(results.data);
          renderQuizButtons();
        }
      });
    }

    // Organize quizzes by title
    function parseQuizzes(data) {
      quizzes = {};
      data.forEach(row => {
        const quizTitle = row['Quiz Title'];
        if (!quizzes[quizTitle]) quizzes[quizTitle] = [];

        quizzes[quizTitle].push({
          question: row['Question'],
          options: [
            row['Option 1'],
            row['Option 2'],
            row['Option 3'],
            row['Option 4']
          ],
          answer: Number(row['Correct Answer (1-4)']) - 1
        });
      });
    }

    // Create quiz selection buttons
    function renderQuizButtons() {
  const titles = Object.keys(quizzes);
  if (titles.length === 0) {
    quizSelector.innerHTML = "<p>Сорил олдсонгүй.</p>";
    return;
  }

  quizSelector.innerHTML = '<h3>Сорилоо сонгоно уу:</h3>';
  titles.forEach(title => {
    const btn = document.createElement('button');
    btn.style.display = 'flex';
    btn.style.justifyContent = 'space-between';
    btn.style.width = '100%';
    btn.style.padding = '8px 12px';
    btn.style.marginBottom = '6px';

    const titleSpan = document.createElement('span');
    titleSpan.textContent = title;

    const countSpan = document.createElement('span');
    countSpan.textContent = `${quizzes[title].length} асуулт`;

    btn.appendChild(titleSpan);
    btn.appendChild(countSpan);

    btn.onclick = () => startQuiz(title);
    quizSelector.appendChild(btn);
  });
}

    function startQuiz(title) {
      currentQuiz = quizzes[title];
      currentQuestionIndex = 0;
      selectedOption = null;
      quizSelector.style.display = 'none';
      quizContainer.style.display = 'block';
      resultEl.textContent = '';
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'inline-block';
      showQuestion();
    }

    function showQuestion() {
  selectedOption = null;
  const q = currentQuiz[currentQuestionIndex];
  
  // Add question number before text
  questionEl.textContent = `${currentQuestionIndex + 1}. ${q.question}`;
  
  optionsEl.innerHTML = '';

  q.options.forEach((opt, idx) => {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'option';
    radio.value = idx;
    radio.onclick = () => {
      selectedOption = idx;
      resultEl.textContent = '';
    };
    label.appendChild(radio);
    label.appendChild(document.createTextNode(' ' + opt));
    optionsEl.appendChild(label);
  });
}

    correctCount = 0;
    wrongCount = 0;

    submitBtn.onclick = () => {
    if (selectedOption === null) {
        showFancyAlert('Хариултаа сонгоно уу!');
        return;
    }
    const q = currentQuiz[currentQuestionIndex];
    if (selectedOption === q.answer) {
        correctCount++;
        resultEl.textContent = '✅ Correct!';
        resultEl.style.color = '#0f0';
        playSuccessSound();
        launchConfetti();
    } else {
        wrongCount++;
        resultEl.textContent = `❌ Зөв хариулт: ${q.options[q.answer]}`;
        resultEl.style.color = '#f00';
    }
    submitBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';
    };

    nextBtn.onclick = () => {
        if (!currentQuiz) {
    // No quiz started, just return early — do nothing
        return;
        }
    currentQuestionIndex++;
    if (currentQuestionIndex >= currentQuiz.length) {
        if(correctCount == currentQuiz.length){
        showFancyAlert(`Та бүгдийг зөв хариуллаа! 😮🎉`);
        } else {
        showFancyAlert(`Таны зөв хариултууд: ${correctCount} / ${currentQuiz.length}`);
        }
        quizContainer.style.display = 'none';
        quizSelector.style.display = 'block';
        submitBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        resultEl.textContent = '';

        correctCount = 0;
        wrongCount = 0;
    } else {
        showQuestion();
        submitBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';
        resultEl.textContent = '';
    }
    };

    // Load quizzes on page load
    loadQuizzes();