import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

import { env } from '@/env.mjs';

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
  ],
});
