import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { securityConfig } from "./config/security.js";
import { verifyCredentials } from "./server/credentials.js";

// Auth.js v5. JWT sessions keep the cookie small and stateless; the role stored in the token is only a
// convenience for the UI. Every protected page and action re-reads the user from MongoDB (see server/session.js),
// so deactivating an account or changing a role takes effect immediately.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: securityConfig.sessionMaxAgeSeconds },
  pages: { signIn: "/staff/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: (credentials) => verifyCredentials(credentials?.email, credentials?.password),
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.uid;
      return session;
    },
  },
});
