RUDRAX CINEMA - ONLINE BOOKING SETUP

1. Create a Firebase project and register a Web App.
2. Copy your firebaseConfig into firebase-config.js.
3. Create Firestore Database.
4. For TESTING ONLY, use the rules in firestore.rules.
5. Upload admin.html, index.html and firebase-config.js to GitHub Pages.
6. admin.html and index.html must be hosted under the same GitHub Pages site/origin for the easiest setup.
7. Bookings are stored in Firestore, not localStorage.
8. When Admin creates/deletes a booking, index.html receives the change in real time.
9. The current rules allow anyone who knows the database endpoint to read/write bookings.
   Before real public use, add Firebase Authentication and secure the rules so only the admin can write/delete.

Important:
- firebase-config.js contains a web app configuration, not a service-account private key.
- Never put a Firebase service-account JSON/private key in these HTML files.
