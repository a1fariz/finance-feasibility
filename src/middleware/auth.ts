import { Request, Response, NextFunction } from 'express';
import { adminAuth, DecodedIdToken } from '../lib/firebase-admin.js';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // Sandbox/Demo Token Bypass for iframe and development environments
  if (token.startsWith('demo-')) {
    const demoUid = token;
    const demoEmail = 'sandbox-developer@example.com';
    req.user = {
      uid: demoUid,
      email: demoEmail,
      email_verified: true,
      name: 'Sandbox Developer',
      picture: 'https://lh3.googleusercontent.com/a/default-user',
      auth_time: Math.floor(Date.now() / 1000),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: 'https://securetoken.google.com/demo',
      aud: 'demo',
      sub: demoUid,
      firebase: {
        identities: {},
        sign_in_provider: 'custom'
      }
    } as DecodedIdToken;
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
