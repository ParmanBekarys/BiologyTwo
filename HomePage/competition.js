import { db } from "../AdminPage/firebase.js";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const userId = localStorage.getItem("userId");
if (!userId) {
    window.location.href = "../auth/auth.html";
} else {

const friendsContainer = document.getElementById("friends-list");
const allContainer = document.getElementById("all-list");
const tabBtns = document.querySelectorAll(".leaders-tab-btn");
const tabContents = document.querySelectorAll(".leaders-tab-content");
const searchInput = document.getElementById("leadersSearch");
const searchBtn = document.getElementById("leadersSearchBtn");
const friendModal = document.getElementById("friend-profile-modal");
const friendModalClose = document.getElementById("friendProfileClose");
const friendAvatarEl = document.getElementById("friendProfileAvatar");
const friendNameEl = document.getElementById("friendProfileName");
const friendSubtitleEl = document.getElementById("friendProfileSubtitle");
const friendPointsEl = document.getElementById("friendProfilePoints");
const friendFollowersEl = document.getElementById("friendProfileFollowers");
const friendFollowingEl = document.getElementById("friendProfileFollowing");
const friendProfileBtn = document.getElementById("friendProfileBtn");
const friendActionBtn = document.getElementById("friendActionBtn");

let friendsList = [];
let allList = [];
let friendIds = [];
let currentFriendId = null;
const defaultAvatar = "../assets/defaultAvatar.jpg";

// Поіск — ат бойынша сүзу
function filterByName(list, query) {
    if (!query || !query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter((item) => (item.name || "").toLowerCase().includes(q));
}

function applySearch() {
    if (!friendsContainer || !allContainer) return;
    const query = (searchInput ? searchInput.value : "").trim();
    // Екі табты да әрқашан жаңарту — ауыстырғанда дұрыс деректер көрсетіледі
    const filteredFriends = filterByName(friendsList, query);
    let friendsEmptyMsg = "<p>Достарыңыз әзірге жоқ</p><p>«Барлығы» табынан адамды іздеп, «Дос қосу» батырмасын басыңыз</p>";
    if (friendsList.length > 0 && filteredFriends.length === 0)
        friendsEmptyMsg = "<p>Сәйкес нәтиже табылмады</p><p>Атын басқаша енгізіп көріңіз</p>";
    renderLeaderCards(filteredFriends, friendsContainer, friendsEmptyMsg, false);

    const filteredAll = filterByName(allList, query);
    let allEmptyMsg = "<p>Әзірге бірде-бір адамның ұпайы жоқ</p><p>Қиын тесттерді тапсырып үпай жинаңыз!</p>";
    if (allList.length > 0 && filteredAll.length === 0)
        allEmptyMsg = "<p>Сәйкес нәтиже табылмады</p><p>Атын басқаша енгізіп көріңіз</p>";
    renderLeaderCards(filteredAll, allContainer, allEmptyMsg, true);
}

if (searchInput) {
    searchInput.addEventListener("input", applySearch);
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            applySearch();
        }
    });
}
if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        applySearch();
    });
}

// Таб ауыстыру — деректер бар, тек көрсетуді ауыстырамыз
tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        tabBtns.forEach((b) => b.classList.remove("active"));
        tabContents.forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        const target = document.getElementById(`leaders-tab-${tab}`);
        if (target) target.classList.add("active");
        applySearch();
    });
});

