import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "./api/index.js";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          console.log(
            "Attempting login with backend URL:",
            process.env.NEXT_PUBLIC_API_URL
          );
          const result = await authService.login({
            email: credentials.email,
            password: credentials.password,
          });

          console.log("Backend login result:", result);

          if (result.success && result.data) {
            const { token, user } = result.data;

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              accessToken: token,
            };
          }

          console.error("Login failed:", result.error);
          return null;
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signUp: "/signup",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
