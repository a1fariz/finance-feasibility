import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const firebaseConfig = require('../../firebase-applet-config.json');

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export const adminAuth = getAuth();
export type { DecodedIdToken } from 'firebase-admin/auth';
