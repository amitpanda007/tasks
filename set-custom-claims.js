
var admin = require("firebase-admin");
var uid = process.argv[2];

var serviceAccount = require("./scheduler-50762-firebase-adminsdk-gmkvz-295403ff47.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

admin.auth().setCustomUserClaims(uid, { admin: true})
    .then(() => {
        console.log('Custom claims set for the user', uid);
        process.exit();
    })
    .catch(error => {
        console.log('error', error);
        process.exit(1);
    })