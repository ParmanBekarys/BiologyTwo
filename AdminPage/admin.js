// admin.js
import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

document.getElementById("addLessonButton").addEventListener("click", async () => {
    const title = document.getElementById("lessonTitle").value;
    const time = document.getElementById("lessonTime").value;
    const questions = Number(document.getElementById("lessonQuestions").value);
    const video = document.getElementById("lessonVideo").value;
    const conspect = document.getElementById("lessonConspect").value;
    const image = document.getElementById("lessonImage").value;


    if (!title || !time || !questions || !video || !conspect) {
        alert("Барлық өрістерді толтырыңыз!");
        return;
    }

    try {
        await addDoc(collection(db, "lessons"), {
            title,
            time,
            questions,
            video,
            conspect,
            image,
            createdAt: new Date()
        });
        alert("Сабақ сәтті қосылды!");

        // Форманы тазалау
        document.getElementById("lessonTitle").value = "";
        document.getElementById("lessonTime").value = "";
        document.getElementById("lessonQuestions").value = "";
        document.getElementById("lessonVideo").value = "";
        document.getElementById("lessonImage").value = "";
        document.getElementById("lessonConspect").value = "";

    } catch (error) {
        console.error("Қате:", error);
        alert("Сабақты қосу мүмкін болмады!");
    }
});