function renderLeaderCards(list, container, emptyMsg = null, showAddFriend = false) {
    if (list.length === 0) {
        const msg = emptyMsg || "<p>Әзірге бірде-бір адамның ұпайы жоқ</p><p>Қиын тесттерді тапсырып үпай жинаңыз!</p>";
        container.innerHTML = `<div class="empty-state">${msg}</div>`;
        return;
    }

    const top3 = list.slice(0, 3);
    const rest = list.slice(3);

    let html = "";
    if (top3.length > 0) {
        html += '<div class="podium">';
        const podiumOrder = [1, 0, 2];
        podiumOrder.forEach((idx) => {
            if (top3[idx]) {
                const item = top3[idx];
                const rank = idx + 1;
                const medal = { 1: '🥇', 2: '🥈', 3: '🥉' }[rank] || '';
                const avatar = item.avatarUrl || defaultAvatar;
                html += `
                <div class="podium-card rank-${rank}" data-user-id="${item.id}">
                    <div class="podium-medal">${medal}</div>
                    <div class="podium-avatar">
                        <img src="${avatar}" alt="${item.name || "Аватар"}">
                    </div>
                    <div class="podium-name">${item.name}</div>
                    <div class="podium-bottom-row">
                        <div class="podium-points"><i class="fas fa-fire-alt"></i> ${item.points}</div>
                        <button type="button" class="leader-profile-btn" data-user-id="${item.id}">
                            <span class="material-symbols-outlined">person</span>
                        </button>
                    </div>
                </div>`;
            }
        });
        html += "</div>";
    }

    if (rest.length > 0) {
        html += '<div class="leaders-list">';
        rest.forEach((item, i) => {
            const rank = top3.length + i + 1;
            const avatar = item.avatarUrl || defaultAvatar;
            html += `
            <div class="leader-card" data-user-id="${item.id}">
                <span class="leader-rank">${rank}</span>
                <div class="leader-info">
                    <div class="leader-avatar">
                        <img src="${avatar}" alt="${item.name || "Аватар"}">
                    </div>
                    <div class="leader-text">
                        <div class="leader-name">${item.name}</div>
                        <div class="leader-points"><i class="fas fa-fire-alt"></i> ${item.points}</div>
                    </div>
                    <button type="button" class="leader-profile-btn" data-user-id="${item.id}">
                        <span class="material-symbols-outlined">person</span>
                    </button>
                </div>
            </div>`;
        });
        html += "</div>";
    }

    container.innerHTML = html;
}

function openFriendModal(friendId) {
    if (!friendModal) return;
    currentFriendId = friendId;
    friendModal.classList.remove("hidden");
}

function closeFriendModal() {
    if (!friendModal) return;
    currentFriendId = null;
    friendModal.classList.add("hidden");
}

async function loadFriendProfile(friendId) {
    if (!friendAvatarEl) return;
    friendAvatarEl.src = defaultAvatar;
    try {
        const snap = await getDoc(doc(db, "login", friendId));
        if (!snap.exists()) return;
        const d = snap.data();
        const fullName = `${d.name || ""} ${d.surname || ""}`.trim() || "Аноним";
        friendAvatarEl.src = (d.avatarUrl && d.avatarUrl.trim()) ? d.avatarUrl : defaultAvatar;
        friendAvatarEl.onerror = function () { this.src = defaultAvatar; };
        friendNameEl.textContent = fullName;
        friendSubtitleEl.textContent = d.email || "Биология оқушысы";
        friendPointsEl.textContent = (d.points ?? 0).toLocaleString();

        // Following
        const friendsArr = Array.isArray(d.friends) ? d.friends : [];
        friendFollowingEl.textContent = friendsArr.length.toLocaleString();

        // Followers
        const followersQ = query(collection(db, "login"), where("friends", "array-contains", friendId));
        const followersSnap = await getDocs(followersQ);
        friendFollowersEl.textContent = followersSnap.size.toLocaleString();

        const isFriend = friendIds.includes(friendId);
        friendActionBtn.textContent = isFriend ? "Дос болмау" : "Дос болу";
        friendActionBtn.dataset.friendId = friendId;
        openFriendModal(friendId);
    } catch (err) {
        console.error("Профильді жүктеу қатесі:", err);
    }
}

async function addFriend(friendId) {
    if (!friendId || friendId === userId || friendIds.includes(friendId)) return;
    try {
        const userRef = doc(db, "login", userId);
        await updateDoc(userRef, { friends: arrayUnion(friendId) });
        friendIds.push(friendId);
        await renderFriendsLeaders();
        await renderAllLeaders();
        applySearch();
    } catch (err) {
        console.error("Дос қосу қатесі:", err);
    }
}

