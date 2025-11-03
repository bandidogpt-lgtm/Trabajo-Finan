import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import db from '@/lib/db'
import bcrypt from 'bcryptjs'

const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials:{
                email: { label: "Correo", type: "text", placeholder:"usuario@gmail.com"},
                password: { label: "Contraseña", type: "password", placeholder:"**********"}
            },
            async authorize(credentials, req) {
                console.log(credentials)

                const usuarioBuscado = await db.usuario.findUnique({
                    where: {correo: credentials?.email}
                })

                if (!usuarioBuscado) return null
                console.log(usuarioBuscado);

                const flagClave = await bcrypt.compare(credentials!.password,usuarioBuscado.clave);
                console.log("FLAG: ",flagClave);

                if(!flagClave) return null;

                return {
                    id: usuarioBuscado.id,
                    nombre: usuarioBuscado.nombre,
                    correo: usuarioBuscado.correo,
                }
            },
        }),
    ],
};

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST}