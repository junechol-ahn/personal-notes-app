import { betterAuth } from 'better-auth';
import { db } from './db';

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // optional
  },
  // We can specify table names if they differ from default, but defaults match our schema
});
