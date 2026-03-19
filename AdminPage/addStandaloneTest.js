import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

document.getElementById("addTestButton").addEventListener("click", async () => {
  const title = document.getElementById("testTitle").value.trim();

  if (!title) {
    alert("Тест атауын енгізіңіз!");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "standaloneTests"), {
      title,
      questions: [],
      createdAt: new Date()
    });

    alert("Тест сәтті құрылды!");
    window.location.href = `addStandaloneQuestion.html?testId=${docRef.id}`;
  } catch (error) {
    console.error("Қате:", error);
    alert("Тестті құру мүмкін болмады!");
  }
});