async function removeFriend(friendId) {
    if (!friendId || friendId === userId || !friendIds.includes(friendId)) return;
    try {
        const userRef = doc(db, "login", userId);
        await updateDoc(userRef, { friends: arrayRemove(friendId) });
        friendIds = friendIds.filter((id) => id !== friendId);
        await renderFriendsLeaders();
        await renderAllLeaders();
        applySearch();
    } catch (err) {
        console.error("Дос болмау қатесі:", err);
    }
}

allContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".leader-profile-btn");
    if (!btn) return;
    const id = btn.dataset.userId || btn.closest(".leader-card, .podium-card")?.dataset.userId;
    if (!id || id === userId) return;
    e.preventDefault();
    loadFriendProfile(id);
});

friendsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".leader-profile-btn");
    if (!btn) return;
    const id = btn.dataset.userId || btn.closest(".leader-card, .podium-card")?.dataset.userId;
    if (!id || id === userId) return;
    e.preventDefault();
    loadFriendProfile(id);
});

if (friendModalClose) {
    friendModalClose.addEventListener("click", () => closeFriendModal());
}

if (friendModal) {
    friendModal.addEventListener("click", (e) => {
        if (e.target === friendModal) closeFriendModal();
    });
}

if (friendActionBtn) {
    friendActionBtn.addEventListener("click", async () => {
        const id = friendActionBtn.dataset.friendId;
        if (!id) return;
        const isFriend = friendIds.includes(id);
        if (isFriend) {
            await removeFriend(id);
        } else {
            await addFriend(id);
        }
        friendActionBtn.textContent = friendIds.includes(id) ? "Дос болмау" : "Дос болу";
    });
}

if (friendProfileBtn) {
    friendProfileBtn.addEventListener("click", () => {
        if (!currentFriendId) return;
        window.location.href = `../ProfilePage/profile.html?id=${encodeURIComponent(currentFriendId)}`;
    });
}

async function renderFriendsLeaders() {
    friendsContainer.innerHTML = "<div class='empty-state'><p>Жүктелуде...</p></div>";
    const userSnap = await getDoc(doc(db, "login", userId));
    const friends = (userSnap.exists() && userSnap.data().friends) || [];
    friendIds = friends;
    if (friends.length === 0) {
        friendsList = [];
        friendsContainer.innerHTML = `<div class="empty-state">
            <p>Достарыңыз әзірге жоқ</p>
            <p>«Барлығы» табынан адамды іздеп, «Дос қосу» батырмасын басыңыз</p>
        </div>`;
        applySearch();
        return;
    }
    const list = [];
    for (const fid of friends) {
        const snap = await getDoc(doc(db, "login", fid));
        if (snap.exists()) {
            const d = snap.data();
            const pts = d.points ?? 0;
            list.push({
                id: fid,
                name: `${d.name || ""} ${d.surname || ""}`.trim() || "Аноним",
                points: pts,
                avatarUrl: d.avatarUrl || null
            });
        }
    }
    list.sort((a, b) => b.points - a.points);
    friendsList = list;
    applySearch();
}

async function renderAllLeaders() {
    allContainer.innerHTML = "<div class='empty-state'><p>Жүктелуде...</p></div>";
    try {
        const snap = await getDocs(collection(db, "login"));
        const list = [];
        snap.forEach((docSnap) => {
            const data = docSnap.data();
            const pts = data.points ?? 0;
            list.push({
                id: docSnap.id,
                name: `${data.name || ""} ${data.surname || ""}`.trim() || "Аноним",
                points: pts,
                avatarUrl: data.avatarUrl || null
            });
        });
        list.sort((a, b) => (b.points || 0) - (a.points || 0));
        allList = list;
        applySearch();
    } catch (err) {
        console.error("Лидерлерді жүктеу қатесі:", err);
        allContainer.innerHTML = `<div class="empty-state"><p>Қате: ${err.message}</p></div>`;
    }
}

renderFriendsLeaders();
renderAllLeaders();
}
