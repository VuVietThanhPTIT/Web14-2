const countdownTarget = new Date("2026-02-14T00:00:00+07:00");
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

const loveForm = document.getElementById("loveForm");
const previewCard = document.getElementById("cardPreview");
const previewFrom = document.getElementById("previewFrom");
const previewTo = document.getElementById("previewTo");
const previewMessage = document.getElementById("previewMessage");
const surpriseBtn = document.getElementById("surpriseBtn");

const createLoveForm = document.getElementById("createLoveForm");
const previewTitle = document.getElementById("previewTitle");
const previewDate = document.getElementById("previewDate");
const previewText = document.getElementById("previewText");
const previewBlur = document.getElementById("previewBlur");
const unlockBtn = document.getElementById("unlockBtn");
const paymentModal = document.getElementById("paymentModal");
const confirmPay = document.getElementById("confirmPay");
const closePay = document.getElementById("closePay");
const loveDaysEl = document.getElementById("loveDays");
const loveSlugEl = document.getElementById("loveSlug");
const loveTitleEl = document.getElementById("loveTitle");
const loveSubtitleEl = document.getElementById("loveSubtitle");
const loveMessageEl = document.getElementById("loveMessage");
const loveDateHintEl = document.getElementById("loveDateHint");
const shareLinkBtn = document.getElementById("shareLink");
const qrImage = document.getElementById("qrImage");
const orderCodeEl = document.getElementById("orderCode");
const bankInfoEl = document.getElementById("bankInfo");
const paymentStatusEl = document.getElementById("paymentStatus");
const lockOverlay = document.getElementById("lockOverlay");
const adminOrdersEl = document.getElementById("adminOrders");

let db = null;
let auth = null;
function isFirebaseConfigValid(config) {
  if (!config) return false;
  const values = [config.apiKey, config.messagingSenderId, config.appId];
  return values.every((value) => value && !String(value).includes("PASTE_"));
}

if (window.firebaseConfig && window.firebase && isFirebaseConfigValid(window.firebaseConfig)) {
  firebase.initializeApp(window.firebaseConfig);
  db = firebase.firestore();
  if (firebase.auth) {
    auth = firebase.auth();
  }
} else if (window.firebaseConfig && !isFirebaseConfigValid(window.firebaseConfig)) {
  console.warn("Firebase web config chưa được điền. Vui lòng cập nhật config.js.");
}

const paymentConfig = window.paymentConfig || {
  bankCode: "VCB",
  accountNumber: "0123456789",
  accountName: "NGUYEN VAN A",
  amount: 29000
};

let currentOrderId = null;
let currentPageId = null;
let currentOrderCode = null;

const adminLoginForm = document.getElementById("adminLoginForm");
const adminEmailInput = document.getElementById("adminEmail");
const adminPasswordInput = document.getElementById("adminPassword");
const adminLoginStatus = document.getElementById("adminLoginStatus");
const adminSection = document.getElementById("adminSection");
const adminLoginSection = document.getElementById("adminLogin");
const adminLogout = document.getElementById("adminLogout");

function updateCountdown() {
  const now = new Date();
  const diff = countdownTarget - now;

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  if (diff <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  daysEl.textContent = String(days).padStart(2, "0");
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
}

function createHearts() {
  const field = document.getElementById("heartField");
  if (!field) return;
  const heart = document.createElement("span");
  heart.className = "heart";
  heart.textContent = "❤";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${12 + Math.random() * 14}px`;
  heart.style.animationDuration = `${10 + Math.random() * 12}s`;
  field.appendChild(heart);

  setTimeout(() => heart.remove(), 20000);
}

function showSurprise() {
  previewCard.classList.remove("hidden");
  previewTo.textContent = "em";
  previewFrom.textContent = "anh";
  previewMessage.textContent = "Cảm ơn em vì đã đến và làm tim anh ấm áp mỗi ngày.";
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function saveLovePage(data) {
  const existing = JSON.parse(localStorage.getItem("love_pages") || "[]");
  existing.push(data);
  localStorage.setItem("love_pages", JSON.stringify(existing));
}

function getLovePageBySlug(slug) {
  const existing = JSON.parse(localStorage.getItem("love_pages") || "[]");
  return existing.find((item) => item.slug === slug);
}

function generateOrderCode() {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `LOVE_${random}`;
}

function buildVietQRUrl(orderCode) {
  const { bankCode, accountNumber, accountName, amount } = paymentConfig;
  const params = new URLSearchParams({
    amount: String(amount),
    addInfo: orderCode,
    accountName
  });
  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?${params.toString()}`;
}

function updateLoveDays() {
  if (!loveDaysEl) return;
  const startDate = loveDaysEl.dataset.start;
  if (!startDate) return;
  const start = new Date(startDate);
  const now = new Date();
  const diff = now - start;
  if (diff < 0) return;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  loveDaysEl.textContent = `${days} ngày`;
}

function openPaymentModal() {
  if (!paymentModal) return;
  paymentModal.classList.remove("hidden");
}

function closePaymentModal() {
  if (!paymentModal) return;
  paymentModal.classList.add("hidden");
}

function setLockedState(isLocked) {
  if (!lockOverlay) return;
  document.body.classList.toggle("locked", isLocked);
  lockOverlay.classList.toggle("hidden", !isLocked);
}

if (loveForm) {
  loveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const fromName = document.getElementById("fromName").value.trim();
    const toName = document.getElementById("toName").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!fromName || !toName || !message) return;

    previewFrom.textContent = fromName;
    previewTo.textContent = toName;
    previewMessage.textContent = message;
    previewCard.classList.remove("hidden");
  });
}

