# Rudrax Cinema Online Booking

Full-stack starter: HTML/CSS/JavaScript frontend + Node.js/Express backend + SQLite database + Razorpay payment verification.

## Run
1. Install Node.js 22.2+.
2. Open this folder in terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Put your Razorpay **Test Mode** Key ID and Key Secret in `.env`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

## Production
- Use HTTPS.
- Use Razorpay Live API keys only after testing.
- Configure Razorpay auto-capture.
- Add the webhook URL `https://YOUR-DOMAIN/api/payment/webhook` and the same webhook secret in `.env`.
- Never put `RAZORPAY_KEY_SECRET` in frontend JavaScript.
- For real seat locking at scale, add a short seat-hold/expiry transaction and an admin panel.
- WhatsApp/SMS notifications can be added using an approved provider.

The backend verifies the Razorpay signature before marking a booking CONFIRMED and also accepts `payment.captured` webhook events.
