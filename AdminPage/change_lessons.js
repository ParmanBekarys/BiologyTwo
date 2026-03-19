import { db } from "../AdminPage/firebase.js";
// import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");

const headerEl = document.getElementById("lesson-header");
const titleEl = document.getElementById("lesson-title");
const timeEl = document.getElementById("lesson-time");
const questionsEl = document.getElementById("lesson-questions");
const containerEl = document.getElementById("lesson-container");
const videoLinkEl = document.getElementById("video-link");
const updateBtn = document.getElementById("updateBtn");
const deleteBtn = document.getElementById("deleteBtn");

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

        updateBtn.innerHTML = `
            <a href="updateLesson.html?id=${lessonId}" class="update">
                <i class="fas fa-play-circle"></i> Өзгерту
            </a>
        `;

        deleteBtn.addEventListener("click", async () => {

            const confirmDelete = confirm("Бұл сабақты өшіргіңіз келе ме?");

            if (!confirmDelete) return;

            try {

                const lessonRef = doc(db, "lessons", lessonId);
                await deleteDoc(lessonRef);

                alert("Сабақ өшірілді ✅");

                window.location.href = "admin_lessons.html";

            } catch (error) {

                console.error(error);
                alert("Өшіру мүмкін болмады ❌");

            }

        });

        // Видео сілтемесі
        if (lesson.video) {
            videoLinkEl.href = lesson.video;
        } else {
            document.getElementById("video-section").style.display = "none";
        }

    } else {
        containerEl.innerHTML = "<p>Мұндай сабақ табылмады 😕</p>";
    }
}

loadLesson();
