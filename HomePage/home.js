import { db } from "../AdminPage/firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const container = document.getElementById("lessons-container");
const defaultImage = "../assets/banner.jpg";
const userNameElement = document.getElementById("userName");
const userScoreElement = document.getElementById("userScore");

async function loadMainPageContent() {
  try {
    const docRef = doc(db, "mainPage", "content");
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const bannerTitleEl = document.getElementById("bannerTitle");
    const bannerImageEl = document.getElementById("bannerImage");
    if (data.bannerTitle && bannerTitleEl) bannerTitleEl.innerText = data.bannerTitle;
    if (data.bannerImage && bannerImageEl) bannerImageEl.src = data.bannerImage;
  } catch (e) {
    console.warn("Басты бет контенті жүктелмеді:", e);
  }
}

async function loadUser() {

    const userId = localStorage.getItem("userId");

    if (!userId) {
        window.location.href = "../auth/auth.html";
        return;
    }

    const docRef = doc(db, "login", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {

        const data = docSnap.data();

        userNameElement.innerText = data.name + " " + data.surname;

        const points = data.points ?? 0;
        if (userScoreElement) userScoreElement.innerHTML = `<i class="fas fa-fire-alt"></i> ${points}`;

        const navProfileImageEl = document.getElementById("navProfileImage");
        if (navProfileImageEl) navProfileImageEl.src = data.avatarUrl || "../assets/defaultAvatar.jpg";
    }

}

loadUser();
loadMainPageContent();

async function loadLessons() {
    const querySnapshot = await getDocs(collection(db, "lessons"));

    querySnapshot.forEach((doc) => {
        const lesson = doc.data();
        const image = lesson.image ? lesson.image : defaultImage;

        const card = document.createElement("div");
        card.className = "border";

        card.innerHTML = `
            <div class="imageLesson">
                <img src="${image}" alt="">
            </div>

            <div class="center">
                <div class="lessonInfo">
                    <div class="lessonTitle">${lesson.title}</div>
                    <div class="lessonDate">${lesson.time} минут, ${lesson.questions} сұрақ</div>
                </div>

                <a class="rightIcon" href="lessonPage.html?id=${doc.id}">
                    <svg class="rightWhite" viewBox="0 0 24 24" fill="none" 
                        xmlns="[w3.org](http://www.w3.org/2000/svg)">
                        <path fill-rule="evenodd" clip-rule="evenodd" 
                            d="M8.29289 4.29289C8.68342 3.90237 9.31658 3.90237
                            9.70711 4.29289L16.7071 11.2929C17.0976 11.6834
                            17.0976 12.3166 16.7071 12.7071L9.70711 19.7071C9.31658
                            20.0976 8.68342 20.0976 8.29289 19.7071C7.90237
                            19.3166 7.90237 18.6834 8.29289 18.2929L14.5858
                            12L8.29289 5.70711C7.90237 5.31658 7.90237
                            4.68342 8.29289 4.29289Z" 
                            fill="#fff"></path>
                    </svg>
                </a>
            </div>
        `;

        container.appendChild(card);
    });
}

loadLessons();
