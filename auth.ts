import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {
  getCustomerCredentialByEmail,
  parseCredentials,
  verifyPassword
} from "@/lib/auth";
import { MissingSupabaseConfigurationError, SupabaseServerRequestError } from "@/lib/supabase/server";

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

        try {
          const customer = await getCustomerCredentialByEmail(parsed.email);
          if (!customer) {
            console.warn("Customer login failed: no account found for email.");
            return null;
          }

          if (!(await verifyPassword(parsed.password, customer.password_hash))) {
            console.warn("Customer login failed: password did not match stored hash.");
            return null;
          }

          return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone
          };
        } catch (error) {
          if (error instanceof MissingSupabaseConfigurationError) {
            console.error("Customer login failed: missing Supabase configuration.", error.missingVariables);
          } else if (error instanceof SupabaseServerRequestError) {
            console.error("Customer login failed: Supabase request error.", {
              status: error.status,
              responseBody: error.responseBody
            });
          } else {
            console.error("Customer login failed: unexpected authentication error.", error);
          }

          throw error;
        }
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
