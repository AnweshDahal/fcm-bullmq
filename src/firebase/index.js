var admin = require("firebase-admin");

var serviceAccount = require("../keys/firebase_admin_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
