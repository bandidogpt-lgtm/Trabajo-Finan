import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Correo", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const usuarioBuscado = await db.usuario.findUnique({
          where: { correo: credentials?.email },
        });

        if (!usuarioBuscado) return null;

        const flagClave = await bcrypt.compare(
          credentials!.password,
          usuarioBuscado.clave
        );

        if (!flagClave) return null;

        return {
          id: String(usuarioBuscado.id),
          name: usuarioBuscado.nombre,
          email: usuarioBuscado.correo,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);