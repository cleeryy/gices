// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/db/prisma";
import { validateUserId, validatePassword } from "@/utils/auth/validation";
import { comparePassword } from "@/utils/auth/password";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        id: {
          label: "ID",
          type: "text",
          placeholder: "4 letters only",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "8 characters only",
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.id || !credentials?.password) {
            console.log("❌ Credentials manquantes");
            return null;
          }

          if (!validateUserId(credentials.id)) {
            console.log("❌ Format ID invalide:", credentials.id);
            return null;
          }

          if (!validatePassword(credentials.password)) {
            console.log("❌ Format password invalide");
            return null;
          }

          credentials.id = credentials.id.toUpperCase();

          const user = await prisma.user.findUnique({
            where: {
              id: credentials.id,
              isActive: true,
            },
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          });

          if (!user) {
            console.log("❌ Utilisateur non trouvé:", credentials.id);
            return null;
          }

          const isPasswordValid = await comparePassword(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log("❌ Mot de passe invalide pour:", credentials.id);
            return null;
          }

          console.log("✅ Connexion réussie pour:", user.id);

          return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email || null,
            firstName: user.firstName,
            lastName: user.lastName,
            service: user.service,
            serviceId: user.serviceId,
          };
        } catch (error) {
          console.error("💥 Erreur d'authentification:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("🎟️ Création JWT pour:", user.id);
        token.id = user.id;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.service = (user as any).service;
        token.serviceId = (user as any).serviceId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        console.log("🔒 Création session pour:", token.id);
        (session.user as any).id = token.id;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
        (session.user as any).service = token.service;
        (session.user as any).serviceId = token.serviceId;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt", // 🔥 JWT seulement, pas besoin d'adapter
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};
