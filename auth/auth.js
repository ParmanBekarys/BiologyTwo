import { db } from "../AdminPage/firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const message = document.getElementById("message");

function setMessage(text, type) {
    message.innerText = text;
    message.classList.remove("success", "error");
    if (type) message.classList.add(type);
}

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const querySnapshot = await getDocs(collection(db, "login"));

    let foundUser = false;
    let userId = null;
    let isAdmin = false;

    const loginValue = (email.value || "").trim();
    const passValue = (password.value || "").trim();

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const docEmail = (data.email || "").trim().toLowerCase();
        const docName = (data.name || "").trim();
        const docSurname = (data.surname || "").trim();
        const fullName = [docName, docSurname].filter(Boolean).join(" ").toLowerCase();
        const loginLower = loginValue.toLowerCase();

        const loginMatch = docEmail === loginLower
            || docName.toLowerCase() === loginLower
            || (fullName && fullName === loginLower);

        if (loginMatch && (data.password || "") === passValue) {
            foundUser = true;
            userId = doc.id;
            if (docEmail === "admin@gmail.com") isAdmin = true;
        }
    });

    if (foundUser) {
        localStorage.setItem("userId", userId);
        setMessage("Кіру сәтті!", "success");
        if (isAdmin) {
            window.location.href = "../AdminPage/admin.html";
        } else {
            window.location.href = "../HomePage/home.html";
        }
    } else {
        setMessage("Email, аты немесе пароль қате", "error");
    }

});