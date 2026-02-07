import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite', // drizzle-orm/sqlite-core
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
});
