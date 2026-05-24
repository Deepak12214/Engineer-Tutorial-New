import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// Explicit property access instead of destructuring — required for webpack static export analysis
const nextAuthInstance = NextAuth(authConfig)
export const auth = nextAuthInstance.auth
export const signIn = nextAuthInstance.signIn
export const signOut = nextAuthInstance.signOut
