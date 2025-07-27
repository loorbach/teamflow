import { DrizzleAdapter } from "@auth/drizzle-adapter"
import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { db } from "./db/client"
import { users } from "./db/schema"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: { type: "email", label: "Email", placeholder: "m@example.com" },
        password: { type: "password", label: "Password", placeholder: "****" },
      },
      authorize: async (credentials) => {
        try {
          const parsedCredentials = z
            .object({ email: z.email(), password: z.string().min(6) })
            .safeParse(credentials);
  
          if (parsedCredentials.success) {
            const { email, password } = parsedCredentials.data;
            const user = await db.query.users.findFirst({
              where: eq(users.email, email.toLowerCase()),
            });

            console.log("in authorize block", parsedCredentials.success);

            if (!user) {
              throw new Error("Invalid credentials. No user.");
            }
    
            const passwordMatch = user.passwordHash && await bcrypt.compare(password, user.passwordHash);


            console.log("passwords match", passwordMatch);
    
            if (!passwordMatch) {
              throw new Error("Invalid credentials. No password Match.");
            }

            console.log("returning user", user);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
            }
          } else {
            throw new Error("Invalid input. else block");
          }
        } catch (err) {
          console.error(err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // TODO: add custom types and make this correct setup
      session.user = {
        ...session.user,
        id: token.id as string,
      };
      return session;
    },
  }
});
