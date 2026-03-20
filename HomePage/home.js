import { db } from "../AdminPage/firebase.js";
import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const HOME_LESSONS_LIMIT = 5;

const container = document.getElementById("lessons-container");
const defaultImage = "../assets/banner.jpg";

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
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

function lessonCreatedMs(data) {
    const c = data?.createdAt;
    if (c && typeof c.toMillis === "function") return c.toMillis();
    if (c && typeof c.seconds === "number") return c.seconds * 1000;
    return 0;
}

function appendLessonCard(lessonDoc) {
    const lesson = lessonDoc.data();
    const image = lesson.image ? lesson.image : defaultImage;

    const card = document.createElement("article");
    card.className = "lesson-card";

    const safeTitle = escapeHtml(lesson.title || "Сабақ");

    card.innerHTML = `
            <a class="lesson-card-link" href="lessonPage.html?id=${lessonDoc.id}">
                <div class="lesson-card-media">
                    <img src="${image}" alt="${safeTitle}" loading="lazy">
                    <span class="lesson-card-arrow" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M8.29289 4.29289C8.68342 3.90237 9.31658 3.90237 9.70711 4.29289L16.7071 11.2929C17.0976 11.6834 17.0976 12.3166 16.7071 12.7071L9.70711 19.7071C9.31658 20.0976 8.68342 20.0976 8.29289 19.7071C7.90237 19.3166 7.90237 18.6834 8.29289 18.2929L14.5858 12L8.29289 5.70711C7.90237 5.31658 7.90237 4.68342 8.29289 4.29289Z"
                                fill="currentColor"></path>
                        </svg>
                    </span>
                </div>
                <div class="lesson-card-body">
                    <h3 class="lesson-card-title" title="${safeTitle}">${safeTitle}</h3>
                    <p class="lesson-card-meta">
                        <span class="lesson-card-meta-item"><i class="fas fa-clock" aria-hidden="true"></i> ${lesson.time ?? "—"} мин</span>
                        <span class="lesson-card-meta-dot">·</span>
                        <span class="lesson-card-meta-item"><i class="fas fa-question-circle" aria-hidden="true"></i> ${lesson.questions ?? "—"} сұрақ</span>
                    </p>
                </div>
            </a>
        `;

    container.appendChild(card);
}

async function loadLessons() {
    if (!container) return;
    container.innerHTML = "";

    try {
        const q = query(
            collection(db, "lessons"),
            orderBy("createdAt", "desc"),
            limit(HOME_LESSONS_LIMIT)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            snapshot.forEach((d) => appendLessonCard(d));
            return;
        }
    } catch (e) {
        console.warn("Соңғы сабақтар сұрауы (createdAt):", e);
    }

    const allSnap = await getDocs(collection(db, "lessons"));
    const docs = [];
    allSnap.forEach((d) => docs.push(d));
    docs.sort((a, b) => {
        const ta = lessonCreatedMs(a.data());
        const tb = lessonCreatedMs(b.data());
        if (tb !== ta) return tb - ta;
        return b.id.localeCompare(a.id);
    });
    docs.slice(0, HOME_LESSONS_LIMIT).forEach((d) => appendLessonCard(d));
}

loadLessons();