if (surpriseBtn) {
  surpriseBtn.addEventListener("click", showSurprise);
}

if (createLoveForm) {
  createLoveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const yourName = document.getElementById("yourName").value.trim();
    const partnerName = document.getElementById("partnerName").value.trim();
    const startDate = document.getElementById("startDate").value;
    const message = document.getElementById("loveMessage").value.trim();

    if (!yourName || !partnerName || !startDate || !message) return;

    previewTitle.textContent = `${yourName} ❤ ${partnerName}`;
    const days = Math.max(
      0,
      Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24))
    );
    previewDate.textContent = `Đã yêu: ${days} ngày`;
    previewText.textContent = message;
  });
}

if (unlockBtn) {
  unlockBtn.addEventListener("click", async () => {
    if (!db) {
      alert("Chưa cấu hình Firebase web app. Vui lòng cập nhật config.js.");
      return;
    }
    const yourName = document.getElementById("yourName").value.trim();
    const partnerName = document.getElementById("partnerName").value.trim();
    const startDate = document.getElementById("startDate").value;
    const message = document.getElementById("loveMessage").value.trim();

    if (!yourName || !partnerName || !startDate || !message) return;

    currentOrderCode = generateOrderCode();
    const baseSlug = slugify(`${yourName}-${partnerName}`) || "love";
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const pageRef = await db.collection("love_pages").add({
      your_name: yourName,
      partner_name: partnerName,
      start_date: startDate,
      message,
      slug,
      paid: false,
      order_code: currentOrderCode,
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    currentPageId = pageRef.id;

    const orderRef = await db.collection("orders").add({
      order_code: currentOrderCode,
      page_id: currentPageId,
      amount: paymentConfig.amount,
      status: "pending",
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    });
    currentOrderId = orderRef.id;

    if (orderCodeEl) orderCodeEl.textContent = currentOrderCode;
    if (bankInfoEl) {
      bankInfoEl.textContent = paymentConfig.accountNumber;
    }
    if (qrImage) qrImage.classList.add("hidden");
    if (paymentStatusEl) paymentStatusEl.textContent = "Đang chờ thanh toán...";
    openPaymentModal();

    db.collection("orders").doc(currentOrderId).onSnapshot(async (snap) => {
      if (!snap.exists) return;
      const order = snap.data();
      if (order.status !== "paid") return;

      if (previewBlur) previewBlur.classList.remove("preview--blur");
      if (paymentStatusEl) paymentStatusEl.textContent = "Đã xác nhận thanh toán!";
      const pageSnap = await db.collection("love_pages").doc(order.page_id).get();
      if (pageSnap.exists) {
        const slug = pageSnap.data().slug;
        window.location.href = `love.html?slug=${slug}`;
      }
    });
  });
}

if (confirmPay) {
  confirmPay.addEventListener("click", async () => {
    if (!db || !currentOrderId) return;
    const orderSnap = await db.collection("orders").doc(currentOrderId).get();
    if (!orderSnap.exists) return;
    const order = orderSnap.data();
    if (order.status === "paid") {
      if (previewBlur) previewBlur.classList.remove("preview--blur");
      if (paymentStatusEl) paymentStatusEl.textContent = "Đã xác nhận thanh toán!";
      const pageSnap = await db.collection("love_pages").doc(order.page_id).get();
      if (pageSnap.exists) {
        const slug = pageSnap.data().slug;
        window.location.href = `love.html?slug=${slug}`;
        return;
      }
    } else {
      if (paymentStatusEl) paymentStatusEl.textContent = "Chưa thấy giao dịch. Vui lòng thử lại sau 10-30 giây.";
    }
  });
}

if (closePay) {
  closePay.addEventListener("click", closePaymentModal);
}

updateCountdown();
updateLoveDays();
setInterval(updateCountdown, 1000);
setInterval(createHearts, 600);

const params = new URLSearchParams(window.location.search);
const currentSlug = params.get("slug");
if (currentSlug && loveTitleEl) {
  if (db) {
    db.collection("love_pages")
      .where("slug", "==", currentSlug)
      .limit(1)
      .onSnapshot((snapshot) => {
        if (snapshot.empty) return;
        const page = snapshot.docs[0].data();
        loveSlugEl.textContent = `/love/${page.slug}`;
        loveTitleEl.textContent = `${page.your_name} ❤ ${page.partner_name}`;
        loveSubtitleEl.textContent = `"${page.message}"`;
        loveMessageEl.textContent = page.message;
        loveDaysEl.dataset.start = page.start_date;
        loveDateHintEl.textContent = `Tính từ ${new Date(page.start_date).toLocaleDateString("vi-VN")}`;
        updateLoveDays();
        setLockedState(!page.paid);
      });
  } else {
    const page = getLovePageBySlug(currentSlug);
    if (page) {
      loveSlugEl.textContent = `/love/${page.slug}`;
      loveTitleEl.textContent = `${page.your_name} ❤ ${page.partner_name}`;
      loveSubtitleEl.textContent = `"${page.message}"`;
      loveMessageEl.textContent = page.message;
      loveDaysEl.dataset.start = page.start_date;
      loveDateHintEl.textContent = `Tính từ ${new Date(page.start_date).toLocaleDateString("vi-VN")}`;
      updateLoveDays();
    }
  }
}

if (shareLinkBtn) {
  shareLinkBtn.addEventListener("click", () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    shareLinkBtn.textContent = "Đã copy link";
    setTimeout(() => {
      shareLinkBtn.textContent = "Chia sẻ link";
    }, 2000);
  });
}

function startAdminOrders() {
  if (!adminOrdersEl || !db) return;
  db.collection("orders")
    .orderBy("created_at", "desc")
    .onSnapshot((snapshot) => {
      adminOrdersEl.innerHTML = "";
      snapshot.forEach((doc) => {
        const order = doc.data();
        if (order.status !== "pending") return;
        const card = document.createElement("div");
        card.className = "admin-card";
        card.innerHTML = `
          <p><strong>${order.order_code}</strong></p>
          <p>Số tiền: ${order.amount.toLocaleString("vi-VN")}đ</p>
          <button class="btn btn--soft" data-id="${doc.id}">Xác nhận đã thanh toán</button>
        `;
        adminOrdersEl.appendChild(card);
      });

      adminOrdersEl.querySelectorAll("button[data-id]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          const orderSnap = await db.collection("orders").doc(id).get();
          if (!orderSnap.exists) return;
          const order = orderSnap.data();
          await db.collection("orders").doc(id).update({ status: "paid" });
          if (order.page_id) {
            await db.collection("love_pages").doc(order.page_id).update({ paid: true });
          }
        });
      });
    });
}

if (adminLoginForm && auth) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      adminSection?.classList.remove("hidden");
      adminLoginSection?.classList.add("hidden");
      startAdminOrders();
    } else {
      adminSection?.classList.add("hidden");
      adminLoginSection?.classList.remove("hidden");
    }
  });

  adminLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = adminEmailInput.value.trim();
    const password = adminPasswordInput.value.trim();
    if (!email || !password) return;
    try {
      await auth.signInWithEmailAndPassword(email, password);
      adminLoginStatus.textContent = "Đăng nhập thành công.";
    } catch (error) {
      adminLoginStatus.textContent = "Sai email hoặc mật khẩu.";
    }
  });
}

if (adminLogout && auth) {
  adminLogout.addEventListener("click", () => auth.signOut());
}
