import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// This instance is for reading sessions in server components only.
// The [...nextauth] route has its own NextAuth instance with full providers.
export const { auth, signIn, signOut } = NextAuth(authConfig)
