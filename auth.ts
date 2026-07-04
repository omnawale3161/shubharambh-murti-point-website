import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {
  getCustomerCredentialByEmail,
  parseCredentials,
  verifyPassword
} from "@/lib/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const parsed = parseCredentials(credentials);
        if (!parsed) return null;

        const customer = await getCustomerCredentialByEmail(parsed.email);
        if (!customer || !(await verifyPassword(parsed.password, customer.password_hash))) return null;

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        };
      }
    })
  ],
  callbacks: {
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const target = new URL(url);
        if (target.origin === baseUrl) return url;
      } catch {
        return `${baseUrl}/account`;
      }
      return `${baseUrl}/account`;
    },
    jwt({ token, user }) {
      if (user) {
        token.customerId = user.id;
        token.phone = user.phone;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.customerId ?? token.sub ?? "");
        session.user.phone = typeof token.phone === "string" ? token.phone : "";
      }
      return session;
    }
  }
});
