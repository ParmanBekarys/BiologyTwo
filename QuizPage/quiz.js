import { db } from "../AdminPage/firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const container = document.getElementById("lessons-container");
const lessonsView = document.getElementById("lessons-view");
const testView = document.getElementById("test-view");
const defaultImage = "../assets/banner.jpg";

const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");
const standaloneId = urlParams.get("standaloneId");
const testType = urlParams.get("type");

if (lessonId && testType !== "standalone") {
  lessonsView.style.display = "none";
  testView.style.display = "block";
  loadAndShowTest(lessonId);
} else if (standaloneId || (testType === "standalone" && urlParams.get("id"))) {
  const id = standaloneId || urlParams.get("id");
  lessonsView.style.display = "none";
  testView.style.display = "block";
  loadAndShowStandaloneTest(id);
} else {
  loadLessons();
  loadStandaloneTests();
  initQuizTabs();
}

function initQuizTabs() {
  const tabBtns = document.querySelectorAll(".quiz-tab-btn");
  const tabContents = document.querySelectorAll(".quiz-tab-content");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      const target = document.getElementById(`quiz-tab-${tab}`);
      if (target) target.classList.add("active");
    });
  });
}

async function loadLessons() {
  try {
    const querySnapshot = await getDocs(collection(db, "lessons"));

    querySnapshot.forEach((docSnap) => {
      const lesson = docSnap.data();
      const image = lesson.image ? lesson.image : defaultImage;

      const card = document.createElement("div");
      card.className = "lazyColumnLesson";

      card.innerHTML = `
        <div class="lessonImage">
            <img src="${image}" alt="${lesson.title}">
        </div>
        <div class="lessonTitle">
            <h2>${lesson.title}</h2>
            <p>${lesson.questions} сұрақ</p>
        </div>
        <div class="lessonButton">
            <a href="quiz.html?id=${docSnap.id}" class="startButton">Тест бастау</a>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Сабақтарды жүктеу қатесі:", error);
    container.innerHTML =
      "<p>Сабақтарды жүктеу кезінде қате пайда болды 😕</p>";
  }
}

async function loadStandaloneTests() {
  const standaloneContainer = document.getElementById("standalone-tests-container");
  if (!standaloneContainer) return;
  try {
    const formatMSS = (totalSeconds) => {
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    };

    let completedIds = [];
    const userId = localStorage.getItem("userId");
    if (userId) {
      const userSnap = await getDoc(doc(db, "login", userId));
      if (userSnap.exists()) {
        completedIds = userSnap.data().completedStandaloneTests || [];
      }
    }
    const querySnapshot = await getDocs(collection(db, "standaloneTests"));
    if (querySnapshot.empty) {
      standaloneContainer.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:30px;color:#666;background:white;border-radius:15px;">
          <i class="fas fa-fire-alt" style="font-size:36px;margin-bottom:10px;opacity:0.5;"></i>
          <p>Әзірге қиын тесттер жоқ</p>
        </div>
      `;
      return;
    }
    querySnapshot.forEach((docSnap) => {
      const test = docSnap.data();
      const qCount = (test.questions || []).length;
      const totalSeconds = qCount * 30;
      const totalTimeLabel = formatMSS(totalSeconds);
      const maxPoints = qCount * 10;
      const isCompleted = completedIds.includes(docSnap.id);
      const card = document.createElement("div");
      card.className = "lazyColumnLesson";
      card.style.background = "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)";
      card.style.color = "white";
      card.style.position = "relative";
      card.innerHTML = `
        ${isCompleted ? '<div class="quiz-completed-badge"><i class="fas fa-check-circle"></i> Өтілді</div>' : ''}
        <div class="lessonImage" style="height:80px;display:flex;align-items:center;justify-content:center;background:#0F4D0F;">
          <i class="fas fa-fire-alt" style="font-size:36px;color:white;"></i>
        </div>
        <div class="lessonTitle">
          <h2 style="color:white;">${test.title || "Тест"}</h2>
          <p style="color:rgba(255,255,255,0.8);">${totalTimeLabel} минут | ${qCount} сұрақ</p>
          <p class="quiz-max-points">${maxPoints} үпай алуға болады</p>
        </div>
        <div class="lessonButton">
          <a href="quiz.html?type=standalone&id=${docSnap.id}" class="startButton">Тест бастау</a>
        </div>
      `;
      standaloneContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    standaloneContainer.innerHTML = "<p style='color:#666;'>Тесттерді жүктеу қатесі</p>";
  }
}

async function loadAndShowStandaloneTest(testId) {
  try {
    const testSnap = await getDoc(doc(db, "standaloneTests", testId));
    if (!testSnap.exists()) {
      document.getElementById("questions-container").innerHTML = "<p>Тест табылмады 😕</p>";
      return;
    }
    const test = testSnap.data();
    const questions = test.questions || [];
    document.getElementById("test-title").textContent = test.title || "Қиын тест";
    if (questions.length === 0) {
      document.getElementById("questions-container").innerHTML =
        "<p class='no-questions'>Әзірге сұрақтар жоқ.</p>";
      return;
    }
    renderQuiz(questions, test.timeLimit || 15, testId);
  } catch (err) {
    console.error(err);
    document.getElementById("questions-container").innerHTML = "<p>Тестті жүктеу қатесі 😕</p>";
  }
}

async function saveStandaloneTestPoints(testId, correctCount) {
  const userId = localStorage.getItem("userId");
  if (!userId) return;
  try {
    const userRef = doc(db, "login", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const data = userSnap.data();
    const completed = data.completedStandaloneTests || [];
    if (completed.includes(testId)) return;
    const pointsToAdd = correctCount * 10;
    await updateDoc(userRef, {
      points: increment(pointsToAdd),
      completedStandaloneTests: arrayUnion(testId)
    });
  } catch (err) {
    console.error("Үпай сақтау қатесі:", err);
  }
}

async function loadAndShowTest(lessonId) {
  try {
    const [lessonSnap, questionsSnap] = await Promise.all([
      getDoc(doc(db, "lessons", lessonId)),
      getDoc(doc(db, "questions", lessonId)),
    ]);

    if (!lessonSnap.exists()) {
      document.getElementById("questions-container").innerHTML =
        "<p>Сабақ табылмады 😕</p>";
      return;
    }

    const lesson = lessonSnap.data();
    document.getElementById("test-title").textContent = lesson.title || "Тест";

    const questions = questionsSnap.exists()
      ? questionsSnap.data().questions || []
      : [];

    if (questions.length === 0) {
      document.getElementById("questions-container").innerHTML =
        "<p class='no-questions'>Әзірге сұрақтар жоқ. Админ панельден қосыңыз.</p>";
      return;
    }

    renderQuiz(questions);
  } catch (error) {
    console.error("Тестті жүктеу қатесі:", error);
    document.getElementById("questions-container").innerHTML =
      "<p>Тестті жүктеу кезінде қате пайда болды 😕</p>";
  }
}

function renderQuiz(questions, timeLimitMinutes, standaloneTestId) {
  const container = document.getElementById("questions-container");
  container.innerHTML = "";

  let currentIndex = 0;
  let userAnswers = [];
  let timerInterval = null;
  const perQuestionSeconds = standaloneTestId ? 30 : null;

  function showQuestion(index) {
    if (index >= questions.length) {
      clearTimer();
      showResult();
      return;
    }

    const q = questions[index];
    const letters = ["А", "Б", "В", "Г"];

    const timerHtml = (timeLimitMinutes || perQuestionSeconds)
      ? `<div class="quiz-timer" id="quiz-timer"><i class="fas fa-clock"></i> <span id="timer-display">--:--</span></div>`
      : "";

    container.innerHTML = `
      ${timerHtml}
      <div class="question-card">
        <p class="question-number">${index + 1} / ${questions.length}</p>
        <h3 class="question-text">${q.text}</h3>
        <div class="options-list">
          ${q.options
            .map(
              (opt, i) => `
            <button class="option-btn" data-index="${i}">
              <span class="option-letter">${letters[i]}</span>
              <span class="option-text">${opt}</span>
            </button>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    // Таймер: қиын тесттерде әр сұраққа 30 секунд
    if (perQuestionSeconds) {
      clearTimer();
      startTimer(perQuestionSeconds, () => {
        // уақыт бітсе — жауап бермеген болып, келесі сұраққа өтеміз
        showQuestion(index + 1);
      });
    } else if (timeLimitMinutes && index === 0) {
      startTimer(timeLimitMinutes * 60, () => {
        showResult();
      });
    }

    container.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const selectedIndex = parseInt(btn.dataset.index, 10);
        userAnswers[index] = selectedIndex;
        showQuestion(index + 1);
      });
    });
  }

  function startTimer(totalSeconds, onExpire) {
    let remaining = totalSeconds;
    const displayEl = document.getElementById("timer-display");
    if (!displayEl) return;

    const updateDisplay = () => {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      displayEl.textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
      if (remaining <= 60) displayEl.parentElement.classList.add("timer-warning");
    };

    updateDisplay();
    timerInterval = setInterval(() => {
      remaining--;
      updateDisplay();
      if (remaining <= 0) {
        clearTimer();
        if (typeof onExpire === "function") onExpire();
      }
    }, 1000);
  }

  function clearTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function showResult() {
    let correct = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctIndex) correct++;
    });

    const percent = Math.round((correct / questions.length) * 100);
    const pointsEarned = correct * 10;
    const isStandalone = !!standaloneTestId;

    if (standaloneTestId && correct > 0) {
      saveStandaloneTestPoints(standaloneTestId, correct);
    }

    container.innerHTML = `
      <div class="quiz-result-card ${isStandalone ? 'quiz-result-standalone' : ''}">
        ${isStandalone ? '<div class="quiz-result-fire"><i class="fas fa-fire-alt"></i></div>' : ''}
        <h3 class="quiz-result-title">Тест аяқталды!</h3>
        <p class="result-score">${correct} / ${questions.length}</p>
        <p class="result-percent">${percent}%</p>
        ${isStandalone ? `<p class="result-points-earned"><i class="fas fa-fire-alt"></i> +${pointsEarned}</p>` : ''}
        <a href="quiz.html" class="startButton">Аяқтау</a>
      </div>
    `;
  }

  showQuestion(0);
}
