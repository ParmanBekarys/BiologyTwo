import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const container = document.getElementById("standalone-tests-container");

async function loadStandaloneTests() {
  try {
    const querySnapshot = await getDocs(collection(db, "standaloneTests"));

    if (querySnapshot.empty) {
      container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">
          <p>Әзірге тесттер жоқ. «Жаңа тест қосу» батырмасын басыңыз.</p>
        </div>
      `;
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const test = docSnap.data();
      const questionsCount = (test.questions || []).length;

      const card = document.createElement("div");
      card.className = "lazyColumnLesson";
      card.style.background = "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)";
      card.style.color = "white";

      card.innerHTML = `
        <div class="lessonImage" style="background:#0F4D0F;height:80px;display:flex;align-items:center;justify-content:center;">
          <i class="fas fa-fire-alt" style="font-size:36px;color:white;"></i>
        </div>
        <div class="lessonTitle">
          <h2 style="color:white;">${test.title || "Тест"}</h2>
          <p style="color:rgba(255,255,255,0.8);">${test.timeLimit || 0} минут | ${questionsCount} сұрақ</p>
        </div>
        <div class="lessonButton">
          <div style="display:flex;gap:10px;justify-content:center;width:100%;">
            <a href="addStandaloneQuestion.html?testId=${docSnap.id}" class="startButton" style="text-decoration:none;display:inline-flex;justify-content:center;">
              Сұрақ қосу
            </a>
            <button
              type="button"
              class="startButton"
              data-test-id="${docSnap.id}"
              style="background:#b3261e;"
              title="Осы тест құжатын толық өшіру"
            >
              Өшіру
            </button>
          </div>
        </div>
      `;

      container.appendChild(card);

      const deleteBtn = card.querySelector(
        `button[data-test-id="${docSnap.id}"]`
      );

      if (!deleteBtn) return;

      deleteBtn.addEventListener("click", async () => {
        const testId = deleteBtn.getAttribute("data-test-id");
        if (!testId) return;

        const ok = confirm("Расында осы тест құжатын толық өшіргіңіз келе ме?");
        if (!ok) return;

        try {
          const testRef = doc(db, "standaloneTests", testId);
          await deleteDoc(testRef);
          alert("Тест құжаты толық өшірілді!");
          window.location.href = "admin_tests_standalone.html";
        } catch (error) {
          console.error("Сұрақтарды өшіру қатесі:", error);
          alert("Сұрақтарды өшіру мүмкін болмады!");
        }
      });
    });
  } catch (error) {
    console.error("Тесттерді жүктеу қатесі:", error);
    container.innerHTML = "<p>Тесттерді жүктеу кезінде қате пайда болды 😕</p>";
  }
}

loadStandaloneTests();
