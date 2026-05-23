import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'
import { connectDB } from './db'
import UserModel from '@/models/User'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        await connectDB()
        const user = await UserModel.findOne({ email: (credentials.email as string).toLowerCase() })
        if (!user || !user.passwordHash) return null
        if (!user.isEmailVerified) throw new Error('Please verify your email first')
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        if (!valid) return null
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus,
          avatar: user.avatar,
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })] : []),
    ...(process.env.GITHUB_CLIENT_ID ? [GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    })] : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        await connectDB()
        const existing = await UserModel.findOne({ email: user.email?.toLowerCase() })
        if (!existing) {
          await UserModel.create({
            name: user.name,
            email: user.email?.toLowerCase(),
            isEmailVerified: true,
            provider: account.provider,
            avatar: user.image,
            role: 'free_user',
            subscriptionStatus: 'free',
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.subscriptionStatus = (user as any).subscriptionStatus
      }
      // Re-fetch subscription status on each request so upgrades reflect immediately
      if (token.id) {
        await connectDB()
        const dbUser = await UserModel.findById(token.id).select('role subscriptionStatus').lean()
        if (dbUser) {
          token.role = (dbUser as any).role
          token.subscriptionStatus = (dbUser as any).subscriptionStatus
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.subscriptionStatus = token.subscriptionStatus as string
      }
      return session
    },
  },
})

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      subscriptionStatus: string
    }
  }
}
