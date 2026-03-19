import { db } from "../AdminPage/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");

const headerEl = document.getElementById("lesson-header");
const titleEl = document.getElementById("lesson-title");
const timeEl = document.getElementById("lesson-time");
const questionsEl = document.getElementById("lesson-questions");
const containerEl = document.getElementById("lesson-container");
const videoSection = document.getElementById("video-section");
const videoLinkEl = document.getElementById("video-link");
const lessonView = document.getElementById("lesson-view");
const quizView = document.getElementById("lesson-quiz-view");
const startTestBtn = document.getElementById("start-test-btn");
const quizBackBtn = document.getElementById("quiz-back-btn");
const quizContainer = document.getElementById("lesson-quiz-container");

async function loadLesson() {
    if (!lessonId) {
        containerEl.innerHTML = "<p>Сабақ табылмады 😕</p>";
        return;
    }

    const docRef = doc(db, "lessons", lessonId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const lesson = docSnap.data();

        // 🖼 Егер сурет бар болса — header фонын орнату
        if (lesson.image) {
            headerEl.style.backgroundImage = `url('${lesson.image}')`;
            headerEl.style.backgroundSize = "cover";
            headerEl.style.backgroundPosition = "center";
            headerEl.style.backgroundRepeat = "no-repeat";
        }

        // Header бөлігін жаңарту
        titleEl.textContent = lesson.title;
        timeEl.textContent = lesson.time ? `${lesson.time} минут` : "-- минут";
        questionsEl.textContent = `${lesson.questions} сұрақ`;

        // Конспект (мәтін)
        containerEl.innerHTML = `
            <div class="lesson-content">
                <h2 class="section-title">Конспект</h2>
                <pre class="content-text">${lesson.conspect}</pre>
            </div>
        `;

        // Видео сілтемесі — тек сілтемені жасыру, тест батырмасы әрқашан көрінуі керек
        if (lesson.video) {
            videoLinkEl.href = lesson.video;
            videoLinkEl.style.display = "";
        } else {
            videoLinkEl.style.display = "none";
        }

    } else {
        containerEl.innerHTML = "<p>Мұндай сабақ табылмады 😕</p>";
    }
}

// Тест бастау — сабақты жасырып, тест көрінісін көрсету
startTestBtn?.addEventListener("click", async () => {
    if (!lessonId) return;
    lessonView.style.display = "none";
    quizView.style.display = "block";
    await loadAndShowQuiz();
});

// Сабаққа оралу
quizBackBtn?.addEventListener("click", () => {
    quizView.style.display = "none";
    lessonView.style.display = "block";
});

async function loadAndShowQuiz() {
    try {
        const questionsSnap = await getDoc(doc(db, "questions", lessonId));
        const questions = questionsSnap.exists() ? questionsSnap.data().questions || [] : [];

        if (questions.length === 0) {
            quizContainer.innerHTML = `
                <div class="quiz-empty">
                    <i class="fas fa-inbox"></i>
                    <p>Әзірге сұрақтар жоқ</p>
                    <span>Админ панельден сұрақ қосуға болады</span>
                </div>
            `;
            return;
        }

        renderQuiz(questions);
    } catch (err) {
        console.error(err);
        quizContainer.innerHTML = "<p class='quiz-error'>Тестті жүктеу кезінде қате пайда болды 😕</p>";
    }
}

function renderQuiz(questions) {
    let currentIndex = 0;
    const userAnswers = [];
    const letters = ["А", "Б", "В", "Г"];

    function showQuestion(index) {
        if (index >= questions.length) {
            showResult();
            return;
        }

        const q = questions[index];
        quizContainer.innerHTML = `
            <div class="quiz-question-card">
                <div class="quiz-progress">
                    <span class="quiz-progress-text">${index + 1} / ${questions.length}</span>
                    <div class="quiz-progress-bar">
                        <div class="quiz-progress-fill" style="width: ${((index + 1) / questions.length) * 100}%"></div>
                    </div>
                </div>
                <h3 class="quiz-question-text">${q.text}</h3>
                <div class="quiz-options">
                    ${q.options.map((opt, i) => `
                        <button class="quiz-option-btn" data-index="${i}">
                            <span class="quiz-option-letter">${letters[i]}</span>
                            <span class="quiz-option-text">${opt}</span>
                        </button>
                    `).join("")}
                </div>
            </div>
        `;

        quizContainer.querySelectorAll(".quiz-option-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                userAnswers[index] = parseInt(btn.dataset.index, 10);
                showQuestion(index + 1);
            });
        });
    }

    function showResult() {
        let correct = 0;
        questions.forEach((q, i) => {
            if (userAnswers[i] === q.correctIndex) correct++;
        });
        const percent = Math.round((correct / questions.length) * 100);

        quizContainer.innerHTML = `
            <div class="quiz-result-card">
                <div class="quiz-result-icon">${percent >= 70 ? "🎉" : "📋"}</div>
                <h3>Тест аяқталды!</h3>
                <p class="quiz-result-score">${correct} / ${questions.length}</p>
                <p class="quiz-result-percent">${percent}%</p>
                <button type="button" id="quiz-back-from-result" class="quiz-back-btn">Сабаққа оралу</button>
            </div>
        `;

        document.getElementById("quiz-back-from-result")?.addEventListener("click", () => {
            quizView.style.display = "none";
            lessonView.style.display = "block";
        });
    }

    showQuestion(0);
}

loadLesson();
