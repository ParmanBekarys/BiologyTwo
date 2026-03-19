import { db } from "./firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const MAIN_PAGE_COLLECTION = "mainPage";
const MAIN_PAGE_DOC_ID = "content";

const form = document.getElementById("mainPageForm");
const bannerTitleInput = document.getElementById("bannerTitle");
const bannerImageInput = document.getElementById("bannerImage");
const formHint = document.getElementById("formHint");
const saveBtn = document.getElementById("saveBtn");

async function loadMainPageContent() {
  const docRef = doc(db, MAIN_PAGE_COLLECTION, MAIN_PAGE_DOC_ID);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    bannerTitleInput.value = data.bannerTitle || "";
    bannerImageInput.value = data.bannerImage || "";
  }
}

loadMainPageContent();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!saveBtn) return;

  const bannerTitle = (bannerTitleInput.value || "").trim();
  const bannerImage = (bannerImageInput.value || "").trim();

  saveBtn.disabled = true;
  formHint.textContent = "Сақталуда...";
  formHint.style.color = "";

  try {
    const docRef = doc(db, MAIN_PAGE_COLLECTION, MAIN_PAGE_DOC_ID);
    await setDoc(docRef, {
      bannerTitle: bannerTitle || null,
      bannerImage: bannerImage || null
    }, { merge: true });

    formHint.textContent = "Сәтті сақталды.";
    formHint.style.color = "var(--accent, #256C40)";
  } catch (err) {
    console.error(err);
    formHint.textContent = "Қате: " + (err.message || "сақтау сәтсіз.");
    formHint.style.color = "#c00";
  } finally {
    saveBtn.disabled = false;
  }
});
