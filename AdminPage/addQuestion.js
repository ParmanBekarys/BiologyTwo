import { db } from "./firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("lessonId");

if (!lessonId) {
  alert("Сабақ таңдалмаған!");
  window.location.href = "admin_tests_lessons.html";
}

document.getElementById("addQuestionButton").addEventListener("click", async () => {
  const questionText = document.getElementById("questionText").value.trim();
  const option1 = document.getElementById("option1").value.trim();
  const option2 = document.getElementById("option2").value.trim();
  const option3 = document.getElementById("option3").value.trim();
  const option4 = document.getElementById("option4").value.trim();
  const correctOption = parseInt(document.getElementById("correctOption").value, 10);

  if (!questionText || !option1 || !option2 || !option3 || !option4) {
    alert("Барлық өрістерді толтырыңыз!");
    return;
  }

  if (correctOption < 1 || correctOption > 4) {
    alert("Дұрыс жауап 1, 2, 3 немесе 4 болуы керек!");
    return;
  }

  const newQuestion = {
    text: questionText,
    options: [option1, option2, option3, option4],
    correctIndex: correctOption - 1
  };

  try {
    const questionsRef = doc(db, "questions", lessonId);
    const docSnap = await getDoc(questionsRef);

    let questions = [];
    if (docSnap.exists()) {
      questions = docSnap.data().questions || [];
    }

    questions.push(newQuestion);

    await setDoc(questionsRef, { questions, lessonId });

    alert("Сұрақ сәтті қосылды!");

    document.getElementById("questionText").value = "";
    document.getElementById("option1").value = "";
    document.getElementById("option2").value = "";
    document.getElementById("option3").value = "";
    document.getElementById("option4").value = "";
    document.getElementById("correctOption").value = "";

  } catch (error) {
    console.error("Қате:", error);
    alert("Сұрақты қосу мүмкін болмады!");
  }
});
