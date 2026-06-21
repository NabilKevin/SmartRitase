const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
     throw new functions.https.HttpsError('permission-denied', 'Anda tidak memiliki izin.');
  }

  const { uid } = data;

  try {
    await admin.firestore().collection('users').doc(uid).delete();

    await admin.auth().deleteUser(uid);

    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});