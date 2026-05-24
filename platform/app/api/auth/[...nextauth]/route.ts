export const dynamic = 'force-dynamic'

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const nextAuth = NextAuth({
  secret: process.env.NEXTAUTH_SECRET ?? 'engineertutorial-dev-fallback-secret-key',
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', error: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const { connectDB } = await import('@/lib/db')
          const { default: UserModel } = await import('@/models/User')
          const { default: bcrypt } = await import('bcryptjs')
          await connectDB()
          const user = await UserModel.findOne({
            email: String(credentials.email).toLowerCase(),
          })
          if (!user || !user.passwordHash) return null
          if (!user.isEmailVerified) throw new Error('Please verify your email first')
          const valid = await bcrypt.compare(String(credentials.password), user.passwordHash)
          if (!valid) return null
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            subscriptionStatus: user.subscriptionStatus,
          }
        } catch (err: any) {
          if (err?.message === 'Please verify your email first') throw err
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.subscriptionStatus = (user as any).subscriptionStatus
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      session.user.subscriptionStatus = token.subscriptionStatus as string
      return session
    },
  },
})

export const GET = nextAuth.handlers.GET
export const POST = nextAuth.handlers.POST
