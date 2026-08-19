RUDRAX CINEMA — CUSTOMER REQUEST → ADMIN CONFIRMATION

WORKFLOW
1. Customer uses index.html.
2. Customer selects movie/date/show/seats and enters name + mobile.
3. Customer taps "Send Booking Request".
4. WhatsApp opens with the request details to Rudrax Cinema's configured WhatsApp number.
5. The request is NOT automatically saved as a confirmed booking and does NOT make seats grey.
6. Admin opens admin.html, selects the same movie/date/show and the requested seats.
7. Admin taps "Confirm Booking".
8. The confirmed booking is saved in Firebase Firestore.
9. index.html listens to Firestore in real time. Confirmed seats become Grey/Sold for customers on other devices too.

FILES
- index.html              Customer booking/request website
- admin.html              Admin confirmation website
- firebase-config.js      Your Firebase Web App configuration
- firestore.rules         TESTING rules
- README.txt              This guide

FIREBASE SETUP
1. Create a Firebase project.
2. Register a Web App.
3. Copy the firebaseConfig object into firebase-config.js.
4. Create Firestore Database.
5. Apply firestore.rules for testing.
6. Host index.html, admin.html and firebase-config.js on GitHub Pages.

SECURITY WARNING
The included Firestore rules are for TESTING ONLY and allow public read/write.
Before real public use, add Firebase Authentication and make only the Admin account
allowed to create/delete confirmed bookings. Do not put service-account/private keys
in the website.

IMPORTANT
- The customer request is sent through WhatsApp.
- Only Admin confirmation creates a real online booking.
- The customer website does not automatically reserve pending requests.
