const admin = require('firebase-admin');
// Download this JSON from Firebase Console > Project Settings > Service Accounts
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Replace with your UID (find it in Firebase Auth console)
const uid = "PASTE_YOUR_UID_HERE";

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("Success! You are now an admin.");
    process.exit();
  })
  .catch(error => console.log(error));