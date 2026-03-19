import { db } from "../AdminPage/firebase.js";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const authUserId = localStorage.getItem("userId");
if (!authUserId) {
    window.location.href = "../auth/auth.html";
}
const params = new URLSearchParams(window.location.search);
const viewedUserId = params.get("id") || authUserId;
const isSelf = viewedUserId === authUserId;

if (params.get("embed") === "1") {
  document.body.classList.add("profile-embed");
}

const profileName = document.getElementById("profileName");
const profileSubtitle = document.getElementById("profileSubtitle");
const avatarEl = document.getElementById("avatar");
const statScore = document.getElementById("statScore");
const statFollowers = document.getElementById("statFollowers");
const statFollowing = document.getElementById("statFollowing");
const menuBtn = document.getElementById("menuBtn");
const profileMenu = document.getElementById("profileMenu");
const logoutBtn = document.getElementById("logoutBtn");
const editBtn = document.getElementById("editBtn");
const shareBtn = document.getElementById("shareBtn");
const tabs = document.querySelectorAll(".tab");

const editModal = document.getElementById("editProfileModal");
const editClose = document.getElementById("editProfileClose");
const editForm = document.getElementById("editProfileForm");
const editName = document.getElementById("editName");
const editSurname = document.getElementById("editSurname");
const editEmail = document.getElementById("editEmail");
const editAvatarUrl = document.getElementById("editAvatarUrl");
const avatarPicker = document.getElementById("avatarPicker");
const editHint = document.getElementById("editHint");
const editSaveBtn = document.getElementById("editSaveBtn");
const achievementsGrid = document.getElementById("achievementsGrid");
const achievementsPanel = document.getElementById("achievementsPanel");
const aboutPanel = document.getElementById("aboutPanel");

const ACHIEVEMENTS = [
    { id: "score50", requiredPoints: 50, image: "../assets/score50.jpg", title: "50 ұпай" },
    { id: "score200", requiredPoints: 200, image: "../assets/score200.jpg", title: "200 ұпай" },
    { id: "score500", requiredPoints: 500, image: "../assets/score500.jpg", title: "500 ұпай" },
    { id: "score1000", requiredPoints: 1000, image: "../assets/score1000.jpg", title: "1000 ұпай" },
    { id: "score2000", requiredPoints: 2000, image: "../assets/score2000.jpg", title: "2000 ұпай" },
    { id: "score5000", requiredPoints: 5000, image: "../assets/score5000.jpg", title: "5000 ұпай" },
];

let loadedProfile = null;

function closeProfileMenu() {
    if (!profileMenu) return;
    profileMenu.classList.add("hidden");
    profileMenu.setAttribute("aria-hidden", "true");
}

function openProfileMenu() {
    if (!profileMenu) return;
    profileMenu.classList.remove("hidden");
    profileMenu.setAttribute("aria-hidden", "false");
}

async function loadProfile() {
    const docRef = doc(db, "login", viewedUserId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const d = docSnap.data();
        loadedProfile = d;
        const fullName = `${d.name || ""} ${d.surname || ""}`.trim();
        profileName.innerText = fullName || "Tima bouzid";
        profileSubtitle.innerText = d.email || "Web Designer • Morocco";
        if (avatarEl) {
            avatarEl.src = d.avatarUrl || avatarEl.src;
        }

        const pts = d.points ?? 0;
        statScore.innerHTML = `<i class="fas fa-fire-alt"></i> ${Number(pts).toLocaleString()}`;

        const friends = Array.isArray(d.friends) ? d.friends : [];
        statFollowing.innerText = friends.length.toLocaleString();

        // Followers = қанша адам өз friends-іне сізді қосқан
        const followersQ = query(collection(db, "login"), where("friends", "array-contains", viewedUserId));
        const followersSnap = await getDocs(followersQ);
        statFollowers.innerText = followersSnap.size.toLocaleString();

        renderAchievements(pts);
    }
}

