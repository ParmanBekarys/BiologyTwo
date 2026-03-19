import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const container = document.getElementById("lessons-container");
const defaultImage = "../assets/banner.jpg";

async function loadLessons() {
  try {
    const querySnapshot = await getDocs(collection(db, "lessons"));

    querySnapshot.forEach((lessonDoc) => {
      const lesson = lessonDoc.data();
      const image = lesson.image ? lesson.image : defaultImage;
      const lessonId = lessonDoc.id;

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
              title="Осы сабақтың сұрақтар құжатын толық өшіру"
            >
              Өшіру
            </button>
          </div>
        </div>
      `;

      container.appendChild(card);

      const deleteBtn = card.querySelector(
        `button[data-lesson-id="${lessonId}"]`
      );
      if (!deleteBtn) return;

      deleteBtn.addEventListener("click", async () => {
        const lessonIdToDelete = deleteBtn.getAttribute("data-lesson-id");
        if (!lessonIdToDelete) return;

        const ok = confirm("Расында осы сабақтың сұрақтар құжатын толық өшіргіңіз келе ме?");
        if (!ok) return;

        try {
          const questionsRef = doc(db, "questions", lessonIdToDelete);
          await deleteDoc(questionsRef);
          alert("Сұрақтар құжаты толық өшірілді!");
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
