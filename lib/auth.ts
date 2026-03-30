// Auth.js 配置
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
}

const { handlers } = NextAuth(authOptions)

export { handlers as GET, handlers as POST }
