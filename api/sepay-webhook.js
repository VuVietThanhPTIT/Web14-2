const admin = require("firebase-admin");

let app;
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON");
  }
  const serviceAccount = JSON.parse(serviceAccountJson);
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

function getApiKey(req) {
  return (
    req.headers["x-api-key"] ||
    req.headers["apikey"] ||
    req.headers["api-key"] ||
    ""
  );
}

function extractOrderCode(payload) {
  const raw = JSON.stringify(payload);
  const match = raw.match(/LOVE_[A-Z0-9]+/i);
  return match ? match[0].toUpperCase() : null;
}

function extractAmount(payload) {
  const candidates = [
    payload?.amount,
    payload?.data?.amount,
    payload?.data?.transferAmount,
    payload?.data?.creditAmount,
    payload?.data?.transactionAmount
  ];
  for (const value of candidates) {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim()) {
      const num = Number(value.replace(/[^0-9.-]/g, ""));
      if (!Number.isNaN(num)) return num;
    }
  }
  return null;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expectedKey = process.env.SEPAY_WEBHOOK_KEY;
  const providedKey = getApiKey(req);
  if (!expectedKey || providedKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const payload = req.body || {};
  const orderCode = extractOrderCode(payload);
  if (!orderCode) {
    return res.status(200).json({ status: "ignored", reason: "no order code" });
  }

  const amount = extractAmount(payload);

  const orderQuery = await db
    .collection("orders")
    .where("order_code", "==", orderCode)
    .limit(1)
    .get();

  if (orderQuery.empty) {
    return res.status(200).json({ status: "ignored", reason: "order not found" });
  }

  const orderDoc = orderQuery.docs[0];
  const orderData = orderDoc.data();

  if (amount && Number(orderData.amount) && Number(orderData.amount) !== Number(amount)) {
    return res.status(200).json({ status: "ignored", reason: "amount mismatch" });
  }

  if (orderData.status === "paid") {
    return res.status(200).json({ status: "ok", message: "already paid" });
  }

  await db.collection("orders").doc(orderDoc.id).update({
    status: "paid",
    paid_at: admin.firestore.FieldValue.serverTimestamp()
  });

  if (orderData.page_id) {
    await db.collection("love_pages").doc(orderData.page_id).update({
      paid: true,
      paid_at: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  return res.status(200).json({ status: "ok" });
};
