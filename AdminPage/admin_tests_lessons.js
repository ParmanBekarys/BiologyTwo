import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const container = document.getElementById("lessons-container");
const defaultImage = "../assets/banner.jpg";

async function loadLessons() {
  try {
    const querySnapshot = await getDocs(collection(db, "lessons"));

    querySnapshot.forEach((doc) => {
      const lesson = doc.data();
      const image = lesson.image ? lesson.image : defaultImage;
      const lessonId = doc.id;

      const card = document.createElement("div");
      card.className = "lazyColumnLesson";

      card.innerHTML = `
        <div class="lessonImage">
            <img src="${image}" alt="${lesson.title}">
        </div>
        <div class="lessonTitle">
            <h2>${lesson.title}</h2>
            <p>${lesson.time} минут | ${lesson.questions} сұрақ</p>
        </div>
        <div class="lessonButton">
          <div style="display:flex; gap:10px; justify-content:center; width:100%;">
            <a href="addQuestion.html?lessonId=${lessonId}" class="startButton" style="text-decoration:none; display:inline-flex; justify-content:center;">
              Сұрақ қосу
            </a>
            <button
              type="button"
              class="startButton"
              data-lesson-id="${lessonId}"
              style="background:#b3261e;"
              title="Осы сабақтың барлық сұрақтарын өшіру"
            >
              Сұрақты өшіру
            </button>
          </div>
        </div>
      `;

      container.appendChild(card);

      const deleteBtn = card.querySelector('button[data-lesson-id="${lessonId}"]');
      if (!deleteBtn) return;

      deleteBtn.addEventListener("click", async () => {
        const lessonIdToDelete = deleteBtn.getAttribute("data-lesson-id");
        if (!lessonIdToDelete) return;

        const ok = confirm("Расында осы сабақтың барлық сұрақтарын өшіргіңіз келе ме?");
        if (!ok) return;

        try {
          const questionsRef = doc(db, "questions", lessonIdToDelete);
          const lessonRef = doc(db, "lessons", lessonIdToDelete);

          const beforeQuestionsSnap = await getDoc(questionsRef);
          const beforeQuestions = beforeQuestionsSnap.exists()
            ? beforeQuestionsSnap.data().questions || []
            : [];

          const beforeLessonSnap = await getDoc(lessonRef);
          const beforeLessonQuestions = beforeLessonSnap.exists()
            ? beforeLessonSnap.data().questions
            : undefined;

          alert(
            `ӨШІРУ АЛДЫНДА:\nquestions/{lessonId} саны: ${beforeQuestions.length}\nlessons.questions: ${beforeLessonQuestions}`
          );

          await setDoc(questionsRef, {
            lessonId: lessonIdToDelete,
            questions: [],
          });

          // UI карточкада көрсетілетін lesson.questions мәнін де 0 қыламыз.
          // Егер lesson құжаты жоқ болса, skip жасаймыз.
          try {
            await updateDoc(lessonRef, { questions: 0 });
          } catch (e) {
            // ignore
          }

          const afterQuestionsSnap = await getDoc(questionsRef);
          const afterQuestions = afterQuestionsSnap.exists()
            ? afterQuestionsSnap.data().questions || []
            : [];

          const afterLessonSnap = await getDoc(lessonRef);
          const afterLessonQuestions = afterLessonSnap.exists()
            ? afterLessonSnap.data().questions
            : undefined;

          alert(
            `ӨШІРУДЕН КЕЙІН:\nquestions/{lessonId} саны: ${afterQuestions.length}\nlessons.questions: ${afterLessonQuestions}`
          );

          // Пайдаланушыға ыңғайлы болу үшін бетті қайта жүктейміз.
          // Quiz бетінде нақты сұрақтар бос массив болғандықтан жұмыс істейді.
          window.location.href = "admin_tests_lessons.html";
        } catch (error) {
          console.error("Сұрақтарды өшіру қатесі:", error);
          alert("Сұрақтарды өшіру мүмкін болмады!");
        }
      });
    });
  } catch (error) {
    console.error("Сабақтарды жүктеу қатесі:", error);
    container.innerHTML = "<p>Сабақтарды жүктеу кезінде қате пайда болды 😕</p>";
  }
}

loadLessons();
