import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isAllowedEmail, isAllowedGoogleSignIn } from "@/lib/auth-allowlist";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/admin/sign-in",
  },
  providers: [Google],
  callbacks: {
    signIn({ account, user }) {
      return isAllowedGoogleSignIn({
        provider: account?.provider,
        email: user.email,
      });
    },
    authorized({ auth: session, request }) {
      if (request.nextUrl.pathname === "/admin/sign-in") {
        return true;
      }

      return isAllowedEmail(session?.user?.email);
    },
  },
});