function renderAchievements(userPoints) {
    if (!achievementsGrid) return;
    const pts = Number(userPoints) || 0;
    achievementsGrid.innerHTML = ACHIEVEMENTS.map((a) => {
        const unlocked = pts >= a.requiredPoints;
        return `
            <div class="achievement-card ${unlocked ? "unlocked" : "locked"}" data-required="${a.requiredPoints}">
                <div class="achievement-image-wrap">
                    <img src="${a.image}" alt="${a.title}" class="achievement-img" onerror="this.style.display='none'; this.nextElementSibling?.classList.remove('hidden');">
                    <span class="achievement-placeholder hidden">🏆</span>
                    ${unlocked ? "" : `<span class="achievement-locked-badge">${a.requiredPoints.toLocaleString()} <i class="fas fa-fire-alt"></i></span>`}
                </div>
            </div>
        `;
    }).join("");
}

loadProfile();

function openEditModal() {
    if (!editModal) return;
    editHint.textContent = "";
    const d = loadedProfile || {};
    editName.value = d.name || "";
    editSurname.value = d.surname || "";
    editEmail.value = d.email || "";
    editAvatarUrl.value = d.avatarUrl || "";
    if (avatarPicker) {
        avatarPicker.querySelectorAll(".avatar-pill").forEach((b) => b.classList.remove("active"));
        const match = avatarPicker.querySelector(`[data-avatar="${editAvatarUrl.value}"]`);
        if (match) match.classList.add("active");
    }
    editModal.classList.remove("hidden");
    editModal.setAttribute("aria-hidden", "false");
}

function closeEditModal() {
    if (!editModal) return;
    // Return focus to the trigger before hiding, so aria-hidden never applies to a focused descendant
    const trigger = editBtn;
    if (trigger) trigger.focus();
    requestAnimationFrame(() => {
        editModal.classList.add("hidden");
        editModal.setAttribute("aria-hidden", "true");
    });
}

tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
        tabs.forEach((b) => {
            b.classList.remove("active");
            b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        const tab = btn.dataset.tab;
        if (tab === "achievements" && achievementsPanel && aboutPanel) {
            achievementsPanel.classList.remove("hidden");
            aboutPanel.classList.add("hidden");
        } else if (tab === "about" && achievementsPanel && aboutPanel) {
            achievementsPanel.classList.add("hidden");
            aboutPanel.classList.remove("hidden");
        }
    });
});

if (editBtn) {
    editBtn.addEventListener("click", () => {
        if (!isSelf) return;
        openEditModal();
    });
}

// басқа адамның профилінде edit жасыру
if (editBtn && !isSelf) {
    editBtn.style.display = "none";
}

if (editClose) {
    editClose.addEventListener("click", closeEditModal);
}

if (editModal) {
    editModal.addEventListener("click", (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.dataset.close === "true") closeEditModal();
    });
}

if (editForm) {
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!isSelf) return;

        const name = (editName.value || "").trim();
        const surname = (editSurname.value || "").trim();
        const email = (editEmail.value || "").trim();
        const avatarUrl = (editAvatarUrl.value || "").trim();

        if (!name || !surname || !email) {
            editHint.textContent = "Аты, тегі және email міндетті.";
            return;
        }

        try {
            editSaveBtn.disabled = true;
            editHint.textContent = "Сақталуда...";
            const ref = doc(db, "login", authUserId);
            await updateDoc(ref, {
                name,
                surname,
                email,
                avatarUrl: avatarUrl || null
            });
            await loadProfile();
            editHint.textContent = "Сақталды!";
            setTimeout(closeEditModal, 300);
        } catch (err) {
            console.error("Профиль сақтау қатесі:", err);
            editHint.textContent = "Қате болды. Кейін қайталап көріңіз.";
        } finally {
            editSaveBtn.disabled = false;
        }
    });
}

if (avatarPicker && editAvatarUrl) {
    avatarPicker.addEventListener("click", (e) => {
        const btn = e.target.closest(".avatar-pill-img");
        if (!btn) return;
        const val = btn.dataset.avatar;
        if (!val) return;
        editAvatarUrl.value = val;
        avatarPicker.querySelectorAll(".avatar-pill").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        editHint.textContent = "Avatar таңдалды. Енді Сақтау басыңыз.";
    });
}

if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
        const shareData = { title: "BiologyTwo", text: "Менің профильім", url: window.location.href };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch {}
        }
    });
}

if (menuBtn && profileMenu) {
    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (profileMenu.classList.contains("hidden")) {
            openProfileMenu();
        } else {
            closeProfileMenu();
        }
    });

    document.addEventListener("click", (e) => {
        if (!profileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            closeProfileMenu();
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("userId");
        window.location.href = "../auth/auth.html";
    });
}
