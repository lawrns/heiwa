// Script to set up admin users in Firebase Auth and Firestore
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';

// Firebase Admin SDK configuration using service account JSON
const serviceAccount = require('../heiwahousedashboard-firebase-adminsdk-fbsvc-547a5825b1.json');

// Admin email list
const ADMIN_EMAILS = [
  'admin@heiwahouse.com',
  'support@heiwahouse.com'
];

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: cert(serviceAccount as any),
  projectId: 'heiwahousedashboard'
});

const auth = getAuth(app);
const db = getFirestore(app);

async function setupAdminUsers() {
  console.log('Setting up admin users...');

  for (const email of ADMIN_EMAILS) {
    try {
      // Check if user already exists
      let user;
      try {
        user = await auth.getUserByEmail(email);
        console.log(`User ${email} already exists with UID: ${user.uid}`);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // Create new user
          const tempPassword = 'TempPass123!';
          user = await auth.createUser({
            email: email,
            password: tempPassword,
            displayName: email.split('@')[0]
          });
          console.log(`Created user ${email} with UID: ${user.uid}`);
          console.log(`TEMPORARY PASSWORD: ${tempPassword}`);
          console.log('Please reset this password immediately in Firebase Console!');
        } else {
          throw error;
        }
      }

      // Add/update admin document in Firestore
      const adminDoc = {
        isAdmin: true,
        name: email.split('@')[0].replace(/^\w/, c => c.toUpperCase()),
        email: email,
        phone: '',
        notes: 'Admin user',
        lastBookingDate: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await db.collection('clients').doc(user.uid).set(adminDoc, { merge: true });
      console.log(`Updated admin document for ${email}`);

    } catch (error) {
      console.error(`Error setting up ${email}:`, error);
    }
  }

  console.log('\nAdmin user setup complete!');
  console.log('IMPORTANT: Please reset the temporary passwords in Firebase Console immediately!');
  console.log('Firebase Console > Authentication > Users > [Select user] > Reset Password');

  process.exit(0);
}

setupAdminUsers().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
