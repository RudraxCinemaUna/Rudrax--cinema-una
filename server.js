import express from "express";
import dotenv from "dotenv";
import crypto from "crypto";
import Razorpay from "razorpay";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Database(path.join(__dirname, "rudrax.sqlite"));
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  show_date TEXT NOT NULL,
  show_time TEXT NOT NULL,
  seats_json TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bookings_show ON bookings(show_date, show_time);
`);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

function bookingCode() {
  return "RDX" + Date.now().toString(36).toUpperCase() + crypto.randomBytes(3).toString("hex").toUpperCase();
}

function verifySignature(orderId, paymentId, signature) {
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature || "", "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function verifyWebhook(rawBody, signature) {
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature || "", "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Razorpay webhook needs the RAW body.
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), (req, res) => {
  try {
    if (!verifyWebhook(req.body, req.headers["x-razorpay-signature"])) return res.status(400).send("Invalid signature");
    const event = JSON.parse(req.body.toString("utf8"));
    const payment = event?.payload?.payment?.entity;
    const orderId = payment?.order_id;
    if (orderId && event.event === "payment.captured") {
      db.prepare(`UPDATE bookings SET status='CONFIRMED', razorpay_payment_id=COALESCE(razorpay_payment_id, ?), updated_at=CURRENT_TIMESTAMP WHERE razorpay_order_id=?`)
        .run(payment.id, orderId);
    }
    if (orderId && event.event === "payment.failed") {
      db.prepare(`UPDATE bookings SET status='PAYMENT_FAILED', updated_at=CURRENT_TIMESTAMP WHERE razorpay_order_id=? AND status!='CONFIRMED'`)
        .run(orderId);
    }
    return res.sendStatus(200);
  } catch {
    return res.status(400).send("Bad webhook");
  }
});

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/config", (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || "",
    cinemaName: process.env.CINEMA_NAME || "Rudrax Cinema",
    city: process.env.CINEMA_CITY || "Una, Gujarat",
    currency: process.env.CURRENCY || "INR"
  });
});

app.post("/api/bookings/create-order", async (req, res) => {
  try {
    const { name, phone, email = "", showDate, showTime, seats, amount } = req.body;
    if (!name || !phone || !showDate || !showTime || !Array.isArray(seats) || seats.length < 1 || !Number.isInteger(amount) || amount < 1) {
      return res.status(400).json({ error: "Invalid booking details" });
    }
    const duplicate = db.prepare(`SELECT booking_id FROM bookings WHERE show_date=? AND show_time=? AND status IN ('PENDING','CONFIRMED') AND EXISTS (SELECT 1 FROM json_each(seats_json) WHERE value IN (${seats.map(() => "?").join(",")}))`)
      .get(showDate, showTime, ...seats);
    if (duplicate) return res.status(409).json({ error: "One or more selected seats are already booked." });

    const bookingId = bookingCode();
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: process.env.CURRENCY || "INR",
      receipt: bookingId,
      notes: { booking_id: bookingId, show_date: showDate, show_time: showTime }
    });
    db.prepare(`INSERT INTO bookings (booking_id,name,phone,email,show_date,show_time,seats_json,amount,status,razorpay_order_id) VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .run(bookingId, name.trim(), phone.trim(), email.trim(), showDate, showTime, JSON.stringify(seats), amount, "PENDING", order.id);
    res.json({ bookingId, orderId: order.id, amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not create payment order" });
  }
});

app.post("/api/payment/verify", (req, res) => {
  try {
    const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const row = db.prepare(`SELECT * FROM bookings WHERE booking_id=?`).get(bookingId);
    if (!row || row.razorpay_order_id !== razorpay_order_id) return res.status(400).json({ error: "Booking/order mismatch" });
    if (!verifySignature(row.razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ error: "Payment verification failed" });
    }
    db.prepare(`UPDATE bookings SET status='CONFIRMED', razorpay_payment_id=?, razorpay_signature=?, updated_at=CURRENT_TIMESTAMP WHERE booking_id=?`)
      .run(razorpay_payment_id, razorpay_signature, bookingId);
    const updated = db.prepare(`SELECT booking_id,name,phone,email,show_date,show_time,seats_json,amount,status FROM bookings WHERE booking_id=?`).get(bookingId);
    res.json({ ok: true, booking: { ...updated, seats: JSON.parse(updated.seats_json) } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Verification error" });
  }
});

app.get("/api/bookings/:bookingId", (req, res) => {
  const row = db.prepare(`SELECT booking_id,name,show_date,show_time,seats_json,amount,status,created_at FROM bookings WHERE booking_id=?`).get(req.params.bookingId);
  if (!row) return res.status(404).json({ error: "Booking not found" });
  res.json({ ...row, seats: JSON.parse(row.seats_json) });
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`Rudrax Cinema running on http://localhost:${PORT}`));
