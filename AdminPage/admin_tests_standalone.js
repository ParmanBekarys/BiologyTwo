import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

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
          <a href="addStandaloneQuestion.html?testId=${docSnap.id}" class="startButton">Сұрақ қосу</a>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Тесттерді жүктеу қатесі:", error);
    container.innerHTML = "<p>Тесттерді жүктеу кезінде қате пайда болды 😕</p>";
  }
}

loadStandaloneTests();
