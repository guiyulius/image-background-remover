// @ts-nocheck
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const runtime = 'edge'

const { handlers } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
})

export const GET = handlers.GET
export const POST = handlers.POST
