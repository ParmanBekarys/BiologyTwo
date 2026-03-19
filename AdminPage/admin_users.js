import { db } from "./firebase.js";
import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const defaultAvatar = "../assets/defaultAvatar.jpg";

const usersList = document.getElementById("users-list");
const usersEmpty = document.getElementById("users-empty");
const usersError = document.getElementById("users-error");
const profileModal = document.getElementById("profile-modal");
const profileModalIframe = document.getElementById("profile-modal-iframe");
const profileModalClose = document.getElementById("profileModalClose");
const profileModalBackdrop = document.getElementById("profileModalBackdrop");

function openProfileModal(url) {
  if (!profileModal || !profileModalIframe) return;
  profileModalIframe.src = url;
  profileModal.classList.remove("hidden");
  profileModal.setAttribute("aria-hidden", "false");
}

function closeProfileModal() {
  if (!profileModal || !profileModalIframe) return;
  profileModal.classList.add("hidden");
  profileModal.setAttribute("aria-hidden", "true");
  profileModalIframe.src = "about:blank";
}

if (profileModalClose) profileModalClose.addEventListener("click", closeProfileModal);
if (profileModalBackdrop) profileModalBackdrop.addEventListener("click", closeProfileModal);

function showError(msg) {
  if (usersError) {
    usersError.textContent = msg;
    usersError.classList.remove("hidden");
  }
  if (usersEmpty) usersEmpty.classList.add("hidden");
}

function hideError() {
  if (usersError) usersError.classList.add("hidden");
}

async function loadUsers() {
  hideError();
  if (usersEmpty) usersEmpty.classList.add("hidden");
  if (usersList) usersList.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "login"));
    if (snapshot.empty) {
      if (usersEmpty) usersEmpty.classList.remove("hidden");
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const userId = docSnap.id;
      const name = [data.name, data.surname].filter(Boolean).join(" ") || "—";
      const email = data.email || "—";
      const avatarUrl = data.avatarUrl || defaultAvatar;

      const card = document.createElement("div");
      card.className = "user-card";
      const profileUrl = "../ProfilePage/profile.html?id=" + encodeURIComponent(userId) + "&embed=1";
      card.innerHTML = `
        <img class="user-avatar" src="${escapeHtml(avatarUrl)}" alt="" onerror="this.src='${defaultAvatar}'">
        <div class="user-info">
          <p class="user-name">${escapeHtml(name)}</p>
          <p class="user-email">${escapeHtml(email)}</p>
        </div>
        <div class="user-actions">
          <button type="button" class="user-btn user-btn-profile" data-profile-url="${profileUrl.replace(/"/g, '&quot;')}">Профиль</button>
          <button type="button" class="user-btn user-btn-delete" data-user-id="${escapeHtml(userId)}" data-user-name="${escapeHtml(name)}">Өшіру</button>
        </div>
      `;

      const profileBtn = card.querySelector(".user-btn-profile");
      profileBtn.addEventListener("click", () => openProfileModal(profileBtn.dataset.profileUrl));
      const deleteBtn = card.querySelector(".user-btn-delete");
      deleteBtn.addEventListener("click", () => confirmDelete(userId, deleteBtn.dataset.userName, card));

      usersList.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    showError("Пайдаланушыларды жүктеу қатесі: " + (err.message || "белгісіз"));
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function confirmDelete(userId, userName, cardEl) {
  const msg = `«${userName}» пайдаланушысын өшіргіңіз келетініне сенімдісіз бе? Бұл кері қайтарылмайды.`;
  if (!confirm(msg)) return;

  try {
    await deleteDoc(doc(db, "login", userId));
    if (cardEl && cardEl.parentNode) cardEl.remove();
    const remaining = usersList.querySelectorAll(".user-card").length;
    if (remaining === 0 && usersEmpty) usersEmpty.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    alert("Өшіру сәтсіз: " + (err.message || "белгісіз"));
  }
}

loadUsers();
