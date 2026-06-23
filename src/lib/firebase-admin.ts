import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const firebaseConfig = require('../../firebase-applet-config.json');

const PROJECT_ID: string = firebaseConfig.projectId;
const JWKS_URI = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const jwks = createRemoteJWKSet(new URL(JWKS_URI));

export interface DecodedIdToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  iss: string;
  aud: string | string[];
  sub: string;
  iat: number;
  exp: number;
  auth_time: number;
  firebase: {
    identities: Record<string, unknown>;
    sign_in_provider: string;
  };
}

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });

  return {
    uid: payload.sub!,
    email: payload['email'] as string | undefined,
    email_verified: payload['email_verified'] as boolean | undefined,
    name: payload['name'] as string | undefined,
    picture: payload['picture'] as string | undefined,
    iss: payload.iss!,
    aud: payload.aud as string,
    sub: payload.sub!,
    iat: payload.iat!,
    exp: payload.exp!,
    auth_time: payload['auth_time'] as number ?? payload.iat!,
    firebase: payload['firebase'] as DecodedIdToken['firebase'] ?? {
      identities: {},
      sign_in_provider: 'google.com',
    },
  };
}

export const adminAuth = {
  verifyIdToken,
};
