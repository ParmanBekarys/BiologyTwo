
import { db } from "../AdminPage/firebase.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");

const form = document.getElementById("updateForm");
const titleInput = document.getElementById("title");
const timeInput = document.getElementById("time");
const questionsInput = document.getElementById("questions");
const videoInput = document.getElementById("video");
const conspectInput = document.getElementById("conspect");
const imageInput = document.getElementById("image");

// 🔹 1. Алдымен бар деректі жүктеу
async function loadLessonData() {
  if (!lessonId) return;
  const docRef = doc(db, "lessons", lessonId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const lesson = docSnap.data();
    titleInput.value = lesson.title || "";
    timeInput.value = lesson.time || "";
    questionsInput.value = lesson.questions || "";
    videoInput.value = lesson.video || "";
    conspectInput.value = lesson.conspect || "";
    imageInput.value = lesson.image || "";
  } else {
    alert("Мұндай сабақ табылмады 😕");
  }
}

loadLessonData();

// 🔹 2. Өзгерістерді сақтау
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = titleInput.value;
  const time = timeInput.value;
  const questions = Number(questionsInput.value);
  const video = videoInput.value;
  const conspect = conspectInput.value;
  const imageURL = (imageInput.value || "").trim();

  const lessonRef = doc(db, "lessons", lessonId);

  try {
    const updateData = {
      title,
      time,
      questions,
      video,
      conspect
    };

    if (imageURL) updateData.image = imageURL;

    await updateDoc(lessonRef, updateData);

    alert("Сабақ сәтті жаңартылды ✅");
    window.location.href = `change_lessons.html?id=${lessonId}`; // артқа қайту

  } catch (err) {
    console.error(err);
    alert("Өзгерістерді сақтау мүмкін болмады 😕");
  }
});
