import { db } from "../AdminPage/firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const name = document.getElementById("name");
const surname = document.getElementById("surname");
const email = document.getElementById("email");
const password = document.getElementById("password");
const message = document.getElementById("message");

function setMessage(text, type) {
    message.innerText = text;
    message.classList.remove("success", "error");
    if (type) message.classList.add(type);
}

document.getElementById("registerBtn").addEventListener("click", async () => {

    if (!name.value || !surname.value || !email.value || !password.value) {
        setMessage("Барлық өрістерді толтырыңыз!", "error");
        return;
    }

    try {

        await addDoc(collection(db, "login"), {

            name: name.value,
            surname: surname.value,
            email: email.value,
            password: password.value,
            createdAt: new Date()

        });

        setMessage("Тіркелу сәтті өтті!", "success");

        name.value = "";
        surname.value = "";
        email.value = "";
        password.value = "";

    } catch (error) {

        console.error(error);
        setMessage("Қате болды", "error");

    }

});