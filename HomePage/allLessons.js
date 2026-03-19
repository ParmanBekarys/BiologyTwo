import { db } from "../AdminPage/firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const container = document.getElementById("lessons-container");

const defaultImage = "../assets/banner.jpg";
async function loadLessons() {
    try {
        // Firestore-дан деректерді алу
        const querySnapshot = await getDocs(collection(db, "lessons"));
        
        // Әрбір құжат бойынша карточка жасау
        querySnapshot.forEach((doc) => {
            const lesson = doc.data();

            const image = lesson.image ? lesson.image : defaultImage;

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
            <a href="lessonPage.html?id=${doc.id}" class="startButton">Сабақты бастау</a>
        </div>
      `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Сабақтарды жүктеу қатесі:", error);
        container.innerHTML = "<p>Сабақтарды жүктеу кезінде қате пайда болды 😕</p>";
    }
}

loadLessons();
